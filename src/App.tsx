// src/App.tsx
import SummaryView from "./screens/SummaryView";

export default function App() {
  return (
    <div className="page">
      <SummaryView
        matchId="TEST"
        onBack={() => alert("Tillbaka")}
        onExit={() => alert("Avsluta")}
      />
    </div>
  );
}