// src/App.tsx  (auto-resume senaste matchen)
import { useMemo, useState } from "react";
import MatchStart from "./screens/MatchStart";
import LiveTagging from "./screens/LiveTagging";
import SummaryView from "./screens/SummaryView";

type Screen =
  | { name: "start" }
  | { name: "tagging"; matchId: string }
  | { name: "summary"; matchId: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: "start" });

  const matchId = useMemo(() => ("matchId" in screen ? screen.matchId : ""), [screen]);

  if (screen.name === "start") {
  return (
    <div className="app">
      <MatchStart onStart={(id) => setScreen({ name: "tagging", matchId: id })} />
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
  </div>
);
}
