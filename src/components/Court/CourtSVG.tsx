import type { GoalCell, ShotDistance, WidthZoneIndex } from "../../types";
import { useMemo } from "react";
import { polygonToPath } from "../../utils/geometry";

const COLORS = {
  floor: "#1E293B",     // Slate-800
  area: "#0F172A",      // Slate-900
  line: "#FFFFFF",      // Vit
  
  highlight6m: "rgba(56, 189, 248, 0.4)", // Sky-400
  highlight9m: "rgba(251, 191, 36, 0.25)", // Amber
  
  goalPost: "#E2E8F0",   // Slate-200 (Ljusaste delen)
  goalRed: "#CBD5E1",    // Slate-300 (Lite mörkare grå för ränderna/effekt)
  goalNet: "url(#netPattern)", 
  goalHighlight: "rgba(34, 197, 94, 0.6)", 
  penaltyPoint: "#C084FC", 
};

const LINE_WIDTH = 0.12;

type CourtSVGProps = {
  selectedWidthZone: WidthZoneIndex | null;
  selectedDistance: ShotDistance | null; 
  selectedGoalCell: GoalCell | null;
  isPenaltyMode?: boolean; 
  
  onSelectShot: (zone: WidthZoneIndex, distance: ShotDistance) => void;
  onSelectGoalCell: (cell: GoalCell) => void;
  
  width?: number | string;
  height?: number | string;
};

type GoalCellData = {
  id: GoalCell;
  x: number;
  y: number;
  w: number;
  h: number;
};

