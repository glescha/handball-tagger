import { useEffect, useMemo, useState } from "react";
import HomeScreen from "./screens/HomeScreen"; 
import LiveTagging from "./screens/LiveTagging"; 
import SummaryView from "./screens/SummaryView";
import Settings from "./screens/Settings";
import { installGlobalHaptics } from "./hapticsGlobal";
// NY: Importera Wake Lock
import { useWakeLock } from "./hooks/useWakeLock";
import VersionDisplay from "./components/VersionDisplay";

type Screen =
  | { name: "start" }
  | { name: "tagging"; matchId: string }
  | { name: "summary"; matchId: string }
  | { name: "settings"; from: Screen };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: "start" });

  // NY: Aktivera Wake Lock så skärmen inte slocknar
  useWakeLock();

  useEffect(() => {
    const cleanup = installGlobalHaptics();
    return cleanup;
  }, []);

  const matchId = useMemo(() => {
    if (screen.name === "tagging" || screen.name === "summary") return screen.matchId;
    return "";
  }, [screen]);

  const openSettings = () => setScreen({ name: "settings", from: screen });

  // Inställnings-ikon (kugghjul) - Nere till HÖGER
  const SettingsFab = (
    <button 
      onClick={openSettings} 
      aria-label="Inställningar" 
      title="Inställningar"
      style={{
        position: "fixed", 
        bottom: 20, 
        right: 20, 
        zIndex: 100,
        background: "rgba(30, 41, 59, 0.9)", 
        color: "#94A3B8",
        border: "1px solid rgba(255,255,255,0.2)", 
        borderRadius: "50%",
        width: 48, 
        height: 48, 
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.1 7.1 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.23-1.12.54-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.72 7.48a.5.5 0 0 0 .12.64l2.03 1.58c-.05.31-.07.63-.07.94s.02.63.07.94L2.84 14.52a.5.5 0 0 0-.12.64l1.92 3.32c.13.23.39.32.6.22l2.39-.96c.51.4 1.05.71 1.63.94l.36 2.54c.04.24.25.42.49.42h3.8c.24 0 .45-.18.49-.42l.36-2.54c.58-.23 1.12-.54 1.63-.94l2.39.96c.22.1.47.01.6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"
        />
      </svg>
    </button>
  );

  if (screen.name === "settings") {
    return (
      <div style={{ height: "100vh", background: "#0F172A", color: "#fff" }}>
        <Settings onBack={() => setScreen(screen.from)} />
      </div>
    );
  }

  if (screen.name === "start") {
    return (
      <div style={{ height: "100vh", background: "#0F172A" }}>
        <HomeScreen onStartMatch={(id) => setScreen({ name: "tagging", matchId: id })} />
        {SettingsFab}
        <VersionDisplay />
      </div>
    );
  }

  if (screen.name === "tagging") {
    return (
      <div style={{ height: "100vh", background: "#0F172A" }}>
        <LiveTagging
          matchId={matchId}
          onSummary={() => setScreen({ name: "summary", matchId })}
          onExit={() => setScreen({ name: "start" })}
        />
        {SettingsFab}
        <VersionDisplay />
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", background: "#0F172A" }}>
      <SummaryView matchId={matchId} onBack={() => setScreen({ name: "tagging", matchId })} />
      {SettingsFab}
      <VersionDisplay />
    </div>
  );
}