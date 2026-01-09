
import type { GoalCell } from "../../types";
import { THEME } from "../../styles/theme";

type GoalProps = {
  goalWidth: number;
  goalHeight: number;
  courtWidth: number;
  selectedGoalCell: GoalCell | null;
  onSelectGoalCell: (cell: GoalCell) => void;
};

export function Goal({
  goalWidth,
  goalHeight,
  courtWidth,
  selectedGoalCell,
  onSelectGoalCell,
}: GoalProps) {
  const goalCenter = { x: courtWidth / 2, y: 0 };
  const postLeft = { x: goalCenter.x - goalWidth / 2, y: 0 };
  const postRight = { x: goalCenter.x + goalWidth / 2, y: 0 };

  const goalCells = (() => {
    const cells: Array<{
      cell: GoalCell;
      x: number;
      y: number;
      width: number;
      height: number;
    }> = [];
    const cols = 3;
    const rows = 2;
    const cellW = goalWidth / cols;
    const cellH = goalHeight / rows;
    let c: GoalCell = 1;
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < cols; k++) {
        cells.push({
          cell: c,
          x: postLeft.x + k * cellW,
          y: -goalHeight + r * cellH,
          width: cellW,
          height: cellH,
        });
        c = (c + 1) as GoalCell;
      }
    }
    return cells;
  })();

  function stripedRect(
    x: number,
    y: number,
    w: number,
    h: number,
    segments: number,
    vertical: boolean,
  ) {
    const seg = vertical ? h / segments : w / segments;
    return (
      <>
        {Array.from({ length: segments }).map((_, i) => {
          const isRed = i % 2 === 0;
          const rx = vertical ? x : x + i * seg;
          const ry = vertical ? y + i * seg : y;
          const rw = vertical ? w : seg;
          const rh = vertical ? seg : h;
          return (
            <rect
              key={`${x}-${y}-${i}`}
              x={rx}
              y={ry}
              width={rw}
              height={rh}
              fill={isRed ? THEME.goalFrame : THEME.goalWhite}
            />
          );
        })}
      </>
    );
  }

  return (
    <g className="goal">
      {stripedRect(postLeft.x - 0.1, -goalHeight, 0.1, goalHeight, Math.round(goalHeight / 0.2), true)}
      {stripedRect(postRight.x, -goalHeight, 0.1, goalHeight, Math.round(goalHeight / 0.2), true)}
      {stripedRect(postLeft.x, -goalHeight - 0.1, goalWidth, 0.1, Math.round(goalWidth / 0.2), false)}

      <rect
        x={postLeft.x - 0.1}
        y={-goalHeight - 0.1}
        width={0.1}
        height={0.1}
        fill={THEME.goalFrame}
      />
      <rect
        x={postRight.x}
        y={-goalHeight - 0.1}
        width={0.1}
        height={0.1}
        fill={THEME.goalFrame}
      />

      {/* Goal Zones Grid */}
      <g className="goal-zones">
        {goalCells.map(({ cell, x, y, width, height }) => {
          const isSelected = selectedGoalCell === cell;
          return (
            <g
              key={cell}
              onPointerDown={(e) => {
                e.preventDefault();
                onSelectGoalCell(cell);
              }}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={
                  isSelected
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(255,255,255,0.05)"
                }
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={0.05}
              />
              <text
                x={x + width / 2}
                y={y + height / 2}
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize={0.5}
                fill="rgba(255,255,255,0.9)"
                style={{ pointerEvents: "none", fontWeight: 700 }}
              >
                {cell}
              </text>
            </g>
          );
        })}
      </g>
    </g>
  );
}
