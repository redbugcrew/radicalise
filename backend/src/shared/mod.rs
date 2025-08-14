pub const COLLECTIVE_ID: i64 = 1;

pub mod db_helpers;
pub mod entities;
pub mod events;
pub mod links_repo;
pub mod regular_tasks;

pub fn default_collective_id() -> entities::CollectiveId {
    entities::CollectiveId { id: COLLECTIVE_ID }
}
