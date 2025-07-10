use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub enum AppEvent {
    MeEvent(crate::me::events::MeEvent),
    IntervalsEvent(crate::intervals::events::IntervalsEvent),
    CrewsEvent(crate::crews::events::CrewsEvent),
    CollectiveEvent(crate::collective::events::CollectiveEvent),
}

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub struct AuthoredAppEvent {
    pub author_id: i64,
    pub event: AppEvent,
}
