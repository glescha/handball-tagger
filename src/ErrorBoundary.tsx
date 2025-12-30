// src/ErrorBoundary.tsx
import React from "react";

type Props = { children: React.ReactNode };
type State = { err: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(err: Error) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", err);
  }

  render() {
    if (!this.state.err) return this.props.children;

    return (
      <div style={{ minHeight: "100vh", padding: 16, background: "#0b0f1a", color: "#fff" }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Appen kraschade</h1>
        <p style={{ opacity: 0.8, marginTop: 8 }}>Kopiera felet nedan.</p>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: 12,
          }}
        >
          {String(this.state.err?.stack || this.state.err?.message || this.state.err)}
        </pre>
        <button
          onClick={() => location.reload()}
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          Ladda om
        </button>
      </div>
    );
  }
}
