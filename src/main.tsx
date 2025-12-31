window.addEventListener("error", (e) => {
  document.body.innerHTML =
    "<pre style='white-space:pre-wrap;padding:12px'>JS error:\n" +
    (e.error?.stack || e.message) +
    "</pre>";
});

window.addEventListener("unhandledrejection", (e: any) => {
  document.body.innerHTML =
    "<pre style='white-space:pre-wrap;padding:12px'>Promise rejection:\n" +
    (e.reason?.stack || String(e.reason)) +
    "</pre>";
});

import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { getSetting, setSetting } from "./kv";

// initiera default-inställning exakt en gång
const v = getSetting<boolean | null>("hapticsEnabled", null);
if (v === null) setSetting("hapticsEnabled", true);

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
