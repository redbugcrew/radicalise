use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::shared::entities::Collective;

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub enum CollectiveEvent {
    CollectiveUpdated(Collective),
}
