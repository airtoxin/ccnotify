import { invoke } from "@tauri-apps/api/core";
import type { SessionInfo } from "./types";

export async function getSessions(): Promise<SessionInfo[]> {
  return invoke<SessionInfo[]>("get_sessions");
}

export async function getTaskSummary(
  transcriptPath: string
): Promise<string> {
  return invoke<string>("get_task_summary", {
    transcriptPath,
  });
}

export async function dismissSession(sessionId: string): Promise<void> {
  return invoke("dismiss_session", { sessionId });
}

export async function quitApp(): Promise<void> {
  return invoke("quit_app");
}
