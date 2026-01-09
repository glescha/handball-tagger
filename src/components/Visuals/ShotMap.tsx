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

export function ShotMap({ events, mode = "ATTACK" }: Props) {
  const shots = events.filter(e => e.type === "SHOT");

  const getStats = (zone: number, dist: string) => {
      const subset = shots.filter(e => e.zone === zone && e.distance === dist);
      const goals = subset.filter(e => e.outcome === "GOAL").length;
      return { goals, total: subset.length };
  };

  const penalties = shots.filter(e => e.isPenalty);
  const penGoals = penalties.filter(e => e.outcome === "GOAL").length;

  // GEOMETRI
  const W = 20; 
  const H = 16; 
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

  const SectorLine = ({ angleIdx }: { angleIdx: number }) => {
      const totalZones = 5;
      const step = Math.PI / totalZones;
      const angle = Math.PI - (angleIdx * step); 
      const len = 14; 
      const x = CENTER_X + len * Math.cos(angle);
      const y = len * Math.sin(angle);
      return <line x1={CENTER_X} y1={0} x2={x} y2={y} stroke={C.subtleLine} strokeWidth={0.05} strokeDasharray="0.2 0.2" />;
  };

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
              {/* Bakgrundsplatta för läsbarhet */}
              <rect x="-1.1" y="-0.7" width="2.2" height="1.4" fill="#1E293B" opacity="0.9" rx="0.3" stroke={isPenalty ? "#C084FC" : "rgba(255,255,255,0.1)"} strokeWidth={isPenalty ? 0.05 : 0.02} />
              
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
      <svg width="100%" height="100%" viewBox={`0 -2 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        
        <rect x="0" y="-2" width={W} height={H + 2} fill={C.floor} />

        {/* PLANENS GRÄNSER */}
        <line x1="0" y1="0" x2="20" y2="0" stroke={C.line} strokeWidth={0.15} />
        <line x1="0" y1="0" x2="0" y2="15" stroke={C.line} strokeWidth={0.15} />
        <line x1="20" y1="0" x2="20" y2="15" stroke={C.line} strokeWidth={0.15} />

        <path d={goalAreaPath} fill={C.area} stroke={C.line} strokeWidth={0.1} />
        <path d={freeThrowPath} fill="none" stroke={C.line} strokeWidth={0.08} strokeDasharray="0.3 0.3" />
        
        <line x1={CENTER_X - 0.5} y1={7} x2={CENTER_X + 0.5} y2={7} stroke={C.line} strokeWidth={0.1} />
        <line x1={CENTER_X - 0.2} y1={4} x2={CENTER_X + 0.2} y2={4} stroke={C.line} strokeWidth={0.1} />

        <SectorLine angleIdx={1} />
        <SectorLine angleIdx={2} />
        <SectorLine angleIdx={3} />
        <SectorLine angleIdx={4} />

        <rect x={realPostL} y="-0.5" width={realGoalWidth} height={0.5} fill="#CBD5E1" />

        {/* --- STATISTIK --- */}
        
        {/* Zon 1 (Vänster Kant) */}
        <ZoneLabel x="4.2" y="1.2" stats={getStats(1, "6m")} />
        <ZoneLabel x="1.5" y="3.5" stats={getStats(1, "9m")} />
        
        {/* Zon 2 (Vänster Niometer) */}
        <ZoneLabel x="7.2" y="2.9" stats={getStats(2, "6m")} />
        <ZoneLabel x="2.5" y="8.5" stats={getStats(2, "9m")} />

        {/* Zon 3 (Mitt Niometer) */}
        <ZoneLabel x="10" y="4.5" stats={getStats(3, "6m")} />
        <ZoneLabel x="10" y="10.5" stats={getStats(3, "9m")} />

        {/* Zon 4 (Höger Niometer) */}
        <ZoneLabel x="12.8" y="2.9" stats={getStats(4, "6m")} />
        <ZoneLabel x="17.5" y="8.5" stats={getStats(4, "9m")} />

        {/* Zon 5 (Höger Kant) */}
        <ZoneLabel x="15.8" y="1.2" stats={getStats(5, "6m")} />
        <ZoneLabel x="18.5" y="3.5" stats={getStats(5, "9m")} />

        {/* Straff */}
        {penalties.length > 0 && (
             <ZoneLabel x={CENTER_X} y={7.8} stats={{ goals: penGoals, total: penalties.length }} isPenalty={true} />
        )}

      </svg>
    </div>
  );
}