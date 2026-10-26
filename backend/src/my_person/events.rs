use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::my_person::repo::PersonIntervalData;

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub enum MeEvent {
    IntervalDataChanged(PersonIntervalData),
}
