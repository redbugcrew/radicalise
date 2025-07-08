use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::shared::entities::CrewWithLinks;

#[derive(Serialize, Deserialize, ToSchema)]
pub enum CrewsEvent {
    CrewUpdated(CrewWithLinks),
}
