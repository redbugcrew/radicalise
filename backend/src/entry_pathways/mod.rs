use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use resend_rs::Resend;
use serde::Serialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::{
    entry_pathways::repo::find_eoi_by_auth_token,
    my_collective::repo::find_collective,
    people::repo::find_crew_involved_emails,
    realtime::RealtimeState,
    shared::{
        db_helpers::is_constraint_violation,
        entities::{
            Collective, CollectiveId, CrewId, EntryPathway, ExpressionOfInterest, Interval,
        },
        events::AppEvent,
    },
};

mod emails;
pub mod events;
pub mod repo;

#[derive(ToSchema, Debug, Serialize)]
enum EoiError {
    CollectiveNotFound,
    EoiNotFound,
    EoiFeatureDisabled,
    EmailAlreadyExists,
}

#[utoipa::path(
    post,
    path = "/eoi",
    responses(
        (status = 201, body = ()),
        (status = BAD_REQUEST, body = EoiError),
        (status = INTERNAL_SERVER_ERROR, body = ()),
    ),
    request_body(content = ExpressionOfInterest, content_type = "application/json")
)]
pub async fn create_eoi(
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    Extension(resend): Extension<Resend>,
    axum::extract::Json(submission): axum::extract::Json<ExpressionOfInterest>,
) -> impl IntoResponse {
    println!("Creating EOI for details: {:?}", submission);

    let collective = match find_collective(CollectiveId::new(submission.collective_id), &pool).await
    {
        Ok(result) => result,
        Err(_) => {
            eprintln!("Collective not found for ID: {}", submission.collective_id);
            return (StatusCode::BAD_REQUEST, Json(EoiError::CollectiveNotFound)).into_response();
        }
    };

    let current_interval = match crate::intervals::repo::find_current_interval(
        CollectiveId::new(submission.collective_id),
        &pool,
    )
    .await
    {
        Ok(interval) => interval,
        Err(e) => {
            eprintln!(
                "Failed to find current interval for collective ID {}: {}",
                submission.collective_id, e
            );
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    };

    if !collective.feature_eoi {
        return (StatusCode::BAD_REQUEST, Json(EoiError::EoiFeatureDisabled)).into_response();
    }

    let auth_token = Uuid::new_v4().to_string();
    let email = submission.email.clone();

    match repo::create_eoi(submission, auth_token.clone(), &pool).await {
        Ok(entry_pathway) => {
            broadcast_entry_pathway_updated(&entry_pathway, &realtime_state).await;

            if let Some(slug) = collective.slug.clone() {
                let email = emails::manage_your_eoi_email(email, slug, auth_token);
                let result = resend.emails.send(email).await;
                match result {
                    Ok(_) => println!("EOI management email sent successfully."),
                    Err(e) => eprintln!("Failed to send EOI management email: {}", e),
                }
            }

            match send_notification_of_new_eoi(&collective, &current_interval, &resend, &pool).await
            {
                Ok(_) => println!("Notification email for new EOI sent successfully."),
                Err(e) => eprintln!("Failed to send notification email for new EOI: {}", e),
            }

            return (StatusCode::CREATED, ()).into_response();
        }
        Err(e) => {
            if is_constraint_violation(&e) {
                return (StatusCode::BAD_REQUEST, Json(EoiError::EmailAlreadyExists))
                    .into_response();
            }

            eprintln!("Failed to create EOI: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, ())
        }
    }
    .into_response()
}

#[utoipa::path(
    put,
    path = "/collective/{collective_id}/eoi/{auth_token}",
    params(
        ("auth_token" = String, Path, description = "Authentication token for the entry pathway"),
        ("collective_id" = i64, Path, description = "Collective ID for the entry pathway")
    ),
    responses(
        (status = 200, body = ()),
        (status = BAD_REQUEST, body = EoiError),
        (status = INTERNAL_SERVER_ERROR, body = ()),
    ),
    request_body(content = ExpressionOfInterest, content_type = "application/json")
)]
pub async fn update_eoi(
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    Path((collective_id, auth_token)): Path<(i64, String)>,
    Json(submission): Json<ExpressionOfInterest>,
) -> impl IntoResponse {
    println!("Updating EOI for details: {:?}", submission);

    let eoi = match find_eoi_by_auth_token(CollectiveId::new(collective_id), &auth_token, &pool)
        .await
    {
        Ok(Some(result)) => result,
        Ok(None) => return (StatusCode::BAD_REQUEST, Json(EoiError::EoiNotFound)).into_response(),
        Err(_) => return (StatusCode::BAD_REQUEST, Json(EoiError::EoiNotFound)).into_response(),
    };

    let record_to_write = ExpressionOfInterest {
        id: eoi.id,
        collective_id: eoi.collective_id,
        name: submission.name,
        email: submission.email,
        interest: submission.interest,
        context: submission.context,
        referral: submission.referral,
        conflict_experience: submission.conflict_experience,
        participant_connections: submission.participant_connections,
    };

    match repo::update_eoi(record_to_write, &pool).await {
        Ok(entry_pathway) => {
            broadcast_entry_pathway_updated(&entry_pathway, &realtime_state).await;
            return (StatusCode::OK, ()).into_response();
        }
        Err(e) => {
            if is_constraint_violation(&e) {
                return (StatusCode::BAD_REQUEST, Json(EoiError::EmailAlreadyExists))
                    .into_response();
            }

            eprintln!("Failed to create EOI: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, ())
        }
    }
    .into_response()
}

#[utoipa::path(
    delete,
    path = "/collective/{collective_id}/eoi/{auth_token}",
    params(
        ("auth_token" = String, Path, description = "Authentication token for the entry pathway"),
        ("collective_id" = i64, Path, description = "Collective ID for the entry pathway")
    ),
    responses(
        (status = 200, body = ()),
        (status = BAD_REQUEST, body = ()),
    )
)]
pub async fn delete_eoi(
    Extension(pool): Extension<SqlitePool>,
    Path((collective_id, auth_token)): Path<(i64, String)>,
) -> impl IntoResponse {
    println!(
        "Deleting EOI for collective ID: {}, auth token: {}",
        collective_id, auth_token
    );
    match repo::delete_eoi_record(&pool, auth_token, CollectiveId::new(collective_id)).await {
        Ok(_) => {
            return (StatusCode::OK, ());
        }
        Err(e) => {
            eprintln!("Failed to delete EOI: {}", e);
            return (StatusCode::BAD_REQUEST, ());
        }
    }
}

