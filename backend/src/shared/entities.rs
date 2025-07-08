use serde::{Deserialize, Serialize};
use std::{clone, str::FromStr};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema)]
pub struct Collective {
    pub id: i64,
    pub name: Option<String>,
    pub description: Option<String>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct Person {
    pub id: i64,
    pub display_name: String,
}

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub struct Interval {
    pub id: i64,
    pub start_date: String,
    pub end_date: String,
}

#[derive(Serialize, Deserialize, ToSchema, sqlx::Type, Clone, Debug)]
pub enum InvolvementStatus {
    Participating,
    OnHiatus,
    Exiting,
}

impl FromStr for InvolvementStatus {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Participating" => Ok(InvolvementStatus::Participating),
            "OnHiatus" => Ok(InvolvementStatus::OnHiatus),
            "Exiting" => Ok(InvolvementStatus::Exiting),
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

#[derive(Serialize, Deserialize, ToSchema, sqlx::Type, clone::Clone)]
pub enum ParticipationIntention {
    OptIn,
    OptOut,
}

impl FromStr for ParticipationIntention {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "OptIn" => Ok(ParticipationIntention::OptIn),
            "OptOut" => Ok(ParticipationIntention::OptOut),
            _ => Err(()),
        }
    }
}

impl TryFrom<String> for ParticipationIntention {
    type Error = ();

    fn try_from(value: String) -> Result<Self, Self::Error> {
        ParticipationIntention::from_str(&value)
    }
}

#[derive(Serialize, Deserialize, ToSchema, sqlx::Type)]
pub enum OptOutType {
    Hiatus,
    Exit,
}

impl FromStr for OptOutType {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Hiatus" => Ok(OptOutType::Hiatus),
            "Exit" => Ok(OptOutType::Exit),
            _ => Err(()),
        }
    }
}

impl TryFrom<String> for OptOutType {
    type Error = ();

    fn try_from(value: String) -> Result<Self, Self::Error> {
        OptOutType::from_str(&value)
    }
}

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct CrewInvolvement {
    pub id: i64,
    pub person_id: i64,
    pub crew_id: i64,
    pub interval_id: i64,
    pub convenor: bool,
    pub volunteered_convenor: bool,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct CollectiveInvolvement {
    pub id: i64,
    pub person_id: i64,
    pub collective_id: i64,
    pub interval_id: i64,
    pub status: InvolvementStatus,
    pub capacity_score: Option<i64>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct CollectiveInvolvementWithDetails {
    pub id: i64,
    pub person_id: i64,
    pub collective_id: i64,
    pub interval_id: i64,
    pub status: InvolvementStatus,
    pub private_capacity_planning: bool,
    pub wellbeing: Option<String>,
    pub focus: Option<String>,
    pub capacity_score: Option<i64>,
    pub capacity: Option<String>,
    pub participation_intention: Option<ParticipationIntention>,
    pub opt_out_type: Option<OptOutType>,
    pub opt_out_planned_return_date: Option<String>,
}

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct Crew {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
}

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub struct Link {
    pub id: i64,
    pub link_type: String,
    pub url: String,
}

#[derive(Clone)]
#[allow(dead_code)]
pub struct LinkWithOwner {
    pub id: i64,
    pub link_type: String,
    pub url: String,
    pub owner_id: i64,
    pub owner_type: String,
}

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct CrewWithLinks {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub links: Option<Vec<Link>>,
}
