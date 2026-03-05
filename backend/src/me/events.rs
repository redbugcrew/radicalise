use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::{me::repo::PersonIntervalInvolvementData, shared::entities::ProjectInvolvement};

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub enum MeEvent {
    IntervalDataChanged(PersonIntervalInvolvementData),
}

pub fn strip_private_data(data: &PersonIntervalInvolvementData) -> PersonIntervalInvolvementData {
    let mut result = data.clone();
    result.project_involvement = data
        .project_involvement
        .as_ref()
        .map(strip_private_data_from_project_involvement);
    result
}

fn strip_private_data_from_project_involvement(
    involvement: &ProjectInvolvement,
) -> ProjectInvolvement {
    match involvement.private_capacity_planning {
        true => {
            let mut result = involvement.clone();
            result.capacity_planning = None;
            result
        }
        false => involvement.clone(),
    }
}
