use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::shared::entities::Crew;

#[derive(Serialize, Deserialize, ToSchema)]
pub enum CrewsEvent {
    CrewUpdated(Crew),
}
