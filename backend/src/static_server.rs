use std::env;

use axum::{
    body::Body,
    http::{Request, Response, StatusCode, Uri},
};
use tower::ServiceExt;
use tower_http::services::ServeDir;

lazy_static! {
    pub static ref FRONTEND_PATH: String =
        env::var("FRONTEND_PATH").unwrap_or_else(|_| "../frontend/dist".to_string());
}

pub async fn frontend_handler(uri: Uri) -> Result<Response<Body>, (StatusCode, String)> {
    let res = get_static_file(uri.clone(), FRONTEND_PATH.clone()).await?;

    if res.status() == StatusCode::NOT_FOUND {
        // try with `.html`
        // TODO: handle if the Uri has query parameters
        match format!("{}.html", uri).parse() {
            Ok(uri_html) => get_static_file(uri_html, FRONTEND_PATH.clone()).await,
            Err(_) => {
                println!("Invalid URI: {}", uri);
                return Err((StatusCode::INTERNAL_SERVER_ERROR, "Invalid URI".to_string()));
            }
        }
    } else {
        Ok(res)
    }
}

async fn get_static_file(
    uri: Uri,
    static_dir: String,
) -> Result<Response<Body>, (StatusCode, String)> {
    let req = Request::builder().uri(uri).body(Body::empty()).unwrap();

    // `ServeDir` implements `tower::Service` so we can call it with `tower::ServiceExt::oneshot`
    match ServeDir::new(static_dir).oneshot(req).await {
        Ok(res) => Ok(res.map(Body::new)),
        Err(err) => {
            println!("Error serving static file: {}", err);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Something went wrong: {}", err),
            ));
        }
    }
}
