use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::shared::entities::Circle;

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub enum CirclesEvent {
    CircleUpdated(Circle),
}
