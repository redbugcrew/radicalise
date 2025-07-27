use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub enum AppEvent {
    MeEvent(crate::me::events::MeEvent),
    IntervalsEvent(crate::intervals::events::IntervalsEvent),
    CrewsEvent(crate::crews::events::CrewsEvent),
    CollectiveEvent(crate::my_collective::events::CollectiveEvent),
    PeopleEvent(crate::people::events::PeopleEvent),
    EntryPathwayEvent(crate::entry_pathways::events::EntryPathwayEvent),
}

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub struct AuthoredAppEvent {
    pub author_id: Option<i64>,
    pub event: AppEvent,
}
