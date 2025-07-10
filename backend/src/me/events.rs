use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::me::repo::IntervalInvolvementData;

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub enum MeEvent {
    IntervalDataChanged(IntervalInvolvementData),
}
