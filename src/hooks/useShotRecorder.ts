import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { 
  AppEvent, 
  ShotOutcome, 
  WidthZoneIndex, 
  ShotDistance, 
  GoalCell 
} from "../types/AppEvents";
import { useEvents } from "./useEvents";

export type ShotSelection = {
  zone: WidthZoneIndex | null;
  distance: ShotDistance | null;
  goalCell: GoalCell | null;
};

type RecorderArgs = {
  matchId: string;
  phase: "ATTACK" | "DEFENSE";
  period?: 1 | 2; // FIX: Matchar AppEvent
  getTimeMs?: () => number;
};

export function useShotRecorder({ matchId, phase, period = 1, getTimeMs }: RecorderArgs) {
  const { addEvent } = useEvents(matchId);

  const recordShot = useCallback(
    async (outcome: ShotOutcome, selection: ShotSelection, passesBeforeGoal: number, isPenalty: boolean) => {
      
      const zone = isPenalty ? undefined : (selection.zone || undefined);
      const distance = isPenalty ? undefined : (selection.distance || undefined);
      const goalCell = selection.goalCell || undefined;
      const passes = !isPenalty && outcome === "GOAL" ? passesBeforeGoal : undefined;

      const event: AppEvent = {
        id: uuidv4(),
        matchId,
        timestamp: getTimeMs ? getTimeMs() : Date.now(),
        period, 
        phase,
        type: "SHOT", 
        isPenalty,
        outcome,
        zone,         
        distance,     
        goalCell,
        passes
      };

      await addEvent(event);
    },
    [addEvent, getTimeMs, matchId, period, phase],
  );

  return { recordShot };
}