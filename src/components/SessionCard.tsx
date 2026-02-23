import { useEffect, useState } from "react";
import type { SessionInfo } from "../lib/types";
import { getTaskSummary, dismissSession } from "../lib/ipc";
import { StatusBadge } from "./StatusBadge";

export function SessionCard({
  session,
  onDismiss,
}: {
  session: SessionInfo;
  onDismiss: () => void;
}) {
  const [summary, setSummary] = useState<string | null>(session.task_summary);

  useEffect(() => {
    if (session.transcript_path && !summary) {
      getTaskSummary(session.transcript_path)
        .then((s) => {
          if (s) setSummary(s);
        })
        .catch(() => {});
    }
  }, [session.transcript_path, summary]);

  const cwd = session.cwd;
  const dirName = cwd ? cwd.split("/").pop() || cwd : null;

  const handleDismiss = async () => {
    await dismissSession(session.session_id);
    onDismiss();
  };

  return (
    <div
      style={{
        padding: "10px 12px",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor:
          session.status === "needs_input" ? "#fff5f5" : "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "4px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <StatusBadge status={session.status} />
          {dirName && (
            <span style={{ fontSize: "12px", color: "#666", fontWeight: 500 }}>
              {dirName}
            </span>
          )}
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#999",
            fontSize: "14px",
            padding: "0 4px",
          }}
          title="削除"
        >
          x
        </button>
      </div>
      {session.last_title && (
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "2px",
            color: "#333",
          }}
        >
          {session.last_title}
        </div>
      )}
      {session.last_message && (
        <div
          style={{
            fontSize: "12px",
            color: "#555",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {session.last_message}
        </div>
      )}
      {summary && (
        <div
          style={{
            fontSize: "11px",
            color: "#888",
            marginTop: "4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {summary}
        </div>
      )}
      {session.notification_type && (
        <div style={{ fontSize: "10px", color: "#aaa", marginTop: "2px" }}>
          {session.notification_type}
        </div>
      )}
    </div>
  );
}
