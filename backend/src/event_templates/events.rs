use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::shared::entities::EventTemplate;

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub enum EventTemplatesEvent {
    EventTemplateUpdated(EventTemplate),
}
