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

use crate::{
    auth::auth_backend::AuthSession,
    shared::events::{AppEvent, AuthoredAppEvent},
};

#[derive(Debug, Clone)]
pub struct RealtimeState {
    broadcast_tx: Arc<Mutex<Sender<AuthoredAppEvent>>>,
}
impl RealtimeState {
    pub fn new() -> Self {
        let (tx, _) = broadcast::channel::<AuthoredAppEvent>(32);
        Self {
            broadcast_tx: Arc::new(Mutex::new(tx)),
        }
    }

    pub async fn broadcast_app_event(&self, auth_session: Option<AuthSession>, event: AppEvent) {
        let user_id = self.get_user_id_from_session(auth_session);
        self.broadcast_app_event_for_user(user_id, event).await;
    }

    pub async fn broadcast_app_event_for_user(&self, user_id: Option<i64>, event: AppEvent) {
        match self.broadcast_tx.lock().await.send(AuthoredAppEvent {
            author_id: user_id,
            event,
        }) {
            Ok(_) => {}
            Err(error) => {
                eprintln!(
                    "No realtime message sent, could be no connections: {}",
                    error
                );
            }
        }
    }

    fn get_user_id_from_session(&self, session: Option<AuthSession>) -> Option<i64> {
        session.map(|s| s.user.map(|u| u.id)).flatten()
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
    client_tx_mutex: Arc<Mutex<SplitSink<WebSocket, Message>>>,
    mut broadcast_rx: Receiver<AuthoredAppEvent>,
) {
    while let Ok(msg) = broadcast_rx.recv().await {
        let mut client_tx = client_tx_mutex.lock().await;

        if client_tx.send(message_from_event(&msg)).await.is_err() {
            return; // disconnected.
        }
    }
}

fn message_from_event(event: &AuthoredAppEvent) -> Message {
    let json = serde_json::to_string(event).expect("Failed to serialize event");
    Message::Text(json.into())
}
