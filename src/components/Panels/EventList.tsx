import { useState } from "react";
import type { AppEvent } from "../../types/AppEvents"; 

type Props = {
  events: AppEvent[];
  showFilters?: boolean;
  style?: React.CSSProperties;
  onToggleImportant?: (event: AppEvent) => void;
  onEdit?: (event: AppEvent) => void;
};

// --- FÄRGER FÖR HÄNDELSER (Bakgrund) ---
const C = {
    GOAL: "#22C55E",   // Standard Green
    SAVE: "#F97316",   // Standard Orange
    MISS: "#EAB308",   // Standard Yellow
    PEN: "#A855F7",    // Standard Purple
    FREE: "#94A3B8",
    DEFAULT: "#94A3B8"
};

// --- SPECIFIKA OMSTÄLLNINGSFÄRGER (Matchar knapparna) ---
const TURNOVER_COLORS = {
    // När vi är i ANFALL (Blå knappar)
    ATTACK: {
        STEAL: "#93C5FD",           // OFF_1 (Brytning M)
        LOST_BALL: "#60A5FA",       // OFF_2 (Tappad boll)
        TECHNICAL_FAULT: "#3B82F6", // OFF_3 (Regelfel)
        PASSIVE_PLAY: "#1E40AF"     // OFF_4 (Passivt spel)
    },
    // När vi är i FÖRSVAR (Röda knappar)
    DEFENSE: {
        STEAL: "#FCA5A5",           // DEF_1 (Bollvinst)
        LOST_BALL: "#F87171",       // DEF_2 (Tappad boll M)
        TECHNICAL_FAULT: "#EF4444", // DEF_3 (Regelfel M)
        PASSIVE_PLAY: "#B91C1C"     // DEF_4 (Passivt spel M)
    }
};

// Färger för faser (Vänster kant)
const PHASE_COLORS = {
    ATTACK: "#38BDF8", // Blå
    DEFENSE: "#EF4444" // Röd
};

// --- MAPPING TABELLER ---
const ZONE_MAP: Record<number, string> = {
    1: "Zon 1",
    2: "Zon 2",
    3: "Zon 3",
    4: "Zon 4",
    5: "Zon 5"
};

const GOAL_MAP: Record<number, string> = {
    1: "Uppe V",
    2: "Uppe M",
    3: "Uppe H",
    4: "Nere V",
    5: "Nere M",
    6: "Nere H"
};

export const EventList = ({ events, showFilters = true, style, onToggleImportant, onEdit }: Props) => {
  const [filter, setFilter] = useState<"ALL" | "ATTACK" | "DEFENSE">("ALL");

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
          // HÄMTA RÄTT FÄRG BASERAT PÅ FAS OCH SUBTYP
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
      // 1. OMSTÄLLNINGAR
      if (e.type === "TURNOVER") {
          return e.subTypeLabel || ""; 
      }

      // 2. FRIKAST
      if (e.type === "FREE_THROW") {
          return "";
      }

      // 3. STRAFF
      if (e.isPenalty) {
          if (e.outcome === "GOAL") return "Mål";
          if (e.outcome === "SAVE") return "Räddning";
          if (e.outcome === "MISS") return "Miss";
          return "";
      }

      // 4. SKOTT (Ej straff)
      if (e.type === "SHOT") {
          const parts: string[] = [];

          // A. Avstånd
          if (e.distance) parts.push(e.distance);

          // B. Bredd
          if (e.zone && ZONE_MAP[e.zone]) {
              parts.push(ZONE_MAP[e.zone]);
          }

          // MISS: Avstånd + Bredd
          if (e.outcome === "MISS") {
              return parts.join("  ");
          }

          // C. Placering
          if (e.goalCell && GOAL_MAP[e.goalCell]) {
              parts.push(GOAL_MAP[e.goalCell]);
          }

          // D. Pass
          if (e.outcome === "GOAL" && e.passes) {
              const passMap: Record<number, string> = {
                  2: "<2",
                  4: "<4",
                  6: "5+"
              };
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

  const filteredEvents = events.filter(e => {
      if (filter === "ALL") return true;
      return e.phase === filter;
  });

  const reversedEvents = [...filteredEvents].reverse();

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", ...style }}>
      
      {/* Filterknappar */}
      {showFilters && (
        <div style={{ display: "flex", gap: 4, marginBottom: 8, flexShrink: 0 }}>
            <button onClick={() => setFilter("ALL")} style={{ flex: 1, padding: "4px", fontSize: 10, fontWeight: 700, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: filter === "ALL" ? "#fff" : "rgba(255,255,255,0.05)", color: filter === "ALL" ? "#0F172A" : "#94A3B8", cursor: "pointer", transition: "all 0.2s" }}>ALLA</button>
            <button onClick={() => setFilter("ATTACK")} style={{ flex: 1, padding: "4px", fontSize: 10, fontWeight: 700, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: filter === "ATTACK" ? PHASE_COLORS.ATTACK : "rgba(255,255,255,0.05)", color: filter === "ATTACK" ? "#fff" : "#94A3B8", cursor: "pointer", transition: "all 0.2s" }}>ANFALL</button>
            <button onClick={() => setFilter("DEFENSE")} style={{ flex: 1, padding: "4px", fontSize: 10, fontWeight: 700, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: filter === "DEFENSE" ? PHASE_COLORS.DEFENSE : "rgba(255,255,255,0.05)", color: filter === "DEFENSE" ? "#fff" : "#94A3B8", cursor: "pointer", transition: "all 0.2s" }}>FÖRSVAR</button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, paddingRight: 2 }}>
        {reversedEvents.length === 0 ? (
            <div style={{ textAlign: "center", color: "#64748B", fontSize: 12, fontStyle: "italic", marginTop: 20 }}>
                Inga händelser i {filter === "ATTACK" ? "anfall" : "försvar"}
            </div>
        ) : (
          reversedEvents.map((e, i) => {
        const { color, borderColor, label } = getEventStyle(e);
        const details = getDetails(e);

        const isImportant = (e as any).isImportant;

        return (
          <div key={e.id || i} style={{ 
              padding: "8px 12px", 
              borderRadius: 6,
              // Gradient med specifik färg (ca 20% opacitet)
              background: `linear-gradient(90deg, ${color}33 0%, transparent 100%)`, 
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center",
              cursor: onEdit ? "pointer" : "default"
          }}
          onClick={() => onEdit && onEdit(e)}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: borderColor }}>{label}</span>
                {details && (
                    <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>
                        {details}
                    </span>
                )}
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
                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, fontSize: 18, color: isImportant ? "#F59E0B" : "rgba(255,255,255,0.1)", lineHeight: 1 }}
                        title="Markera som viktig"
                    >
                        ★
                    </button>
                )}
            </div>
          </div>
        );
      })
        )}
      </div>
    </div>
  );
};