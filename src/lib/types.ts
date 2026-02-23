export type SessionStatus = "active" | "needs_input" | "finished";

export interface SessionInfo {
  session_id: string;
  status: SessionStatus;
  cwd: string | null;
  last_message: string | null;
  last_title: string | null;
  notification_type: string | null;
  transcript_path: string | null;
  task_summary: string | null;
  updated_at: string;
}

export interface HookEvent {
  session_id: string;
  event_name: string;
  session: SessionInfo;
}
