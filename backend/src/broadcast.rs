use axum::{
    extract::{WebSocketUpgrade, ws::WebSocket},
    response::Response,
};

pub async fn handler(ws: WebSocketUpgrade) -> Response {
    ws.on_upgrade(|socket| handle_socket(socket))
}

async fn handle_socket(_ws: WebSocket) {
    todo!()
}
