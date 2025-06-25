use serde::{Deserialize, Serialize};
use std::str::FromStr;
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema)]
pub struct Collective {
    pub id: i64,
    pub name: Option<String>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct Person {
    pub id: i64,
    pub display_name: String,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct Interval {
    pub id: i64,
    pub start_date: String,
    pub end_date: String,
}

#[derive(Serialize, Deserialize, ToSchema, sqlx::Type)]
pub enum InvolvementStatus {
    Participating,
    OnHiatus,
}

impl FromStr for InvolvementStatus {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Participating" => Ok(InvolvementStatus::Participating),
            "OnHiatus" => Ok(InvolvementStatus::OnHiatus),
            _ => Err(()),
        }
    }
}

impl TryFrom<String> for InvolvementStatus {
    type Error = ();

    fn try_from(value: String) -> Result<Self, Self::Error> {
        InvolvementStatus::from_str(&value)
    }
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct CrewInvolvement {
    pub id: i64,
    pub person_id: i64,
    pub crew_id: i64,
    pub interval_id: i64,
    pub status: InvolvementStatus,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct CollectiveInvolvement {
    pub id: i64,
    pub person_id: i64,
    pub collective_id: i64,
    pub interval_id: i64,
    pub status: InvolvementStatus,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct Crew {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
}
