use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::{me::repo::PersonIntervalInvolvementData, shared::entities::CollectiveInvolvement};

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub enum MeEvent {
    IntervalDataChanged(PersonIntervalInvolvementData),
}

pub fn strip_private_data(data: &PersonIntervalInvolvementData) -> PersonIntervalInvolvementData {
    let mut result = data.clone();
    result.collective_involvement = data
        .collective_involvement
        .as_ref()
        .map(strip_private_data_from_collective_involvement);
    result
}

fn strip_private_data_from_collective_involvement(
    involvement: &CollectiveInvolvement,
) -> CollectiveInvolvement {
    match involvement.private_capacity_planning {
        true => {
            let mut result = involvement.clone();
            result.capacity_planning = None;
            result
        }
        false => involvement.clone(),
    }
}
