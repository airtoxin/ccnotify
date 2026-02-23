use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::models::SessionInfo;

pub type SessionMap = HashMap<String, SessionInfo>;

#[derive(Debug)]
pub struct AppState {
    pub sessions: RwLock<SessionMap>,
}

impl AppState {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            sessions: RwLock::new(HashMap::new()),
        })
    }
}