export function CourtSVG({
  selectedWidthZone,
  selectedDistance,
  selectedGoalCell,
  isPenaltyMode = false,
  onSelectShot,
  onSelectGoalCell,
  width = "100%",
  height = "100%",
}: CourtSVGProps) {
  const W = 20; 
  const H = 14; 

  // --- STORT MÅL ---
  const visualGoalWidth = 15;  
  const visualGoalHeight = 10; 
  
  const visualPostL = (W - visualGoalWidth) / 2; 
  const visualPostR = (W + visualGoalWidth) / 2; 
  const goalTopY = -visualGoalHeight; 

  // --- VIEWBOX FIX ---
  const viewBox = `0 -10.5 ${W} 25`; 

  // GEOMETRI (Riktiga mått)
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

  // ZONER
  const wedges = useMemo(() => {
    const zones = [];
    const totalZones = 5;
    const step = Math.PI / totalZones;
    const R = 25; 
    const center = { x: W / 2, y: 0 };

    for (let i = 0; i < totalZones; i++) {
      const startAngle = Math.PI - i * step;
      const endAngle = Math.PI - (i + 1) * step;
      const idx = (i + 1) as WidthZoneIndex;
      const p1 = { x: center.x + R * Math.cos(startAngle), y: R * Math.sin(startAngle) };
      const p2 = { x: center.x + R * Math.cos(endAngle), y: R * Math.sin(endAngle) };
      zones.push({ idx, poly: [center, p1, p2], key: i });
    }
    return zones;
  }, []);

  // MÅL-CELLER
  const goalCells = useMemo(() => {
    const cells: GoalCellData[] = [];
    const cellW = visualGoalWidth / 3; 
    const cellH = visualGoalHeight / 2; 
    
    [1, 2, 3].forEach((id, i) => cells.push({ id: id as GoalCell, x: visualPostL + i * cellW, y: goalTopY, w: cellW, h: cellH }));
    [4, 5, 6].forEach((id, i) => cells.push({ id: id as GoalCell, x: visualPostL + i * cellW, y: goalTopY + cellH, w: cellW, h: cellH }));
    return cells;
  }, [visualGoalWidth, visualGoalHeight, visualPostL, goalTopY]);

  // STOLPAR & RIBBA
  const thickness = 0.4;
  const postSegments = useMemo(() => {
    const segments = [];
    const segHeight = visualGoalHeight / 10;
    for (let i = 0; i < 10; i++) {
      segments.push({ y: goalTopY + i * segHeight, h: segHeight, color: i % 2 === 0 ? COLORS.goalRed : COLORS.goalPost });
    }
    return segments;
  }, [visualGoalHeight, goalTopY]);

  const barSegments = useMemo(() => {
    const segments = [];
    const segWidth = visualGoalWidth / 15;
    for (let i = 0; i < 15; i++) {
      segments.push({ x: visualPostL + i * segWidth, w: segWidth, color: i % 2 === 0 ? COLORS.goalRed : COLORS.goalPost });
    }
    return segments;
  }, [visualGoalWidth, visualPostL]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      style={{ touchAction: "manipulation", background: COLORS.floor, display: "block" }}
    >
      <defs>
        <pattern id="netPattern" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
           <path d="M 0.5 0 L 0 0 0 0.5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.05"/>
        </pattern>
        <clipPath id="clip-inner-6m"><path d={goalAreaPath} /></clipPath>
        <mask id="mask-outer-9m">
          <rect x="0" y="0" width={W} height={H} fill="white" />
          <path d={goalAreaPath} fill="black" />
        </mask>
        <clipPath id="court-clip"><rect x={0} y={0} width={W} height={H} /></clipPath>
      </defs>

      {/* PLANEN */}
      <path d={goalAreaPath} fill={COLORS.area} />

      {/* Zoner */}
      <g clipPath="url(#court-clip)">
        {wedges.map((z) => {
          const isSelectedWidth = selectedWidthZone === z.idx;
          const isSelected6m = isSelectedWidth && selectedDistance === "6m";
          const isSelected9m = isSelectedWidth && selectedDistance === "9m";

          return (
            <g key={z.key}>
              <path
                onClick={(e) => { e.stopPropagation(); onSelectShot(z.idx, "9m"); }}
                mask="url(#mask-outer-9m)"
                style={{ cursor: "pointer" }}
                d={polygonToPath(z.poly)}
                fill={isSelected9m ? COLORS.highlight9m : "transparent"}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={0.05} 
                className="transition-colors duration-150"
              />
              <path
                onClick={(e) => { e.stopPropagation(); onSelectShot(z.idx, "6m"); }}
                clipPath="url(#clip-inner-6m)"
                style={{ cursor: "pointer" }}
                d={polygonToPath(z.poly)}
                fill={isSelected6m ? COLORS.highlight6m : "transparent"}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={0.05} 
                className="transition-colors duration-150"
              />
            </g>
          );
        })}
      </g>

      {/* RIKTIGA HANDBOLLSLINJER */}
      <g stroke={COLORS.line} strokeWidth={LINE_WIDTH} fill="none" style={{ pointerEvents: 'none' }} clipPath="url(#court-clip)">
        <path d={goalAreaPath} />
        <path d={freeThrowPath} strokeDasharray="0.3 0.3" />
        <line x1={W/2 - 0.5} y1={7} x2={W/2 + 0.5} y2={7} /> 
        <line x1={W/2 - 0.2} y1={4} x2={W/2 + 0.2} y2={4} /> 
        <rect x={0} y={0} width={W} height={H} />
      </g>

      {/* STRAFFPUNKT */}
      {isPenaltyMode && (
         <g>
           <circle cx={W/2} cy={7.4} r={0.5} fill={COLORS.penaltyPoint} opacity={1} />
           <circle cx={W/2} cy={7.4} r={0.8} fill={COLORS.penaltyPoint} opacity={0.4} className="animate-pulse" />
         </g>
      )}

      {/* MÅLET */}
      <g>
        <rect x={visualPostL} y={goalTopY} width={visualGoalWidth} height={visualGoalHeight} fill={COLORS.goalNet} />

        {/* Celler */}
        {goalCells.map((cell) => {
          const isSelected = selectedGoalCell === cell.id;
          return (
            <g key={cell.id} onClick={(e) => { e.stopPropagation(); onSelectGoalCell(cell.id); }} style={{ cursor: "pointer" }}>
              <rect
                x={cell.x} y={cell.y} width={cell.w} height={cell.h}
                fill={isSelected ? COLORS.goalHighlight : "transparent"}
                stroke="rgba(255,255,255,0.05)" strokeWidth={0.05}
              />
            </g>
          );
        })}

        {/* HÖRN (Fyller glappet i kryssen) */}
        <rect x={visualPostL - thickness} y={goalTopY - thickness} width={thickness} height={thickness} fill={COLORS.goalRed} />
        <rect x={visualPostR} y={goalTopY - thickness} width={thickness} height={thickness} fill={COLORS.goalRed} />

        {/* Ramverk (Stolpar & Ribba) */}
        <g transform={`translate(${visualPostL - thickness}, 0)`}>
            {postSegments.map((seg, i) => (<rect key={i} x={0} y={seg.y} width={thickness} height={seg.h} fill={seg.color} />))}
        </g>
        <g transform={`translate(${visualPostR}, 0)`}>
            {postSegments.map((seg, i) => (<rect key={i} x={0} y={seg.y} width={thickness} height={seg.h} fill={seg.color} />))}
        </g>
        <g transform={`translate(0, ${goalTopY - thickness})`}>
            {barSegments.map((seg, i) => (<rect key={i} x={seg.x} y={0} width={seg.w} height={thickness} fill={seg.color} />))}
        </g>
        
        <line x1={visualPostL} y1={0} x2={visualPostR} y2={0} stroke={COLORS.goalPost} strokeWidth={0.05} />
      </g>
    </svg>
  );
}