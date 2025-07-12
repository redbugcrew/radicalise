use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::shared::entities::Person;

#[derive(Serialize, Deserialize, ToSchema, Clone, Debug)]
pub enum PeopleEvent {
    PersonUpdated(Person),
}
