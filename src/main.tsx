// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Livsignal DIREKT i DOM (syns även om React kraschar senare)
const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML = "<pre>FEL: #root hittades inte i index.html</pre>";
  throw new Error("Root element (#root) not found");
}
rootEl.innerHTML = "<pre>Laddar React…</pre>";

try {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e) {
  rootEl.innerHTML =
    "<pre>React kraschade vid render. Öppna console för detaljer.</pre>";
  // logga ändå
  // eslint-disable-next-line no-console
  console.error(e);
}