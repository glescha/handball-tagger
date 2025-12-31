// src/DebugOverlay.tsx
import { useEffect, useState } from "react";

type LogItem = { t: number; kind: "error" | "warn" | "info"; msg: string };

function fmt(v: unknown) {
  if (v instanceof Error) return v.stack || v.message;
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export function DebugOverlay() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<LogItem[]>([]);

  useEffect(() => {
    const push = (kind: LogItem["kind"], args: unknown[]) => {
      const msg = args.map(fmt).join(" ");
      setItems((p) => [...p.slice(-80), { t: Date.now(), kind, msg }]);
    };

    const oErr = console.error;
    const oWarn = console.warn;
    const oLog = console.log;

    console.error = (...a) => {
      push("error", a);
      oErr(...a);
    };
    console.warn = (...a) => {
      push("warn", a);
      oWarn(...a);
    };
    console.log = (...a) => {
      push("info", a);
      oLog(...a);
    };

    const onError = (ev: ErrorEvent) => {
      push("error", [ev.message, ev.error]);
      setOpen(true);
    };
    const onRej = (ev: PromiseRejectionEvent) => {
      push("error", ["Unhandled promise rejection:", ev.reason]);
      setOpen(true);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRej);

    return () => {
      console.error = oErr;
      console.warn = oWarn;
      console.log = oLog;
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          right: 10,
          bottom: 10,
          zIndex: 99999,
          padding: "10px 12px",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(15,23,42,0.92)",
          color: "rgba(255,255,255,0.92)",
          fontWeight: 800,
        }}
      >
        Debug {open ? "−" : "+"}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            left: 10,
            right: 10,
            bottom: 60,
            zIndex: 99999,
            maxHeight: "45vh",
            overflow: "auto",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(2,6,23,0.92)",
            color: "rgba(255,255,255,0.92)",
            padding: 10,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 900 }}>Logg</div>
            <button
              onClick={() => setItems([])}
              style={{
                marginLeft: "auto",
                padding: "8px 10px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                fontWeight: 800,
              }}
            >
              Rensa
            </button>
          </div>

          {items.length === 0 ? (
            <div style={{ opacity: 0.75 }}>Inga loggar ännu.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {items
                .slice()
                .reverse()
                .map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background:
                        it.kind === "error"
                          ? "rgba(239,68,68,0.12)"
                          : it.kind === "warn"
                          ? "rgba(245,158,11,0.12)"
                          : "rgba(99,102,241,0.10)",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                      fontSize: 12,
                      lineHeight: 1.35,
                    }}
                  >
                    {it.msg}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
