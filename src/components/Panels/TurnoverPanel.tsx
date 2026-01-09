import { v4 as uuidv4 } from "uuid";
import type { AppEvent, TurnoverType } from "../../types/AppEvents";

export type TurnoverPanelProps = {
  matchId?: string;
  phase?: "ATTACK" | "DEFENSE";
  period?: 1 | 2; // FIX: Matchar AppEvent (var number)
  getTimeMs?: () => number;
  onAddEvent?: (event: AppEvent) => void;
};

// FIX: Typa arrayen så vi vet att id är en giltig TurnoverType
const OPTIONS: { id: TurnoverType; label: string }[] = [
  { id: "STEAL", label: "Brytning" },
  { id: "LOST_BALL", label: "Tappad boll" },
  { id: "TECHNICAL_FAULT", label: "Regelfel" },
  { id: "PASSIVE_PLAY", label: "Passivt" },
];

export function TurnoverPanel({
  matchId = "unknown",
  phase = "ATTACK",
  period = 1,
  getTimeMs,
  onAddEvent,
}: TurnoverPanelProps) {

  // FIX: Tar emot både ID (för logik) och Label (för visning)
  function commit(typeId: TurnoverType, label: string) {
    if (!onAddEvent) return;

    const event: AppEvent = {
      id: uuidv4(),
      matchId,
      timestamp: getTimeMs ? getTimeMs() : Date.now(),
      period,
      phase,
      type: "TURNOVER",
      subType: typeId,      // "STEAL", "LOST_BALL" etc.
      subTypeLabel: label,  // "Brytning", "Tappad boll" etc.
    };

    onAddEvent(event);
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontWeight: 950, color: "#fff" }}>Tekniska fel</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {OPTIONS.map((o) => (
          <button 
            key={o.id} 
            type="button" 
            // FIX: Skickar ID och Label korrekt
            onClick={() => commit(o.id, o.label)}
            style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #334155",
                background: "#1E293B",
                color: "#E2E8F0",
                cursor: "pointer",
                fontWeight: 600
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}