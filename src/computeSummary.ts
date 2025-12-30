// src/computeSummary.ts
import type {
  GoalZone,
  MatchEvent,
  PassBucket,
  Period,
  ShotDistance,
  ShotOutcome,
  ShotZone,
  TeamContext,
  TurnoverType,
} from "./types";

export type Scope = "ALL" | "P1" | "P2";

export type CtxRecord<T> = Record<TeamContext, T>;

export function filterEventsByScope(events: MatchEvent[], scope: Scope): MatchEvent[] {
  if (scope === "ALL") return events;
  const period: Period = scope === "P1" ? "P1" : "P2";
  return events.filter((e) => e.period === period);
}

function ctxRecord<T>(factory: () => T): CtxRecord<T> {
  return { ANFALL: factory(), FORSVAR: factory() };
}

function turnoverBlank(): Record<TurnoverType, number> {
  return { Brytning: 0, "Tappad boll": 0, Regelfel: 0, "Passivt spel": 0 };
}

function passBlank(): Record<PassBucket, number> {
  return { "<2": 0, "<4": 0, FLER: 0 };
}

type ShotsPlay = Record<ShotZone, Record<ShotDistance, Record<Exclude<ShotOutcome, "MISS">, number>>>;

function shotsBlank(): ShotsPlay {
  return {
    1: { "6m": { MAL: 0, RADDNING: 0 }, "9m": { MAL: 0, RADDNING: 0 } },
    2: { "6m": { MAL: 0, RADDNING: 0 }, "9m": { MAL: 0, RADDNING: 0 } },
    3: { "6m": { MAL: 0, RADDNING: 0 }, "9m": { MAL: 0, RADDNING: 0 } },
  };
}

function heatBlank(): Record<GoalZone, number> {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
}

export function computeSummaryPack(events: MatchEvent[]) {
  const freeThrows = ctxRecord(() => 0);
  const turnovers = ctxRecord(() => turnoverBlank());
  const shortAttacks = ctxRecord(() => passBlank());
  const heatmap = ctxRecord(() => heatBlank());
  const shotsPlay = ctxRecord(() => shotsBlank());

  for (const e of events) {
    if (e.type === "FREE_THROW") {
      freeThrows[e.ctx] += 1;
      continue;
    }
    if (e.type === "TURNOVER") {
      turnovers[e.ctx][e.turnoverType] += 1;
      continue;
    }
    if (e.type === "SHORT_ATTACK") {
      shortAttacks[e.ctx][e.shortType] += 1;
      continue;
    }
    if (e.type === "GOAL_PLACEMENT") {
      heatmap[e.ctx][e.goalZone] += 1;
      continue;
    }
    if (e.type === "SHOT_PLAY") {
      if (e.outcome === "MAL" || e.outcome === "RADDNING") {
        shotsPlay[e.ctx][e.zone][e.distance][e.outcome] += 1;
      }
      if (e.outcome === "MAL" && typeof (e as any).goalZone === "number") {
        heatmap[e.ctx][(e as any).goalZone as GoalZone] += 1;
      }
      continue;
    }
  }

  return { freeThrows, turnovers, shortAttacks, heatmap, shotsPlay };
}
