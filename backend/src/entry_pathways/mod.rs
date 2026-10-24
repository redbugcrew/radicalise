use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use resend_rs::Resend;
use serde::Serialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::{
    entry_pathways::repo::find_eoi_by_auth_token,
    people::repo::find_crew_involved_emails,
    realtime::RealtimeState,
    shared::{
        db_helpers::is_constraint_violation,
        entities::{CrewId, EntryPathway, ExpressionOfInterest, Interval, Project, ProjectId},
        events::AppEvent,
    },
};

mod emails;
pub mod events;
pub mod repo;

#[derive(ToSchema, Debug, Serialize)]
enum EoiError {
    ProjectNotFound,
    EoiNotFound,
    EoiFeatureDisabled,
    EmailAlreadyExists,
}

async fn broadcast_entry_pathway_updated(entry_pathway: &EntryPathway, realtime_state: &RealtimeState) {
    let event = events::EntryPathwayEvent::EntryPathwayUpdated(entry_pathway.clone());
    realtime_state.broadcast_app_event(None, AppEvent::EntryPathwayEvent(event)).await;
}

async fn send_notification_of_new_eoi(
    project: &Project,
    current_interval: &Interval,
    resend: &Resend,
    pool: &SqlitePool,
) -> Result<(), anyhow::Error> {
    match project.eoi_managing_crew_id {
        None => {
            println!(
                "No EOI managing crew set for project ID {}, skipping notification email.",
                project.id
            );
            Ok(())
        }
        Some(crew_id) => {
            let emails = find_crew_involved_emails(CrewId::new(crew_id), current_interval.typed_id(), pool).await?;

            if emails.is_empty() {
                println!(
                    "No people found in crew ID {} for project ID {}, skipping notification email.",
                    crew_id, project.id
                );
                return Ok(());
            }

            let email = emails::eoi_received_notification_email(emails, project.noun_name.clone());

            resend.emails.send(email).await?;

            Ok(())
        }
    }
}
