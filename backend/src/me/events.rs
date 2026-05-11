use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::{
    me::repo::PersonIntervalInvolvementData, my_project::repo::CircleInvolvementData,
    shared::entities::CircleInvolvement,
};

#[derive(Serialize, Deserialize, ToSchema, Debug, Clone)]
pub enum MeEvent {
    IntervalDataChanged(PersonIntervalInvolvementData),
}

pub fn strip_private_data(data: &PersonIntervalInvolvementData) -> PersonIntervalInvolvementData {
    let mut result = data.clone();
    result.data.involvements_for_circles =
        strip_private_data_from_circle_involvements_datas(&data.data.involvements_for_circles);
    result
}

fn strip_private_data_from_circle_involvements_datas(
    involvements_datas: &Vec<CircleInvolvementData>,
) -> Vec<CircleInvolvementData> {
    involvements_datas
        .iter()
        .map(strip_private_data_from_circle_involvements_data)
        .collect()
}

fn strip_private_data_from_circle_involvements_data(
    involvements_datas: &CircleInvolvementData,
) -> CircleInvolvementData {
    CircleInvolvementData {
        circle_id: involvements_datas.circle_id,
        interval_id: involvements_datas.interval_id,
        circle_involvements: strip_private_data_from_circle_involvements(
            &involvements_datas.circle_involvements,
        ),
    }
}

fn strip_private_data_from_circle_involvements(
    involvement: &Vec<CircleInvolvement>,
) -> Vec<CircleInvolvement> {
    involvement
        .iter()
        .map(strip_private_data_from_circle_involvement)
        .collect()
}

fn strip_private_data_from_circle_involvement(
    involvement: &CircleInvolvement,
) -> CircleInvolvement {
    match involvement.private_capacity_planning {
        true => {
            let mut result = involvement.clone();
            result.capacity_planning = None;
            result
        }
        false => involvement.clone(),
    }
}
