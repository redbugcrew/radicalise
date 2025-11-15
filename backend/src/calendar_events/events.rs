use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::shared::entities::CalendarEvent;

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub enum CalendarEventsEvent {
    CalendarEventUpdated(CalendarEvent),
}
