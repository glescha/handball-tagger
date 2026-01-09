// FILE: src/hooks/useShotSelection.ts
import { useCallback, useMemo, useState } from "react";
import type { GoalCell, ShotDistance, WidthZoneIndex } from "../types";

export type ShotSelection = {
  widthZone: WidthZoneIndex | null;
  distance: ShotDistance | null;
  goalCell: GoalCell | null;
};

const EMPTY: ShotSelection = { widthZone: null, distance: null, goalCell: null };

function clamp(v: number) {
  return Math.max(0, Math.min(99, v));
}

export function useShotSelection() {
  const [selection, setSelection] = useState<ShotSelection>(EMPTY);
  const [passesBeforeGoal, setPassesBeforeGoal] = useState<number>(0);

  const incPasses = useCallback(() => setPassesBeforeGoal((p) => clamp(p + 1)), []);
  const decPasses = useCallback(() => setPassesBeforeGoal((p) => clamp(p - 1)), []);

  const reset = useCallback(() => {
    setSelection(EMPTY);
    setPassesBeforeGoal(0);
  }, []);

  return useMemo(
    () => ({
      selection,
      setSelection,
      passesBeforeGoal,
      setPassesBeforeGoal: (v: number) => setPassesBeforeGoal(clamp(v)),
      incPasses,
      decPasses,
      reset,
    }),
    [selection, passesBeforeGoal, incPasses, decPasses, reset],
  );
}
