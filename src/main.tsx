import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { getSetting, setSetting } from "./kv";

getSetting("hapticsEnabled", null).then(v => {
  if (v === null) setSetting("hapticsEnabled", true);
});
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