#[utoipa::path(
    get,
    path = "/collective/{collective_id}/interest/by_auth_token/{auth_token}",
    params(
        ("auth_token" = String, Path, description = "Authentication token for the entry pathway"),
        ("collective_id" = i64, Path, description = "Collective ID for the entry pathway")
    ),
    responses(
        (status = OK, body = ExpressionOfInterest),
        (status = NOT_FOUND, description = "Entry pathway not found", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ())
    ),
)]
pub async fn get_eoi_by_auth_token(
    Path((collective_id, auth_token)): Path<(i64, String)>,
    Extension(pool): Extension<SqlitePool>,
) -> impl IntoResponse {
    let result = find_eoi_by_auth_token(CollectiveId::new(collective_id), &auth_token, &pool).await;
    match result {
        Ok(Some(eoi)) => {
            return (StatusCode::OK, Json(eoi)).into_response();
        }
        Ok(None) => {
            println!("No entry pathway found for auth token: {}", auth_token);
            return (StatusCode::NOT_FOUND, ()).into_response();
        }
        Err(e) => {
            eprintln!("Failed to find entry pathway by auth token: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    }
}

async fn broadcast_entry_pathway_updated(
    entry_pathway: &EntryPathway,
    realtime_state: &RealtimeState,
) {
    let event = events::EntryPathwayEvent::EntryPathwayUpdated(entry_pathway.clone());
    realtime_state
        .broadcast_app_event(None, AppEvent::EntryPathwayEvent(event))
        .await;
}

async fn send_notification_of_new_eoi(
    collective: &Collective,
    current_interval: &Interval,
    resend: &Resend,
    pool: &SqlitePool,
) -> Result<(), anyhow::Error> {
    match collective.eoi_managing_crew_id {
        None => {
            println!(
                "No EOI managing crew set for collective ID {}, skipping notification email.",
                collective.id
            );
            return Ok(());
        }
        Some(crew_id) => {
            let emails =
                find_crew_involved_emails(CrewId::new(crew_id), current_interval.typed_id(), pool)
                    .await?;

            if emails.is_empty() {
                println!(
                    "No people found in crew ID {} for collective ID {}, skipping notification email.",
                    crew_id, collective.id
                );
                return Ok(());
            }

            let email =
                emails::eoi_received_notification_email(emails, collective.noun_name.clone());

            resend.emails.send(email).await?;

            return Ok(());
        }
    }
}
