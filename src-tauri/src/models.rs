use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HookPayload {
    pub session_id: String,
    pub hook_event_name: String,
    #[serde(default)]
    pub notification_type: Option<String>,
    #[serde(default)]
    pub title: Option<String>,
    #[serde(default)]
    pub message: Option<String>,
    #[serde(default)]
    pub cwd: Option<String>,
    #[serde(default)]
    pub transcript_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SessionStatus {
    Active,
    NeedsInput,
    Finished,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionInfo {
    pub session_id: String,
    pub status: SessionStatus,
    pub cwd: Option<String>,
    pub last_message: Option<String>,
    pub last_title: Option<String>,
    pub notification_type: Option<String>,
    pub transcript_path: Option<String>,
    pub task_summary: Option<String>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HookEvent {
    pub session_id: String,
    pub event_name: String,
    pub session: SessionInfo,
}
