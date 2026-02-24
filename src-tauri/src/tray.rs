use std::sync::Arc;

use tauri::image::Image;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Manager};

use crate::models::SessionStatus;
use crate::state::AppState;

// Simple colored icon data generators (16x16 RGBA)
fn make_icon(r: u8, g: u8, b: u8) -> Vec<u8> {
    let mut data = Vec::with_capacity(16 * 16 * 4);
    for _ in 0..16 * 16 {
        data.push(r);
        data.push(g);
        data.push(b);
        data.push(255);
    }
    data
}

pub fn setup_tray(app: &AppHandle) -> tauri::Result<()> {
    let icon_data = make_icon(128, 128, 128); // gray = idle
    let icon = Image::new_owned(icon_data, 16, 16);

    let show_item = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

    let _tray = TrayIconBuilder::with_id("main-tray")
        .icon(icon)
        .tooltip("ccnotify - idle")
        .menu(&menu)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let tauri::tray::TrayIconEvent::Click {
                button: tauri::tray::MouseButton::Left,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}

pub async fn update_tray_icon(app_handle: &AppHandle, app_state: &Arc<AppState>) {
    let sessions = app_state.sessions.read().await;

    let has_needs_input = sessions
        .values()
        .any(|s| s.status == SessionStatus::NeedsInput);
    let has_active = sessions
        .values()
        .any(|s| s.status == SessionStatus::Active);

    let (r, g, b, tooltip) = if has_needs_input {
        (255u8, 69u8, 58u8, "ccnotify - 入力待ち") // red = alert
    } else if has_active {
        (52u8, 199u8, 89u8, "ccnotify - active") // green = active
    } else {
        (128u8, 128u8, 128u8, "ccnotify - idle") // gray = idle
    };

    let icon_data = make_icon(r, g, b);
    let icon = Image::new_owned(icon_data, 16, 16);

    if let Some(tray) = app_handle.tray_by_id("main-tray") {
        let _ = tray.set_icon(Some(icon));
        let _ = tray.set_tooltip(Some(tooltip));
    }
}
