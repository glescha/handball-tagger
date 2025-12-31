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
      className="btn"
      onClick={openSettings}
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 1000,
      }}
      aria-label="Inställningar"
      title="Inställningar"
    >
      Inställningar
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
