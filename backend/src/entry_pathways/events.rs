use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::shared::entities::EntryPathway;

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub enum EntryPathwayEvent {
    EntryPathwayUpdated(EntryPathway),
}
