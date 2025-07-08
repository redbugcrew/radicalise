use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::shared::entities::Collective;

#[derive(Serialize, Deserialize, ToSchema)]
pub enum CollectiveEvent {
    CollectiveUpdated(Collective),
}
