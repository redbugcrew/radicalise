use crate::{
    me::repo::PersonIntervalInvolvementData,
    my_project::repo::{CircleInvolvementData, InitialData, IntervalInvolvementData},
    shared::entities::{Circle, CircleInvolvement, PersonId},
};

pub fn strip_private_data(
    data: &PersonIntervalInvolvementData,
    viewer_circles: &Vec<Circle>,
    person_id: &PersonId,
) -> PersonIntervalInvolvementData {
    let mut result = data.clone();
    result.data.involvements_for_circles = strip_private_data_from_circle_involvements_datas(
        &data.data.involvements_for_circles,
        viewer_circles,
        person_id,
    );
    result
}

pub fn strip_private_data_from_initial_data(
    data: &InitialData,
    viewer_circles: &Vec<Circle>,
    person_id: &PersonId,
) -> InitialData {
    let mut result = data.clone();
    result.involvements.current_interval =
        data.involvements
            .current_interval
            .as_ref()
            .map(|interval_data| {
                strip_private_data_from_interval_datas(interval_data, viewer_circles, person_id)
            });
    result
}

fn strip_private_data_from_interval_datas(
    data: &IntervalInvolvementData,
    viewer_circles: &Vec<Circle>,
    person_id: &PersonId,
) -> IntervalInvolvementData {
    let mut result = data.clone();
    result.involvements_for_circles = strip_private_data_from_circle_involvements_datas(
        &data.involvements_for_circles,
        viewer_circles,
        person_id,
    );
    result
}

fn strip_private_data_from_circle_involvements_datas(
    involvements_datas: &Vec<CircleInvolvementData>,
    viewer_circles: &Vec<Circle>,
    person_id: &PersonId,
) -> Vec<CircleInvolvementData> {
    involvements_datas
        .iter()
        .map(|involvements_data| CircleInvolvementData {
            circle_id: involvements_data.circle_id,
            interval_id: involvements_data.interval_id,
            circle_involvements: strip_private_data_from_circle_involvements(
                &involvements_data.circle_involvements,
                viewer_circles,
                person_id,
            ),
        })
        .collect()
}

fn strip_private_data_from_circle_involvements(
    involvement: &Vec<CircleInvolvement>,
    viewer_circles: &Vec<Circle>,
    person_id: &PersonId,
) -> Vec<CircleInvolvement> {
    involvement
        .iter()
        .map(
            |inv| match can_see_capacity_planning(inv, viewer_circles, person_id) {
                true => inv.clone(),
                false => {
                    let mut result = inv.clone();
                    result.capacity_planning = None;
                    result
                }
            },
        )
        .collect()
}

fn can_see_capacity_planning(
    involvement: &CircleInvolvement,
    viewer_circles: &Vec<Circle>,
    person_id: &PersonId,
) -> bool {
    // Return true if being viewed by the owner
    if involvement.person_id == person_id.id {
        return true;
    }

    // Return true if there's a visibility circle and the viewer is in it
    involvement.capacity_planning_visibility_circle_id.is_some()
        && viewer_circles
            .iter()
            .any(|circle| circle.id == involvement.capacity_planning_visibility_circle_id.unwrap())
}
