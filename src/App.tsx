import { useState } from "react";
import { useSessions } from "./hooks/useSessions";
import { SessionList } from "./components/SessionList";
import { Settings } from "./components/Settings";

type View = "sessions" | "settings";

function App() {
  const { sessions, refresh } = useSessions();
  const [view, setView] = useState<View>("sessions");

  const needsInputCount = sessions.filter(
    (s) => s.status === "needs_input"
  ).length;

  if (view === "settings") {
    return <Settings onBack={() => setView("sessions")} />;
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: "13px",
        backgroundColor: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#fafafa",
          // Allow dragging window
          // @ts-expect-error - webkit specific
          WebkitAppRegion: "drag",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 700, fontSize: "14px" }}>ccnotify</span>
          {needsInputCount > 0 && (
            <span
              style={{
                backgroundColor: "#ff453a",
                color: "#fff",
                borderRadius: "10px",
                padding: "1px 7px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {needsInputCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setView("settings")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            color: "#666",
            padding: "0 4px",
            // @ts-expect-error - webkit specific
            WebkitAppRegion: "no-drag",
          }}
          title="Settings"
        >
          &#9881;
        </button>
      </div>

      {/* Session List */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <SessionList sessions={sessions} onRefresh={refresh} />
      </div>
    </div>
  );
}

export default App;
