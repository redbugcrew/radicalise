use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::me::repo::PersonIntervalData;

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub enum MeEvent {
    IntervalDataChanged(PersonIntervalData),
}
