use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::me::repo::MyIntervalData;

#[derive(Serialize, Deserialize, ToSchema)]
pub enum MeEvent {
    MyIntervalDataChanged(MyIntervalData),
}
