// src/App.tsx  (auto-resume senaste matchen)
import { useEffect, useMemo, useState } from "react";
import MatchStart from "./screens/MatchStart";
import LiveTagging from "./screens/LiveTagging";
import SummaryView from "./screens/SummaryView";
import { getActiveMatch } from "./matchService";

type Screen =
  | { name: "start" }
  | { name: "tagging"; matchId: string }
  | { name: "summary"; matchId: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: "start" });

  useEffect(() => {
    (async () => {
      const active = await getActiveMatch();
      if (active) setScreen({ name: "tagging", matchId: active });
    })();
  }, []);

  const matchId = useMemo(() => ("matchId" in screen ? screen.matchId : ""), [screen]);

  if (screen.name === "start") {
    return <MatchStart onStart={(id) => setScreen({ name: "tagging", matchId: id })} />;
  }

  if (screen.name === "tagging") {
    return (
      <LiveTagging
        matchId={matchId}
        onSummary={() => setScreen({ name: "summary", matchId })}
        onExit={() => setScreen({ name: "start" })}
      />
    );
  }

  return (
    <SummaryView
      matchId={matchId}
      onBack={() => setScreen({ name: "tagging", matchId })}
      onExit={() => setScreen({ name: "start" })}
    />
  );
}
