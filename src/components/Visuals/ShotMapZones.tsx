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

export function ShotMapZones({ events, mode = "ATTACK" }: Props) {
  const shots = events.filter(e => e.type === "SHOT");

  const getStats = (zone: number) => {
      const subset = shots.filter(e => e.zone === zone);
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

  const SectorLine = ({ angleIdx }: { angleIdx: number }) => {
      const totalZones = 5;
      const step = Math.PI / totalZones;
      const angle = Math.PI - (angleIdx * step); 
      const len = 14; 
      const x = CENTER_X + len * Math.cos(angle);
      const y = len * Math.sin(angle);
      return <line x1={CENTER_X} y1={0} x2={x} y2={y} stroke={C.subtleLine} strokeWidth={0.05} strokeDasharray="0.2 0.2" />;
  };

  const ZoneLabel = ({ x, y, stats }: any) => {
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
            <clipPath id="courtClipZones"><rect x="0" y="0" width="20" height="15" /></clipPath>
        </defs>
        <rect x="0" y="-1" width={W} height={H + 1} fill={C.floor} />
        <line x1="0" y1="0" x2="20" y2="0" stroke={C.line} strokeWidth={0.15} />
        <line x1="0" y1="0" x2="0" y2="15" stroke={C.line} strokeWidth={0.15} />
        <line x1="20" y1="0" x2="20" y2="15" stroke={C.line} strokeWidth={0.15} />
        <path d={goalAreaPath} fill={C.area} stroke={C.line} strokeWidth={0.1} />
        <path d={freeThrowPath} fill="none" stroke={C.line} strokeWidth={0.08} strokeDasharray="0.3 0.3" clipPath="url(#courtClipZones)" />
        <g clipPath="url(#courtClipZones)">
            <SectorLine angleIdx={1} />
            <SectorLine angleIdx={2} />
            <SectorLine angleIdx={3} />
            <SectorLine angleIdx={4} />
        </g>
        <rect x={realPostL} y="-0.5" width={realGoalWidth} height={0.5} fill="#CBD5E1" />

        <ZoneLabel x="2.5" y="2.5" stats={getStats(1)} />
        <ZoneLabel x="6" y="6.5" stats={getStats(2)} />
        <ZoneLabel x="10" y="8" stats={getStats(3)} />
        <ZoneLabel x="14" y="6.5" stats={getStats(4)} />
        <ZoneLabel x="17.5" y="2.5" stats={getStats(5)} />
      </svg>
    </div>
  );
}