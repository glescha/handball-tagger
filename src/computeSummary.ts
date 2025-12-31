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

export type Scope = "ALL" | "H1" | "H2";

export type CtxRecord<T> = Record<TeamContext, T>;

export function filterEventsByScope(events: MatchEvent[], scope: Scope): MatchEvent[] {
  if (scope === "ALL") return events;
  const period: Period = scope === "H1" ? "H1" : "H2";
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

// Endast mål + räddning per zon/avstånd (MISS saknar ofta zon/avstånd i din live-tag)
type ShotsPlay = Record<ShotZone, Record<ShotDistance, Record<Exclude<ShotOutcome, "MISS">, number>>>;

function shotsBlank(): ShotsPlay {
  return {
    1: { "6m": { MAL: 0, RADDNING: 0 }, "9m": { MAL: 0, RADDNING: 0 } },
    2: { "6m": { MAL: 0, RADDNING: 0 }, "9m": { MAL: 0, RADDNING: 0 } },
    3: { "6m": { MAL: 0, RADDNING: 0 }, "9m": { MAL: 0, RADDNING: 0 } },
  };
}

// Heatmap för mål + räddning när goalZone finns
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

    // Om du fortfarande har GOAL_PLACEMENT-event från äldre versioner:
    if (e.type === "GOAL_PLACEMENT") {
      heatmap[e.ctx][e.goalZone] += 1;
      continue;
    }

    if (e.type === "SHOT_PLAY") {
      const outcome = (e as any).outcome as ShotOutcome;

      // 1) Zon/avstånd-aggregat: endast om outcome är MAL/RADDNING och zon+distance finns
      if ((outcome === "MAL" || outcome === "RADDNING") && (e as any).zone && (e as any).distance) {
        const z = (e as any).zone as ShotZone;
        const d = (e as any).distance as ShotDistance;
        shotsPlay[e.ctx][z][d][outcome] += 1;
      }

      // 2) Heatmap: om goalZone finns (i din live-tag sparas goalZone för MAL/RADDNING)
      const gz = (e as any).goalZone as GoalZone | undefined;
      if (typeof gz === "number") {
        heatmap[e.ctx][gz] += 1;
      }

      continue;
    }

    // Ignorera andra ev. eventtyper (t.ex. TOTAL_ATTACK om du har kvar den någonstans)
  }

  return { freeThrows, turnovers, shortAttacks, heatmap, shotsPlay };
}
