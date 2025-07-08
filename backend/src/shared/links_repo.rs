use std::collections::HashMap;

use crate::shared::entities::{Link, LinkWithOwner};

pub fn hash_links_by_owner(links: Vec<LinkWithOwner>) -> HashMap<i64, Vec<Link>> {
    let mut map: HashMap<i64, Vec<Link>> = HashMap::new();
    for link in links {
        map.entry(link.owner_id)
            .or_insert_with(Vec::new)
            .push(link.strip_owner());
    }
    map
}

pub async fn find_all_links_for_owner_type(
    owner_type: String,
    pool: &sqlx::SqlitePool,
) -> Result<Vec<LinkWithOwner>, sqlx::Error> {
    sqlx::query_as!(
        LinkWithOwner,
        "SELECT id, link_type, url, label, owner_id, owner_type
         FROM links
         WHERE owner_type = ?",
        owner_type
    )
    .fetch_all(pool)
    .await
}

pub async fn find_all_links_for_owner(
    owner_id: i64,
    owner_type: String,
    pool: &sqlx::SqlitePool,
) -> Result<Vec<Link>, sqlx::Error> {
    sqlx::query_as!(
        Link,
        "SELECT link_type, url, label
         FROM links
         WHERE owner_id = ? AND owner_type = ?",
        owner_id,
        owner_type
    )
    .fetch_all(pool)
    .await
}

pub async fn update_links_for_owner(
    owner_id: i64,
    owner_type: String,
    links: Option<Vec<Link>>,
    pool: &sqlx::SqlitePool,
) -> Result<Option<Vec<Link>>, sqlx::Error> {
    let Some(links) = links else {
        return Ok(None);
    };

    let mut transaction = pool.begin().await?;

    // First, delete existing links for the owner
    sqlx::query!(
        "DELETE FROM links WHERE owner_id = ? AND owner_type = ?",
        owner_id,
        owner_type
    )
    .execute(&mut *transaction)
    .await?;

    // Then, insert the new links
    for link in links {
        sqlx::query!(
            "INSERT INTO links (link_type, url, owner_id, owner_type) VALUES (?, ?, ?, ?)",
            link.link_type,
            link.url,
            owner_id,
            owner_type
        )
        .execute(&mut *transaction)
        .await?;
    }

    transaction.commit().await?;

    let result_links = find_all_links_for_owner(owner_id, owner_type, pool).await?;
    Ok(Some(result_links))
}
