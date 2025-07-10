use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub enum AppEvent {
    MeEvent(crate::me::events::MeEvent),
    IntervalsEvent(crate::intervals::events::IntervalsEvent),
    CrewsEvent(crate::crews::events::CrewsEvent),
    CollectiveEvent(crate::collective::events::CollectiveEvent),
}
