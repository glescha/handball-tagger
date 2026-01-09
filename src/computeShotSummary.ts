import type { AppEvent, ShotDistance } from "./types/AppEvents";

export type ShotSummary = {
  total: number;
  goals: number;
  misses: number;
  saves: number;
  byDistance: Record<ShotDistance, { total: number; goals: number; misses: number; saves: number }>;
};

const DISTANCES: ShotDistance[] = ["6m", "9m", "7m"];

export function computeShotSummary(events: AppEvent[]): ShotSummary {
  // Initiera statistiken
  const byDistance = DISTANCES.reduce((acc, d) => {
    acc[d] = { total: 0, goals: 0, misses: 0, saves: 0 };
    return acc;
  }, {} as ShotSummary["byDistance"]);

  const s: ShotSummary = { total: 0, goals: 0, misses: 0, saves: 0, byDistance };

  for (const e of events) {
    if (e.type !== "SHOT" || !e.outcome) {
      continue;
    }

    const outcome = e.outcome;

    // Total statistik
    s.total += 1;
    if (outcome === "GOAL") s.goals += 1;
    if (outcome === "MISS") s.misses += 1;
    if (outcome === "SAVE") s.saves += 1;

    // Avståndsstatistik
    if (e.distance) {
      // FIX: Type assertion (as ShotDistance) löser index-felet
      const key = e.distance as ShotDistance;
      
      // Kontrollera att nyckeln faktiskt finns i objektet innan vi försöker skriva till den
      if (s.byDistance[key]) {
        const b = s.byDistance[key];
        b.total += 1;
        if (outcome === "GOAL") b.goals += 1;
        if (outcome === "MISS") b.misses += 1;
        if (outcome === "SAVE") b.saves += 1;
      }
    }
  }

  return s;
}