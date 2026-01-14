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

export function ShotMapDistance({ events, mode = "ATTACK" }: Props) {
  const shots = events.filter(e => e.type === "SHOT");

  const getStatsByDist = (dist: string) => {
      const subset = shots.filter(e => e.distance === dist);
      const goals = subset.filter(e => e.outcome === "GOAL").length;
      return { goals, total: subset.length };
  };

  const penalties = shots.filter(e => e.isPenalty);
  const penGoals = penalties.filter(e => e.outcome === "GOAL").length;

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

  const ZoneLabel = ({ x, y, stats, isPenalty = false }: any) => {
      if (stats.total === 0) return null;
      const pct = Math.round((stats.goals/stats.total)*100);
      
      let color = "#fff";
      if (isPenalty) {
          color = "#C084FC";
      } else if (mode === "ATTACK") {
          color = pct >= 70 ? "#4CAF50" : "#38BDF8"; 
      } else {
          color = "#F43F5E"; 
      }

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
            <clipPath id="courtClip"><rect x="0" y="0" width="20" height="15" /></clipPath>
        </defs>

        <rect x="0" y="-1" width={W} height={H + 1} fill={C.floor} />

        {/* PLANENS GRÄNSER */}
        <line x1="0" y1="0" x2="20" y2="0" stroke={C.line} strokeWidth={0.15} />
        <line x1="0" y1="0" x2="0" y2="15" stroke={C.line} strokeWidth={0.15} />
        <line x1="20" y1="0" x2="20" y2="15" stroke={C.line} strokeWidth={0.15} />

        <path d={goalAreaPath} fill={C.area} stroke={C.line} strokeWidth={0.1} />
        <path d={freeThrowPath} fill="none" stroke={C.line} strokeWidth={0.08} strokeDasharray="0.3 0.3" clipPath="url(#courtClip)" />
        
        <line x1={CENTER_X - 0.5} y1={7} x2={CENTER_X + 0.5} y2={7} stroke={C.line} strokeWidth={0.1} />

        <rect x={realPostL} y="-0.5" width={realGoalWidth} height={0.5} fill="#CBD5E1" />

        {/* --- STATISTIK --- */}
        
        {/* 6m (Alla avslut från 6m - placeras i målgården) */}
        <ZoneLabel x={CENTER_X} y={3.5} stats={getStatsByDist("6m")} />
        
        {/* 9m (Alla avslut från 9m - placeras utanför frikastlinjen) */}
        <ZoneLabel x={CENTER_X} y={11.5} stats={getStatsByDist("9m")} />

        {/* Straff */}
        {penalties.length > 0 && (
             <ZoneLabel x={CENTER_X} y={7.8} stats={{ goals: penGoals, total: penalties.length }} isPenalty={true} />
        )}

      </svg>
    </div>
  );
}