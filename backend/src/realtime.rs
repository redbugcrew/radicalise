use axum::{
    Extension,
    extract::{
        WebSocketUpgrade,
        ws::{Message, WebSocket},
    },
    response::Response,
};
use futures_util::{
    SinkExt, StreamExt,
    stream::{SplitSink, SplitStream},
};
use std::sync::Arc;
use tokio::sync::{
    Mutex,
    broadcast::{self, Receiver, Sender},
};

use crate::shared::events::AppEvent;

#[derive(Debug, Clone)]
pub struct RealtimeState {
    broadcast_tx: Arc<Mutex<Sender<Message>>>,
}
impl RealtimeState {
    pub fn new() -> Self {
        let (tx, _) = broadcast::channel(32);
        Self {
            broadcast_tx: Arc::new(Mutex::new(tx)),
        }
    }

    pub async fn broadcast_app_event(&self, event: AppEvent) {
        println!("Broadcasting event: {:?}", event);
    }
}

pub async fn handler(
    ws: WebSocketUpgrade,
    Extension(realtime_state): Extension<RealtimeState>,
) -> Response {
    ws.on_upgrade(|socket| handle_socket(socket, realtime_state))
}

async fn handle_socket(ws: WebSocket, realtime_state: RealtimeState) {
    let (ws_tx, ws_rx) = ws.split();
    let ws_tx = Arc::new(Mutex::new(ws_tx));

    {
        let broadcast_rx = realtime_state.broadcast_tx.lock().await.subscribe();
        tokio::spawn(async move {
            recv_broadcast(ws_tx, broadcast_rx).await;
        });
    }

    recv_from_client(ws_rx).await;
}

async fn recv_from_client(mut client_rx: SplitStream<WebSocket>) {
    while let Some(Ok(msg)) = client_rx.next().await {
        if matches!(msg, Message::Close(_)) {
            return;
        }

        println!("Received message from client: {:?}", msg);

        // if broadcast_tx.lock().await.send(msg).is_err() {
        //     println!("Failed to broadcast a message");
        // }
    }
}

async fn recv_broadcast(
    client_tx: Arc<Mutex<SplitSink<WebSocket, Message>>>,
    mut broadcast_rx: Receiver<Message>,
) {
    while let Ok(msg) = broadcast_rx.recv().await {
        if client_tx.lock().await.send(msg).await.is_err() {
            return; // disconnected.
        }
    }
}
