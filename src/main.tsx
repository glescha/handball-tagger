// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "./ErrorBoundary";
import { DebugOverlay } from "./DebugOverlay";

document.documentElement.lang = "sv";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <DebugOverlay />
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
