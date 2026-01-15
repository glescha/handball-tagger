import { Period } from "../../hooks/useMatchTimer";

type HeaderProps = {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  period: Period;
  timeMs: number;
  phase: "ATTACK" | "DEFENSE";
  isRunning?: boolean;
  onTogglePhase: () => void;
  onToggleClock: () => void;
  onTogglePeriod: () => void;
  onBack: () => void;
  onSummary: () => void;
  onAdjustTime: (seconds: number) => void;
  onOpenTimeSettings: () => void;
};

const COL_ATTACK = "#38BDF8"; 
const COL_DEFENSE = "#F43F5E"; 
const COL_TEXT_ACTIVE = "#0F172A"; 

export function Header({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  period,
  timeMs,
  phase,
  isRunning = false,
  onTogglePhase,
  onToggleClock,
  onTogglePeriod,
  onBack,
  onSummary,
  onAdjustTime,
  onOpenTimeSettings,
}: HeaderProps) {
  
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000);
  const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const resetBtnStyle: any = {
      appearance: "none", WebkitAppearance: "none", boxSizing: "border-box", margin: 0,
      minHeight: "0px", height: "auto", display: "inline-flex", alignItems: "center",
      justifyContent: "center", lineHeight: 1, border: "none", cursor: "pointer",
  };

  return (
    <header style={{ 
      background: "#1E293B", border: "1px solid #334155", borderRadius: 12,             
      margin: "12px 12px 0 12px", padding: "0 12px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 70, width: "auto", boxSizing: "border-box", flexShrink: 0
    }}>
      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
      
      <button onClick={onBack} style={{ ...resetBtnStyle, background: "transparent", color: "#94A3B8", width: 44, height: 44, flexShrink: 0, justifyContent: "flex-start" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, overflow: "hidden" }}>
          <div style={{ textAlign: "right", flex: 1, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", paddingRight: 6 }}>
              <span style={{ fontSize: "min(18px, 4vw)", color: "#fff", fontWeight: 700, textTransform: "uppercase" }}>{homeTeam}</span>
          </div>

          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", textAlign: "center", minWidth: 24, flexShrink: 0 }}>{homeScore}</div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, background: "#0F172A", padding: "6px 10px", borderRadius: 10, border: "1px solid #334155" }}>
              <span onClick={(e) => { e.stopPropagation(); onTogglePeriod(); }} style={{ fontSize: 13, color: "#94A3B8", fontWeight: 700, cursor: "pointer", paddingRight: 4, transform: "scale(1.05)", display: "inline-block" }}>
                H{period}
              </span>

              <button onClick={() => onAdjustTime(-10)} style={{ ...resetBtnStyle, background: "transparent", color: "#64748B", fontSize: 10, fontWeight: 700, padding: "0 2px", cursor: "pointer" }} title="-10s">-10</button>

              {/* Endast Tiden (Klickbar) */}
              <span onClick={onOpenTimeSettings} style={{ fontSize: 22, color: "#fff", fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1, cursor: "pointer", minWidth: 55, textAlign: "center", animation: !isRunning ? "blink 1.5s infinite ease-in-out" : "none" }}>
                {timeStr}
              </span>
              
              <button onClick={() => onAdjustTime(10)} style={{ ...resetBtnStyle, background: "transparent", color: "#64748B", fontSize: 10, fontWeight: 700, padding: "0 2px", cursor: "pointer" }} title="+10s">+10</button>

              <button onClick={onToggleClock} style={{ ...resetBtnStyle, background: "transparent", color: "#38BDF8", fontSize: 16, padding: "0 4px", transform: "scale(1.2)", display: "flex", alignItems: "center", justifyContent: "center", height: 24 }}>
                  ⏯
              </button>

              <button onClick={onTogglePhase} style={{ ...resetBtnStyle, background: phase === "ATTACK" ? COL_ATTACK : COL_DEFENSE, color: COL_TEXT_ACTIVE, fontSize: 13, fontWeight: 800, padding: "3px 8px", borderRadius: 4, textTransform: "uppercase", minWidth: 55, marginLeft: 4 }}>
                {phase === "ATTACK" ? "ANFALL" : "FÖRSVAR"}
              </button>
          </div>

          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", textAlign: "center", minWidth: 24, flexShrink: 0 }}>{awayScore}</div>
          <div style={{ textAlign: "left", flex: 1, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", paddingLeft: 6 }}>
              <span style={{ fontSize: "min(18px, 4vw)", color: "#fff", fontWeight: 700, textTransform: "uppercase" }}>{awayTeam}</span>
          </div>
      </div>

      <button onClick={onSummary} style={{ ...resetBtnStyle, background: "transparent", color: "#94A3B8", width: 44, height: 44, flexShrink: 0, justifyContent: "flex-end" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
      </button>

    </header>
  );
}