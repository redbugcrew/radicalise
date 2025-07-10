use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::me::repo::PersonIntervalInvolvementData;

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub enum MeEvent {
    IntervalDataChanged(PersonIntervalInvolvementData),
}
