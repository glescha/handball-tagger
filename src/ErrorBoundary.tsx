// src/ErrorBoundary.tsx
import { Component } from "react";
import type { ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error?: Error };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // Valfritt: logga mer
    console.error("ErrorBoundary fångade fel:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <pre style={{ color: "red", padding: 16, whiteSpace: "pre-wrap" }}>
          {String(this.state.error.message)}
          {"\n\n"}
          {String(this.state.error.stack ?? "")}
        </pre>
      );
    }
    return this.props.children;
  }
}
