import type { SessionStatus } from "../lib/types";

const statusConfig: Record<
  SessionStatus,
  { label: string; color: string; bg: string }
> = {
  needs_input: { label: "入力待ち", color: "#fff", bg: "#ff453a" },
  active: { label: "実行中", color: "#fff", bg: "#34c759" },
  finished: { label: "完了", color: "#666", bg: "#e0e0e0" },
};

export function StatusBadge({ status }: { status: SessionStatus }) {
  const config = statusConfig[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "10px",
        fontSize: "11px",
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.bg,
      }}
    >
      {config.label}
    </span>
  );
}
