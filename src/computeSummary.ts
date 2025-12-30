// src/computeSummary.ts
import type {
  CtxRecord,
  GoalPlacement,
  MatchEvent,
  PassBucket,
  Scope,
  ShotDistance,
  ShotOutcome,
  ShotZone,
  TurnoverType,
} from "./types";

export function filterEventsByScope(events: MatchEvent[], scope: Scope): MatchEvent[] {
  if (scope === "ALL") return events;
  if (scope === "P1") return events.filter((e) => e.period === "H1");
  return events.filter((e) => e.period === "H2");
}

function emptyCtxNumber(): CtxRecord<number> {
  return { ANFALL: 0, FORSVAR: 0 };
}

function emptyTurnovers(): CtxRecord<Record<TurnoverType, number>> {
  return {
    ANFALL: { Brytning: 0, "Tappad boll": 0, Regelfel: 0, "Passivt spel": 0 },
    FORSVAR: { Brytning: 0, "Tappad boll": 0, Regelfel: 0, "Passivt spel": 0 },
  };
}

function emptyPass(): CtxRecord<Record<PassBucket, number>> {
  return {
    ANFALL: { "<2": 0, "<4": 0, FLER: 0 },
    FORSVAR: { "<2": 0, "<4": 0, FLER: 0 },
  };
}

function emptyHeat(): CtxRecord<Record<GoalPlacement, number>> {
  const base: Record<GoalPlacement, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  return { ANFALL: { ...base }, FORSVAR: { ...base } };
}

type ShotsGrid = Record<ShotZone, Record<ShotDistance, Record<Extract<ShotOutcome, "MAL" | "RADDNING">, number>>>;
function emptyShotsGrid(): ShotsGrid {
  const row = () => ({ MAL: 0, RADDNING: 0 });
  return {
    1: { "6m": row(), "9m": row() },
    2: { "6m": row(), "9m": row() },
    3: { "6m": row(), "9m": row() },
  };
}

function emptyShotsPlay(): CtxRecord<ShotsGrid> {
  return { ANFALL: emptyShotsGrid(), FORSVAR: emptyShotsGrid() };
}

export function computeSummaryPack(events: MatchEvent[]) {
  const freeThrows = emptyCtxNumber();
  const turnovers = emptyTurnovers();
  const shortAttacks = emptyPass();
  const heatmap = emptyHeat();
  const shotsPlay = emptyShotsPlay();

  for (const e of events) {
    const ctx = e.ctx;

    if (e.type === "FREE_THROW") {
      freeThrows[ctx] += 1;
      continue;
    }

    if (e.type === "TURNOVER") {
      turnovers[ctx][e.turnoverType] += 1;
      continue;
    }

    if (e.type === "SHOT_PLAY") {
      if (e.outcome === "MAL" || e.outcome === "RADDNING") {
        shotsPlay[ctx][e.zone][e.distance][e.outcome] += 1;
      }

      if ((e.outcome === "MAL" || e.outcome === "RADDNING") && e.goalPlacement) {
        heatmap[ctx][e.goalPlacement] += 1;
      }

      if (e.outcome === "MAL") {
        const b: PassBucket = e.passBucket ?? "<4";
        shortAttacks[ctx][b] += 1;
      }

      continue;
    }
  }

  return {
    freeThrows,
    turnovers,
    shortAttacks,
    heatmap,
    shotsPlay,
  };
}