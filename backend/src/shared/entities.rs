use serde::{Deserialize, Serialize};
use std::str::FromStr;
use utoipa::ToSchema;

#[derive(Clone, Debug, PartialEq)]
pub struct CollectiveId {
    pub id: i64,
}

impl CollectiveId {
    pub fn new(id: i64) -> Self {
        CollectiveId { id }
    }
}

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub struct Collective {
    pub id: i64,
    pub name: Option<String>,
    pub noun_name: Option<String>,
    pub description: Option<String>,
    pub links: Vec<Link>,
    pub slug: Option<String>,
    pub feature_eoi: bool,
    pub eoi_description: Option<String>,
    pub eoi_managing_crew_id: Option<i64>,
}

impl Collective {
    pub fn typed_id(&self) -> CollectiveId {
        CollectiveId { id: self.id }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct UserId {
    pub id: i64,
}

impl UserId {
    pub fn new(id: i64) -> Self {
        UserId { id }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct PersonId {
    pub id: i64,
}

impl PersonId {
    pub fn new(id: i64) -> Self {
        PersonId { id }
    }
}

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub struct Person {
    pub id: i64,
    pub collective_id: i64,
    pub display_name: String,
    pub about: Option<String>,
    pub avatar_id: Option<i64>,
}

impl Person {
    pub fn typed_id(&self) -> PersonId {
        PersonId::new(self.id)
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct IntervalId {
    pub id: i64,
}

impl IntervalId {
    pub fn new(id: i64) -> Self {
        IntervalId { id }
    }
}

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub struct Interval {
    pub id: i64,
    pub start_date: String,
    pub end_date: String,
}

impl Interval {
    pub fn typed_id(&self) -> IntervalId {
        IntervalId::new(self.id)
    }
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

#[derive(Serialize, Deserialize, ToSchema, sqlx::Type, Clone, Debug)]
pub enum AttendanceIntention {
    Going,
    Uncertain,
    NotGoing,
}

impl FromStr for AttendanceIntention {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Going" => Ok(AttendanceIntention::Going),
            "Uncertain" => Ok(AttendanceIntention::Uncertain),
            "NotGoing" => Ok(AttendanceIntention::NotGoing),
            _ => Err(()),
        }
    }
}

impl TryFrom<String> for AttendanceIntention {
    type Error = ();

    fn try_from(value: String) -> Result<Self, Self::Error> {
        AttendanceIntention::from_str(&value)
    }
}

#[derive(Serialize, Deserialize, ToSchema, sqlx::Type, Debug, Clone)]
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

#[derive(Serialize, Deserialize, ToSchema, sqlx::Type, Debug, Clone)]
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

#[derive(Clone, Debug, PartialEq)]
pub struct CrewId {
    pub id: i64,
}

impl CrewId {
    pub fn new(id: i64) -> Self {
        CrewId { id }
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

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug, sqlx::Type, sqlx::Decode)]
pub struct CapacityPlanning {
    pub wellbeing: Option<String>,
    pub focus: Option<String>,
    pub capacity: Option<String>,
}

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct CollectiveInvolvement {
    pub id: i64,
    pub person_id: i64,
    pub collective_id: i64,
    pub interval_id: i64,
    pub status: InvolvementStatus,
    pub private_capacity_planning: bool,
    pub capacity_planning: Option<CapacityPlanning>,
    pub capacity_score: Option<i64>,
    pub participation_intention: Option<ParticipationIntention>,
    pub opt_out_type: Option<OptOutType>,
    pub opt_out_planned_return_date: Option<String>,
    pub intention_context: Option<String>,
    pub implicit_counter: i64,
}

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct Crew {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub collective_id: i64,
}

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub struct Link {
    pub link_type: String,
    pub url: String,
    pub label: Option<String>,
}

#[derive(Clone)]
#[allow(dead_code)]
pub struct LinkWithOwner {
    pub id: i64,
    pub link_type: String,
    pub url: String,
    pub label: Option<String>,
    pub owner_id: i64,
    pub owner_type: String,
}

impl LinkWithOwner {
    pub fn strip_owner(self) -> Link {
        Link {
            link_type: self.link_type,
            url: self.url,
            label: self.label,
        }
    }
}

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub struct CrewWithLinks {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub collective_id: i64,
    pub links: Option<Vec<Link>>,
}

#[derive(ToSchema, Deserialize, Serialize, Debug, Clone)]
#[allow(dead_code)]
pub struct EntryPathway {
    pub id: i64,
    pub collective_id: i64,
    pub name: String,
    pub interest: Option<String>,
    pub context: Option<String>,
    pub referral: Option<String>,
    pub conflict_experience: Option<String>,
    pub participant_connections: Option<String>,
}

#[derive(ToSchema, Deserialize, Serialize, Debug, Clone)]
#[allow(dead_code)]
pub struct ExpressionOfInterest {
    pub id: i64,
    pub collective_id: i64,
    pub name: String,
    pub email: String,
    pub interest: Option<String>,
    pub context: Option<String>,
    pub referral: Option<String>,
    pub conflict_experience: Option<String>,
    pub participant_connections: Option<String>,
}

#[derive(Deserialize, Serialize, ToSchema, Debug, Clone)]
pub struct EventTemplate {
    pub id: i64,
    pub name: String,
    pub links: Option<Vec<Link>>,
}

#[derive(Deserialize, Serialize, ToSchema, Debug, Clone)]
pub struct CalendarEvent {
    pub id: i64,
    pub event_template_id: i64,
    pub name: String,
    pub start_at: String,
    pub end_at: Option<String>,
    pub links: Option<Vec<Link>>,
    pub attendances: Option<Vec<CalendarEventAttendance>>,
}

#[derive(Clone, Debug, PartialEq)]
pub struct CalendarEventId {
    pub id: i64,
}

impl CalendarEventId {
    pub fn new(id: i64) -> Self {
        CalendarEventId { id }
    }
}

#[derive(Deserialize, Serialize, ToSchema, Debug, Clone)]
pub struct CalendarEventAttendance {
    pub id: i64,
    pub person_id: i64,
    pub calendar_event_id: i64,
    pub intention: Option<AttendanceIntention>,
}
