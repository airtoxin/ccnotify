use std::sync::Arc;
use tauri::{AppHandle, State};

use crate::models::SessionInfo;
use crate::state::AppState;
use crate::transcript::read_task_summary;

#[tauri::command]
pub fn quit_app(app: AppHandle) {
    app.exit(0);
}

#[tauri::command]
pub async fn get_sessions(state: State<'_, Arc<AppState>>) -> Result<Vec<SessionInfo>, String> {
    let sessions = state.sessions.read().await;
    let mut list: Vec<SessionInfo> = sessions.values().cloned().collect();
    list.sort_by(|a, b| {
        let order = |s: &SessionInfo| match s.status {
            crate::models::SessionStatus::NeedsInput => 0,
            crate::models::SessionStatus::Active => 1,
            crate::models::SessionStatus::Finished => 2,
        };
        order(a).cmp(&order(b)).then(b.updated_at.cmp(&a.updated_at))
    });
    Ok(list)
}

#[tauri::command]
pub async fn get_task_summary(transcript_path: String) -> Result<String, String> {
    read_task_summary(&transcript_path)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn dismiss_session(
    session_id: String,
    state: State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let mut sessions = state.sessions.write().await;
    sessions.remove(&session_id);
    Ok(())
}
