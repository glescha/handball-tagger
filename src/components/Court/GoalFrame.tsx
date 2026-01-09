// FILE: src/components/Court/GoalFrame.tsx
import type { GoalCell } from "../../types";

type GoalFrameProps = {
  selectedCell: GoalCell | null;
  onSelectCell: (cell: GoalCell) => void;
  width?: number;
  height?: number;
};

export function GoalFrame({ selectedCell, onSelectCell, width = 260, height = 180 }: GoalFrameProps) {
  const cols = 3;
  const rows = 2;
  const frameThickness = 12;

  // Inner räknar ut positionen baserat på tjockleken direkt, så vi behöver inte "frame" objektet
  const inner = { 
    x: frameThickness, 
    y: frameThickness, 
    w: width - frameThickness * 2, 
    h: height - frameThickness 
  };

  const cellW = inner.w / cols;
  const cellH = inner.h / rows;

  const cells: Array<{ cell: GoalCell; x: number; y: number }> = [];
  let c: GoalCell = 1;
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      cells.push({ cell: c, x: inner.x + k * cellW, y: inner.y + r * cellH });
      c = (c + 1) as GoalCell;
    }
  }

  const StripePattern = ({ id, rotate }: { id: string, rotate?: number }) => (
    <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse" patternTransform={rotate ? `rotate(${rotate})` : ""}>
      <rect width="10" height="20" fill="#FF0000" />
      <rect x="10" width="10" height="20" fill="#FFFFFF" />
    </pattern>
  );

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Målram">
      <defs>
        <StripePattern id="stripes-h" rotate={45} />
        <StripePattern id="stripes-v" rotate={45} />
      </defs>

      <rect x={0} y={0} width={frameThickness} height={height} fill="url(#stripes-v)" stroke="#ccc" strokeWidth="1"/>
      <rect x={width - frameThickness} y={0} width={frameThickness} height={height} fill="url(#stripes-v)" stroke="#ccc" strokeWidth="1"/>
      <rect x={0} y={0} width={width} height={frameThickness} fill="url(#stripes-h)" stroke="#ccc" strokeWidth="1"/>
      
      <rect x={0} y={0} width={frameThickness} height={frameThickness} fill="#FF0000" />
      <rect x={width - frameThickness} y={0} width={frameThickness} height={frameThickness} fill="#FF0000" />

      <rect x={inner.x} y={inner.y} width={inner.w} height={inner.h} fill="rgba(0,0,0,0.1)" />

      {cells.map(({ cell, x, y }) => {
        const isSelected = selectedCell === cell;
        return (
          <g
            key={cell}
            onClick={(e) => {
              e.stopPropagation();
              onSelectCell(cell);
            }}
            style={{ cursor: "pointer" }}
          >
            <rect
              x={x}
              y={y}
              width={cellW}
              height={cellH}
              fill={isSelected ? "rgba(0, 0, 139, 0.6)" : "transparent"}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={1}
            />
            <text
              x={x + cellW / 2}
              y={y + cellH / 2}
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize={24}
              fill={isSelected ? "#FFF" : "rgba(0,0,0,0.3)"}
              style={{ pointerEvents: "none", fontWeight: 800 }}
            >
              {cell}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
