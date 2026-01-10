import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", backgroundColor: "#ffebee", height: "100vh" }}>
          <h2 style={{ color: "#c62828" }}>Ojdå, ett fel inträffade.</h2>
          <p>
            Ett oväntat fel har gjort att applikationen inte kan visas korrekt.
            Din matchdata bör vara säkert sparad i databasen.
          </p>
          <pre style={{ background: "#fff", padding: "10px", overflow: "auto" }}>
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: "10px 20px", marginTop: "20px", fontSize: "16px" }}
          >
            Starta om appen
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
