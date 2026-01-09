import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./styles/appShell.css";
import { getSetting, setSetting } from "./kv";
import { ErrorBoundary } from "./ErrorBoundary";

void (async () => {
  const v = await getSetting<boolean | null>("hapticsEnabled", null);
  if (v === null) {
    await setSetting("hapticsEnabled", true);
  }
})();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
