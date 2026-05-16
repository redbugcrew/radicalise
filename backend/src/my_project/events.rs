use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::shared::entities::{CircleInvolvement, Project};

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub enum ProjectEvent {
    ProjectUpdated(Project),
    CircleInvolvementUpdated(CircleInvolvement),
}
