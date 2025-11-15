use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::shared::entities::EventRecord;

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub enum EventRecordsEvent {
    EventRecordUpdated(EventRecord),
}
