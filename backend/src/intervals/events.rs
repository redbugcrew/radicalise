use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::shared::entities::Interval;

#[derive(Serialize, Deserialize, ToSchema)]
pub enum IntervalsEvent {
    IntervalCreated(Interval),
}
