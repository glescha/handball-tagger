import type { AppEvent } from "../../types/AppEvents";

type Props = { 
    events: AppEvent[];
    mode?: "ATTACK" | "DEFENSE"; 
};

const C = { 
  floor: "#1E293B", 
  area: "#0F172A", 
  line: "#FFFFFF", 
  subtleLine: "rgba(255,255,255,0.15)", 
  textSub: "#94A3B8"
};

export function ShotMapPositions({ events, mode = "ATTACK" }: Props) {
  const shots = events.filter(e => e.type === "SHOT");

  // Hjälpfunktion för att filtrera fram statistik baserat på logiken i SummaryView
  const getStats = (filterFn: (e: AppEvent) => boolean) => {
      const subset = shots.filter(filterFn);
      const goals = subset.filter(e => e.outcome === "GOAL").length;
      return { goals, total: subset.length };
  };

  // GEOMETRI
  const W = 20; 
  const H = 14; 
  const CENTER_X = 10;
  const realGoalWidth = 3;
  const realPostL = (W - realGoalWidth) / 2; 
  const realPostR = (W + realGoalWidth) / 2; 

  const goalAreaPath = `
    M ${realPostL - 6},0 
    A 6,6 0 0,0 ${realPostL},6 
    L ${realPostR},6 
    A 6,6 0 0,0 ${realPostR + 6},0 
    L ${realPostR + 6},0
    L ${realPostL - 6},0
    Z
  `; 
  
  const freeThrowPath = `
    M ${realPostL - 9},0 
    A 9,9 0 0,0 ${realPostL},9 
    L ${realPostR},9 
    A 9,9 0 0,0 ${realPostR + 9},0
  `;

  const PosLabel = ({ x, y, stats }: any) => {
      if (stats.total === 0) return null;
      const pct = Math.round((stats.goals/stats.total)*100);
      const color = mode === "ATTACK" ? (pct >= 50 ? "#4CAF50" : "#38BDF8") : "#F43F5E";

      return (
          <g transform={`translate(${x}, ${y})`}>
              <text x="0" y="0" textAnchor="middle" fill={color} fontSize="0.85" fontWeight="800">
                  {stats.goals}/{stats.total}
              </text>
              <text x="0" y="0.55" textAnchor="middle" fill={C.textSub} fontSize="0.45" fontWeight="600">
                  {pct}%
              </text>
          </g>
      );
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <svg width="100%" height="100%" viewBox={`0 -1 ${W} ${H}`} preserveAspectRatio="xMidYMin meet">
        <defs>
            <clipPath id="courtClipPos"><rect x="0" y="0" width="20" height="15" /></clipPath>
        </defs>
        <rect x="0" y="-1" width={W} height={H + 1} fill={C.floor} />
        <line x1="0" y1="0" x2="20" y2="0" stroke={C.line} strokeWidth={0.15} />
        <line x1="0" y1="0" x2="0" y2="15" stroke={C.line} strokeWidth={0.15} />
        <line x1="20" y1="0" x2="20" y2="15" stroke={C.line} strokeWidth={0.15} />
        <path d={goalAreaPath} fill={C.area} stroke={C.line} strokeWidth={0.1} />
        <path d={freeThrowPath} fill="none" stroke={C.line} strokeWidth={0.08} strokeDasharray="0.3 0.3" clipPath="url(#courtClipPos)" />
        
        <line x1={CENTER_X - 0.5} y1={7} x2={CENTER_X + 0.5} y2={7} stroke={C.line} strokeWidth={0.1} />
        <rect x={realPostL} y="-0.5" width={realGoalWidth} height={0.5} fill="#CBD5E1" />

        {/* V6 (Zon 1, 6m) */}
        <PosLabel x="2.5" y="2.5" stats={getStats(e => e.zone === 1 && e.distance === "6m")} />
        {/* V9 (Zon 2, 9m) */}
        <PosLabel x="5" y="9" stats={getStats(e => e.zone === 2 && e.distance === "9m")} />
        {/* M6 (Zon 2/3/4, 6m) */}
        <PosLabel x="10" y="5.5" stats={getStats(e => (e.zone === 2 || e.zone === 3 || e.zone === 4) && e.distance === "6m")} />
        {/* M9 (Zon 3, 9m) */}
        <PosLabel x="10" y="11" stats={getStats(e => e.zone === 3 && e.distance === "9m")} />
        {/* H9 (Zon 4, 9m) */}
        <PosLabel x="15" y="9" stats={getStats(e => e.zone === 4 && e.distance === "9m")} />
        {/* H6 (Zon 5, 6m) */}
        <PosLabel x="17.5" y="2.5" stats={getStats(e => e.zone === 5 && e.distance === "6m")} />
      </svg>
    </div>
  );
}