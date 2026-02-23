mod commands;
mod hook_server;
mod models;
mod state;
mod transcript;
mod tray;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = AppState::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .manage(app_state.clone())
        .setup(move |app| {
            // Setup system tray
            tray::setup_tray(app.handle())?;

            // Start HTTP hook server
            let handle = app.handle().clone();
            let state = app_state.clone();
            tauri::async_runtime::spawn(async move {
                hook_server::start_server(handle, state).await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_sessions,
            commands::get_task_summary,
            commands::dismiss_session,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
