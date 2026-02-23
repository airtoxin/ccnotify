import type { SessionInfo } from "../lib/types";
import { SessionCard } from "./SessionCard";

export function SessionList({
  sessions,
  onRefresh,
}: {
  sessions: SessionInfo[];
  onRefresh: () => void;
}) {
  if (sessions.length === 0) {
    return (
      <div
        style={{
          padding: "40px 20px",
          textAlign: "center",
          color: "#999",
          fontSize: "13px",
        }}
      >
        セッションがありません
        <br />
        <span style={{ fontSize: "11px" }}>
          Claude Codeのhookが設定されていることを確認してください
        </span>
      </div>
    );
  }

  return (
    <div>
      {sessions.map((session) => (
        <SessionCard
          key={session.session_id}
          session={session}
          onDismiss={onRefresh}
        />
      ))}
    </div>
  );
}
