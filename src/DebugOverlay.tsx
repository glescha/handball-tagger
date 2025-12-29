import { useEffect, useState } from "react";

export function DebugOverlay() {
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      setMsg(
        [
          "window.onerror",
          event.message,
          event.filename ? `File: ${event.filename}` : "",
          event.lineno ? `Line: ${event.lineno}:${event.colno}` : "",
          event.error?.stack ? `Stack:\n${event.error.stack}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      );
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason: any = event.reason;
      setMsg(
        [
          "unhandledrejection",
          typeof reason === "string" ? reason : "",
          reason?.message ? reason.message : "",
          reason?.stack ? `Stack:\n${reason.stack}` : JSON.stringify(reason, null, 2),
        ]
          .filter(Boolean)
          .join("\n")
      );
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  if (!msg) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        right: 0,
        zIndex: 999999,
        background: "white",
        color: "black",
        padding: 12,
        borderBottom: "2px solid red",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
      }}
    >
      <strong style={{ color: "red" }}>RUNTIME ERROR</strong>
      {"\n\n"}
      {msg}
    </div>
  );
}