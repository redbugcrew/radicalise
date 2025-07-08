use std::collections::HashMap;

use crate::shared::entities::{Link, LinkWithOwner};

pub fn hash_links_by_owner(links: Vec<LinkWithOwner>) -> HashMap<i64, Vec<Link>> {
    let mut map: HashMap<i64, Vec<Link>> = HashMap::new();
    for link in links {
        map.entry(link.owner_id)
            .or_insert_with(Vec::new)
            .push(Link {
                id: link.id,
                link_type: link.link_type,
                url: link.url,
            });
    }
    map
}

pub async fn find_all_links_for_owner_type(
    owner_type: String,
    pool: &sqlx::SqlitePool,
) -> Result<Vec<LinkWithOwner>, sqlx::Error> {
    sqlx::query_as!(
        LinkWithOwner,
        "SELECT id, link_type, url, owner_id, owner_type
         FROM links
         WHERE owner_type = ?",
        owner_type
    )
    .fetch_all(pool)
    .await
}
