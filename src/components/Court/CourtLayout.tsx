import { useMemo } from "react";

type Props = {
  selectedWidthZone: number | null;
  selectedDistance: string | null;
  selectedGoalCell: number | null;
  isPenaltyMode: boolean;
  onSelectShot: (zone: number, distance: string) => void;
  onSelectGoalCell: (cell: number) => void;
};

// Färger
const C = {
    post: "#E2E8F0", 
    net: "rgba(255,255,255,0.05)", 
    grid: "rgba(255,255,255,0.1)", 
    floor: "#1E293B", 
    area: "#0F172A", 
    line: "#FFFFFF", 
    divider: "rgba(255,255,255,0.15)", 
    highlight: "#38BDF8", 
    highlightAlpha: "rgba(56, 189, 248, 0.5)",
    highlightGreen: "#22C55E",
};

export const CourtLayout = ({
  selectedWidthZone,
  selectedDistance,
  selectedGoalCell,
  isPenaltyMode,
  onSelectShot,
  onSelectGoalCell,
}: Props) => {

  // --- GEOMETRI ---
  const W = 20; 
  const H_COURT = 15; 
  const CENTER_X = W / 2;
  const BASELINE_Y = 0;

  // --- MÅLETS DIMENSIONER ---
  const GOAL_W = 15; 
  const GOAL_H = 10; 
  
  const goalLeftX = CENTER_X - GOAL_W / 2;
  const goalTopY = BASELINE_Y - GOAL_H; 

  const POST_THICKNESS = 0.4; 
  const LW = 0.12; 

  // --- BANPROFILER ---
  const realGoalWidth = 3;
  const realPostL = CENTER_X - realGoalWidth / 2; 
  const realPostR = CENTER_X + realGoalWidth / 2; 

  const goalAreaPath = `M ${realPostL - 6},0 A 6,6 0 0,0 ${realPostL},6 L ${realPostR},6 A 6,6 0 0,0 ${realPostR + 6},0 Z`; 
  const freeThrowPath = `M ${realPostL - 9},0 A 9,9 0 0,0 ${realPostL},9 L ${realPostR},9 A 9,9 0 0,0 ${realPostR + 9},0`;

  const { wedges, dividerLines } = useMemo(() => {
      const zones = [];
      const lines = [];
      const totalZones = 5;
      const step = Math.PI / totalZones;
      const R = 25; 
      
      for(let i=0; i<totalZones; i++) {
          const startAngle = Math.PI - (i * step);
          const endAngle = Math.PI - ((i+1) * step);
          const p1 = { x: CENTER_X + R * Math.cos(startAngle), y: R * Math.sin(startAngle) };
          const p2 = { x: CENTER_X + R * Math.cos(endAngle), y: R * Math.sin(endAngle) };
          const path = `M ${CENTER_X},0 L ${p1.x},${p1.y} L ${p2.x},${p2.y} Z`;
          zones.push({ id: i + 1, path });
          if (i < totalZones - 1) lines.push({ x1: CENTER_X, y1: 0, x2: p2.x, y2: p2.y });
      }
      return { wedges: zones, dividerLines: lines };
  }, []);

  // --- RITA MÅLET (2x3 Grid = 6 Zoner) ---
  const renderGoal = () => {
    // 6 Celler: 1,2,3 (Uppe), 4,5,6 (Nere)
    const cells = [1, 2, 3, 4, 5, 6];
    const innerVB = `-${POST_THICKNESS} -${POST_THICKNESS} ${GOAL_W + POST_THICKNESS*2} ${GOAL_H + POST_THICKNESS}`;

    return (
      <g transform={`translate(${goalLeftX}, ${goalTopY})`}>
         <svg width={GOAL_W} height={GOAL_H} viewBox={innerVB} preserveAspectRatio="none" style={{ overflow: "visible" }}>
            
            {/* Nät */}
            <rect x="0" y="0" width={GOAL_W} height={GOAL_H} fill={C.net} />
            
            {/* Rutnät: 3 Kolumner, 2 Rader */}
            {/* Vertikala linjer */}
            <line x1={GOAL_W/3} y1="0" x2={GOAL_W/3} y2={GOAL_H} stroke={C.grid} strokeWidth={0.05} />
            <line x1={(GOAL_W/3)*2} y1="0" x2={(GOAL_W/3)*2} y2={GOAL_H} stroke={C.grid} strokeWidth={0.05} />
            
            {/* Horisontell linje (Mitten) */}
            <line x1="0" y1={GOAL_H/2} x2={GOAL_W} y2={GOAL_H/2} stroke={C.grid} strokeWidth={0.05} />

            {/* Ramen */}
            <rect x={-POST_THICKNESS} y={-POST_THICKNESS} width={POST_THICKNESS} height={GOAL_H + POST_THICKNESS} fill={C.post} rx={0.05} />
            <rect x={GOAL_W} y={-POST_THICKNESS} width={POST_THICKNESS} height={GOAL_H + POST_THICKNESS} fill={C.post} rx={0.05} />
            <rect x={-POST_THICKNESS} y={-POST_THICKNESS} width={GOAL_W + POST_THICKNESS*2} height={POST_THICKNESS} fill={C.post} rx={0.05} />

            {/* Klickytor */}
            {cells.map(cell => {
                // Logik för 6 zoner (3 kolumner, 2 rader)
                const col = (cell - 1) % 3; 
                const row = Math.floor((cell - 1) / 3); 
                
                const cellW = GOAL_W / 3;
                const cellH = GOAL_H / 2; // Hälften av höjden
                
                const isSelected = selectedGoalCell === cell;
                
                return (
                    <rect key={cell} x={col * cellW} y={row * cellH} width={cellW} height={cellH} 
                        fill={isSelected ? C.highlightGreen : "transparent"} 
                        stroke="transparent" strokeWidth={0}
                        style={{ cursor: "pointer" }} 
                        onClick={(e) => { e.stopPropagation(); onSelectGoalCell(cell); }}
                    />
                );
            })}
         </svg>
      </g>
    );
  };

  if (isPenaltyMode) {
    return (
        <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-start", paddingTop: 20, alignItems: "center", background: C.floor }}>
            <div style={{ color: "#A855F7", fontWeight: 800, fontSize: 20, marginBottom: 20 }}>STRAFFKAST (7m)</div>
            <svg width="100%" viewBox={`0 ${goalTopY - 2} ${W} ${GOAL_H + 5}`} preserveAspectRatio="xMidYMin meet">
                 {renderGoal()}
                 <line x1={CENTER_X - 1} y1={2} x2={CENTER_X + 1} y2={2} stroke="#fff" strokeWidth={LW} />
            </svg>
        </div>
    );
  }

  const mainViewBox = `0 ${goalTopY} ${W} ${H_COURT + Math.abs(goalTopY)}`;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: C.floor, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
        <svg width="100%" height="100%" viewBox={mainViewBox} preserveAspectRatio="xMidYMin meet">
            
            <defs>
                <clipPath id="clipInside6m"><path d={goalAreaPath} /></clipPath>
                <mask id="maskOutside6m">
                    <rect x="-10" y="-10" width={W+20} height={H_COURT+20} fill="white" />
                    <path d={goalAreaPath} fill="black" />
                </mask>
                <clipPath id="courtBoundary">
                    <rect x="0" y="0" width={W} height={H_COURT} />
                </clipPath>
                <clipPath id="lineClip">
                    <rect x="0" y="0" width={W} height={14} />
                </clipPath>
            </defs>

            <rect x="0" y="0" width={W} height={H_COURT} fill={C.floor} />
            <polyline points={`0,${H_COURT} 0,0 ${W},0 ${W},${H_COURT}`} fill="none" stroke={C.line} strokeWidth={LW} />

            <g clipPath="url(#courtBoundary)">
                <path d={goalAreaPath} fill={C.area} stroke={C.line} strokeWidth={LW} />
                <path d={freeThrowPath} fill="none" stroke={C.line} strokeWidth={LW} strokeDasharray="0.3 0.3" />
                <line x1={CENTER_X - 0.5} y1={7} x2={CENTER_X + 0.5} y2={7} stroke={C.line} strokeWidth={LW} />
                <line x1={CENTER_X - 0.2} y1={4} x2={CENTER_X + 0.2} y2={4} stroke={C.line} strokeWidth={LW} />
            </g>

            <g clipPath="url(#lineClip)">
                {dividerLines.map((line, i) => (
                    <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} 
                        stroke={C.divider} strokeWidth={0.05} strokeDasharray="0.3 0.3" />
                ))}
            </g>

            <g clipPath="url(#courtBoundary)">
                {wedges.map(z => {
                    const isSelected = selectedWidthZone === z.id && selectedDistance === "9m";
                    return (
                        <path key={`9m-${z.id}`} d={z.path} mask="url(#maskOutside6m)" 
                            fill={isSelected ? C.highlightAlpha : "transparent"} stroke="none" 
                            onClick={() => onSelectShot(z.id, "9m")} style={{ cursor: "pointer" }} 
                        />
                    );
                })}
                {wedges.map(z => {
                    const isSelected = selectedWidthZone === z.id && selectedDistance === "6m";
                    return (
                        <path key={`6m-${z.id}`} d={z.path} clipPath="url(#clipInside6m)" 
                            fill={isSelected ? C.highlight : "transparent"} stroke="none" 
                            onClick={() => onSelectShot(z.id, "6m")} style={{ cursor: "pointer" }} 
                        />
                    );
                })}
            </g>

            {renderGoal()}

        </svg>
    </div>
  );
};