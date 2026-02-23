use std::sync::Arc;

use axum::{extract::State, http::StatusCode, routing::post, Json, Router};
use chrono::Utc;
use tauri::{AppHandle, Emitter};

use crate::models::{HookEvent, HookPayload, SessionInfo, SessionStatus};
use crate::state::AppState;
use crate::tray::update_tray_icon;

struct ServerState {
    app_state: Arc<AppState>,
    app_handle: AppHandle,
}

pub async fn start_server(app_handle: AppHandle, app_state: Arc<AppState>) {
    let server_state = Arc::new(ServerState {
        app_state,
        app_handle,
    });

    let app = Router::new()
        .route("/hook", post(handle_hook))
        .with_state(server_state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:17232")
        .await
        .expect("Failed to bind to port 17232");

    axum::serve(listener, app).await.expect("Server error");
}

async fn handle_hook(
    State(state): State<Arc<ServerState>>,
    Json(payload): Json<HookPayload>,
) -> StatusCode {
    let event_name = payload.hook_event_name.clone();
    let session_id = payload.session_id.clone();

    let status = match event_name.as_str() {
        "Notification" => SessionStatus::NeedsInput,
        "Stop" => SessionStatus::Active,
        "SessionStart" => SessionStatus::Active,
        "SessionEnd" => SessionStatus::Finished,
        _ => SessionStatus::Active,
    };

    let now = Utc::now();

    let session_info = {
        let mut sessions = state.app_state.sessions.write().await;
        let session = sessions
            .entry(session_id.clone())
            .or_insert_with(|| SessionInfo {
                session_id: session_id.clone(),
                status: SessionStatus::Active,
                cwd: None,
                last_message: None,
                last_title: None,
                notification_type: None,
                transcript_path: None,
                task_summary: None,
                updated_at: now,
            });

        session.status = status;
        session.updated_at = now;

        if let Some(ref cwd) = payload.cwd {
            session.cwd = Some(cwd.clone());
        }
        if let Some(ref msg) = payload.message {
            session.last_message = Some(msg.clone());
        }
        if let Some(ref title) = payload.title {
            session.last_title = Some(title.clone());
        }
        if let Some(ref tp) = payload.transcript_path {
            session.transcript_path = Some(tp.clone());
        }
        session.notification_type = payload.notification_type.clone();

        session.clone()
    };

    // Emit event to frontend
    let hook_event = HookEvent {
        session_id: session_id.clone(),
        event_name: event_name.clone(),
        session: session_info.clone(),
    };
    let _ = state.app_handle.emit("hook-event", &hook_event);

    // Update tray icon
    update_tray_icon(&state.app_handle, &state.app_state).await;

    // Send OS notification for input-needed events
    if event_name == "Notification" {
        send_os_notification(&state.app_handle, &payload);
    }

    StatusCode::OK
}

fn send_os_notification(_app_handle: &AppHandle, payload: &HookPayload) {
    let title = payload
        .title
        .clone()
        .unwrap_or_else(|| "Claude Code".to_string());
    let body = payload
        .message
        .clone()
        .unwrap_or_else(|| "入力待ちです".to_string());

    // Try notify-send (Linux with notification daemon)
    if std::process::Command::new("notify-send")
        .arg(&title)
        .arg(&body)
        .arg("--app-name=ccnotify")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
    {
        return;
    }

    // Fallback: PowerShell toast (WSL2 → Windows)
    let ps_script = format!(
        r#"Add-Type -AssemblyName System.Windows.Forms; $n = New-Object System.Windows.Forms.NotifyIcon; $n.Icon = [System.Drawing.SystemIcons]::Information; $n.Visible = $true; $n.ShowBalloonTip(5000, '{}', '{}', 'Info'); Start-Sleep -Seconds 6; $n.Dispose()"#,
        title.replace('\'', "''"),
        body.replace('\'', "''"),
    );
    let _ = std::process::Command::new("powershell.exe")
        .arg("-Command")
        .arg(&ps_script)
        .spawn();
}
