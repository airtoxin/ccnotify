import { useState } from "react";

const HOOK_CONFIG = {
  hooks: {
    Notification: [
      {
        matcher: "",
        hooks: [
          {
            type: "command",
            command:
              "curl -s -X POST http://localhost:17232/hook -H 'Content-Type: application/json' -d @-",
            timeout: 5,
          },
        ],
      },
    ],
    Stop: [
      {
        matcher: "",
        hooks: [
          {
            type: "command",
            command:
              "curl -s -X POST http://localhost:17232/hook -H 'Content-Type: application/json' -d @-",
            timeout: 5,
          },
        ],
      },
    ],
    SessionStart: [
      {
        matcher: "",
        hooks: [
          {
            type: "command",
            command:
              "curl -s -X POST http://localhost:17232/hook -H 'Content-Type: application/json' -d @-",
            timeout: 5,
          },
        ],
      },
    ],
    SessionEnd: [
      {
        matcher: "",
        hooks: [
          {
            type: "command",
            command:
              "curl -s -X POST http://localhost:17232/hook -H 'Content-Type: application/json' -d @-",
            timeout: 5,
          },
        ],
      },
    ],
  },
};

export function Settings({ onBack }: { onBack: () => void }) {
  const [copied, setCopied] = useState(false);

  const configJson = JSON.stringify(HOOK_CONFIG, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(configJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = configJson;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ padding: "12px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            padding: "0 8px 0 0",
            color: "#333",
          }}
        >
          &larr;
        </button>
        <span style={{ fontSize: "14px", fontWeight: 600 }}>Settings</span>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div
          style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}
        >
          Hook Server Port
        </div>
        <div
          style={{
            fontSize: "13px",
            padding: "6px 10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            fontFamily: "monospace",
          }}
        >
          17232
        </div>
      </div>

      <div>
        <div
          style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}
        >
          Claude Code Hook設定
        </div>
        <div style={{ fontSize: "11px", color: "#666", marginBottom: "8px" }}>
          以下のJSONを <code>~/.claude/settings.json</code> に追加してください
        </div>
        <pre
          style={{
            fontSize: "10px",
            backgroundColor: "#f5f5f5",
            padding: "8px",
            borderRadius: "4px",
            overflow: "auto",
            maxHeight: "200px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          {configJson}
        </pre>
        <button
          onClick={handleCopy}
          style={{
            marginTop: "8px",
            padding: "6px 16px",
            fontSize: "12px",
            backgroundColor: copied ? "#34c759" : "#007aff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          {copied ? "コピーしました" : "クリップボードにコピー"}
        </button>
      </div>
    </div>
  );
}
