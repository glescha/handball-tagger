// FIX: Importera från rätt fil
import type { AppEvent } from "./types/AppEvents";
import { computeShotSummary } from "./computeShotSummary";

export type Scope = "TOTAL" | "H1" | "H2";

export type PhaseSummary = {
  shots: ReturnType<typeof computeShotSummary>;
  turnovers: number;
  penalties: number;
};

export type Summary = {
  attack: PhaseSummary;
  defense: PhaseSummary;
};

export function filterEventsByScope(events: AppEvent[], scope: Scope): AppEvent[] {
  if (scope === "TOTAL") return events;
  
  if (scope === "H1") return events.filter((e) => e.period === 1);
  if (scope === "H2") return events.filter((e) => e.period === 2);
  
  return [];
}

function summarizePhase(events: AppEvent[]): PhaseSummary {
  return {
    shots: computeShotSummary(events),
    turnovers: events.filter((e) => e.type === "TURNOVER").length,
    // FIX: Räkna isPenalty istället för type === "PENALTY"
    penalties: events.filter((e) => e.isPenalty).length,
  };
}

export function computeSummary(events: AppEvent[]): Summary {
  const attackEvents = events.filter((e) => e.phase === "ATTACK");
  const defenseEvents = events.filter((e) => e.phase === "DEFENSE");

  return {
    attack: summarizePhase(attackEvents),
    defense: summarizePhase(defenseEvents),
  };
}

export function computeSummaryPack(events: AppEvent[], scope: Scope = "TOTAL"): Summary {
  return computeSummary(filterEventsByScope(events, scope));
}