import { useState } from "react";
import type { AppEvent } from "../../types/AppEvents"; 

type Props = {
  events: AppEvent[];
  style?: React.CSSProperties;
  onToggleImportant?: (event: AppEvent) => void;
  onEdit?: (event: AppEvent) => void;
};

// --- NEON FÄRGER FÖR TAGGNINGSSIDAN ---
const C = {
    GOAL: "#39FF14",   // Neon Green
    SAVE: "#FF5F1F",   // Neon Orange
    MISS: "#FFFF00",   // Neon Yellow
    PEN: "#D500F9",    // Neon Purple
    FREE: "#FFFFFF",
    DEFAULT: "#94A3B8"
};

// --- SPECIFIKA OMSTÄLLNINGSFÄRGER ---
const TURNOVER_COLORS: Record<string, Record<string, string>> = {
    ATTACK: {
        STEAL: "#93C5FD",
        LOST_BALL: "#60A5FA",
        TECHNICAL_FAULT: "#3B82F6",
        PASSIVE_PLAY: "#1E40AF"
    },
    DEFENSE: {
        STEAL: "#FCA5A5",
        LOST_BALL: "#F87171",
        TECHNICAL_FAULT: "#EF4444",
        PASSIVE_PLAY: "#B91C1C"
    }
};

const PHASE_COLORS = {
    ATTACK: "#38BDF8",
    DEFENSE: "#EF4444"
};

const ZONE_MAP: Record<number, string> = {
    1: "Zon 1", 2: "Zon 2", 3: "Zon 3", 4: "Zon 4", 5: "Zon 5"
};

const GOAL_MAP: Record<number, string> = {
    1: "Uppe V", 2: "Uppe M", 3: "Uppe H",
    4: "Nere V", 5: "Nere M", 6: "Nere H"
};

export const RecentEventList = ({ events, style, onToggleImportant, onEdit }: Props) => {
  
  const getEventStyle = (e: AppEvent) => {
      let color = C.DEFAULT; 
      let label: string = e.type; 
      
      const borderColor = e.phase === "ATTACK" ? PHASE_COLORS.ATTACK : PHASE_COLORS.DEFENSE;

      if (e.isPenalty) {
          color = C.PEN;
          label = "STRAFF";
      } else if (e.type === "SHOT") {
          if (e.outcome === "GOAL") { color = C.GOAL; label = "MÅL"; }
          else if (e.outcome === "SAVE") { color = C.SAVE; label = "RÄDDNING"; }
          else { color = C.MISS; label = "MISS"; }
      } else if (e.type === "TURNOVER") {
          if (e.subType) {
              color = TURNOVER_COLORS[e.phase][e.subType] || C.DEFAULT;
          }
          label = "OMSTÄLLNING"; 
      } else if (e.type === "FREE_THROW") {
          color = C.FREE;
          label = "FRIKAST";
      }

      return { color, borderColor, label };
  };

  const getDetails = (e: AppEvent) => {
      if (e.type === "TURNOVER") return e.subTypeLabel || ""; 
      if (e.type === "FREE_THROW") return "";
      if (e.isPenalty) {
          if (e.outcome === "GOAL") return "Mål";
          if (e.outcome === "SAVE") return "Räddning";
          if (e.outcome === "MISS") return "Miss";
          return "";
      }
      if (e.type === "SHOT") {
          const parts: string[] = [];
          if (e.distance) parts.push(e.distance);
          if (e.zone && ZONE_MAP[e.zone]) parts.push(ZONE_MAP[e.zone]);
          if (e.outcome === "MISS") return parts.join("  ");
          if (e.goalCell && GOAL_MAP[e.goalCell]) parts.push(GOAL_MAP[e.goalCell]);
          if (e.outcome === "GOAL" && e.passes) {
              const passMap: Record<number, string> = { 2: "<2", 4: "<4", 6: "5+" };
              if (passMap[e.passes]) parts.push(passMap[e.passes]);
          }
          return parts.join("  ");
      }
      return "";
  };

  if (events.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#64748B", fontSize: 12, fontStyle: "italic", minHeight: 100, ...style }}>
        Inga händelser än...
      </div>
    );
  }

  // Visa alla händelser i omvänd ordning (senaste först)
  const reversedEvents = [...events].reverse();

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", ...style }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4, padding: 4 }}>
        {reversedEvents.map((e, i) => {
            const { color, borderColor, label } = getEventStyle(e);
            const details = getDetails(e);
            const isImportant = (e as any).isImportant;

            return (
              <div key={e.id || i} style={{ 
                  padding: "4px 8px", 
                  borderRadius: 6,
                  background: `linear-gradient(90deg, ${color}33 0%, transparent 100%)`, 
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex", 
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: onEdit ? "pointer" : "default",
                  minHeight: 32 
              }}
              onClick={() => onEdit && onEdit(e)}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 800, fontSize: 12, color: borderColor }}>{label}</span>
                        {details && (
                            <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 500 }}>
                                {details}
                            </span>
                        )}
                    </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span style={{ fontSize: 10, color: "#64748B", fontFamily: "monospace" }}>
                            H{e.period} • {Math.floor(e.timestamp / 60000)}:{( (e.timestamp % 60000)/1000 ).toFixed(0).padStart(2, '0')}
                        </span>
                    </div>

                    {onToggleImportant && (
                        <button 
                            onClick={(ev) => { ev.stopPropagation(); onToggleImportant(e); }}
                            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, fontSize: 16, color: isImportant ? "#F59E0B" : "rgba(255,255,255,0.1)", lineHeight: 1 }}
                            title="Markera som viktig"
                        >
                            ★
                        </button>
                    )}
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
};