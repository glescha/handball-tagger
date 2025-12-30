// src/App.tsx
import { useState } from "react";
import MatchStart from "./screens/MatchStart";
import LiveTagging from "./screens/LiveTagging";
import SummaryView from "./screens/SummaryView";

type Screen =
  | { name: "start" }
  | { name: "tagging"; matchId: string }
  | { name: "summary"; matchId: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: "start" });

  if (screen.name === "start") {
    return <MatchStart onStart={(matchId) => setScreen({ name: "tagging", matchId })} />;
  }

  if (screen.name === "tagging") {
    return (
      <LiveTagging
        matchId={screen.matchId}
        onSummary={() => setScreen({ name: "summary", matchId: screen.matchId })}
        onExit={() => setScreen({ name: "start" })}
      />
    );
  }

  return (
    <SummaryView
      matchId={screen.matchId}
      onBack={() => setScreen({ name: "tagging", matchId: screen.matchId })}
      onExit={() => setScreen({ name: "start" })}
    />
  );
}
