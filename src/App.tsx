// src/App.tsx
import { useMemo, useState, useEffect } from "react";
import MatchStart from "./screens/MatchStart";
import LiveTagging from "./screens/LiveTagging";
import SummaryView from "./screens/SummaryView";
import Settings from "./screens/Settings";
import { installGlobalHaptics } from "./hapticsGlobal";

type Screen =
  | { name: "start" }
  | { name: "tagging"; matchId: string }
  | { name: "summary"; matchId: string }
  | { name: "settings"; from: Screen }; // <- ny

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: "start" });

  useEffect(() => {
    const cleanup = installGlobalHaptics();
    return cleanup;
  }, []);

  const matchId = useMemo(() => ("matchId" in screen ? (screen as any).matchId : ""), [screen]);

  const openSettings = () => setScreen({ name: "settings", from: screen });

  // Global knapp (visas på alla vyer)
  const SettingsFab = (
    <button
      className="fabIcon"
      onClick={openSettings}
      aria-label="Inställningar"
      title="Inställningar"
    >
      {/* Gear icon (inline SVG) */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.1 7.1 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.23-1.12.54-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.72 7.48a.5.5 0 0 0 .12.64l2.03 1.58c-.05.31-.07.63-.07.94s.02.63.07.94L2.84 14.52a.5.5 0 0 0-.12.64l1.92 3.32c.13.23.39.32.6.22l2.39-.96c.51.4 1.05.71 1.63.94l.36 2.54c.04.24.25.42.49.42h3.8c.24 0 .45-.18.49-.42l.36-2.54c.58-.23 1.12-.54 1.63-.94l2.39.96c.22.1.47.01.6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"
        />
      </svg>
    </button>
  );

  if (screen.name === "settings") {
    return (
      <div className="app">
        <Settings onBack={() => setScreen(screen.from)} />
      </div>
    );
  }

  if (screen.name === "start") {
    return (
      <div className="app">
        <MatchStart onStart={(id) => setScreen({ name: "tagging", matchId: id })} />
        {SettingsFab}
      </div>
    );
  }

  if (screen.name === "tagging") {
    return (
      <div className="app">
        <LiveTagging
          matchId={matchId}
          onSummary={() => setScreen({ name: "summary", matchId })}
          onExit={() => setScreen({ name: "start" })}
        />
        {SettingsFab}
      </div>
    );
  }

  return (
    <div className="app">
      <SummaryView
        matchId={matchId}
        onBack={() => setScreen({ name: "tagging", matchId })}
        onExit={() => setScreen({ name: "start" })}
      />
      {SettingsFab}
    </div>
  );
}
