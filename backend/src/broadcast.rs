use axum::{
    extract::{WebSocketUpgrade, ws::WebSocket},
    response::Response,
};

pub async fn handler(ws: WebSocketUpgrade) -> Response {
    ws.on_upgrade(|socket| handle_socket(socket))
}

async fn handle_socket(mut ws: WebSocket) {
    while let Some(msg) = ws.recv().await {
        let msg = if let Ok(msg) = msg {
            msg
        } else {
            return; // client disconnected
        };
        if ws.send(msg).await.is_err() {
            return; // client disconnected
        }
    }
}
