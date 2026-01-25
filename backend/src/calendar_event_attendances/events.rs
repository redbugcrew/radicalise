use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::shared::entities::CalendarEventAttendance;

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub enum CalendarEventAttendancesEvent {
    CalendarEventAttendanceUpdated(CalendarEventAttendance),
}
