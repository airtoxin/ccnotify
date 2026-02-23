import { useEffect, useState, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import type { SessionInfo, HookEvent } from "../lib/types";
import { getSessions } from "../lib/ipc";

export function useSessions() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);

  const refresh = useCallback(async () => {
    try {
      const list = await getSessions();
      setSessions(list);
    } catch (e) {
      console.error("Failed to fetch sessions:", e);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unlisten = listen<HookEvent>("hook-event", (event) => {
      setSessions((prev) => {
        const updated = event.payload.session;
        const filtered = prev.filter(
          (s) => s.session_id !== updated.session_id
        );
        const next = [...filtered, updated];
        next.sort((a, b) => {
          const order = (s: SessionInfo) => {
            switch (s.status) {
              case "needs_input":
                return 0;
              case "active":
                return 1;
              case "finished":
                return 2;
            }
          };
          return (
            order(a) - order(b) ||
            new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          );
        });
        return next;
      });
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [refresh]);

  return { sessions, refresh };
}
