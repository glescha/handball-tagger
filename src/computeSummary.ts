import type { MatchEvent, TeamContext, Zone, Distance, TurnoverType } from "./types";

type Ctx = TeamContext;

type ShotStats = {
  MAL: number;
  MISS: number;
  RADDNING: number;
};

type DistanceStats = Record<Distance, ShotStats>;
type ZoneStats = Record<Zone, DistanceStats>;

function emptyShot(): ShotStats {
  return { MAL: 0, MISS: 0, RADDNING: 0 };
}
function emptyDistance(): DistanceStats {
  return { "6m": emptyShot(), "9m": emptyShot() };
}
function emptyZones(): ZoneStats {
  return { 1: emptyDistance(), 2: emptyDistance(), 3: emptyDistance() };
}
function emptyHeatmap() {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
}

const OMST_TYPES: TurnoverType[] = ["Brytning", "Tappad boll", "Regelfel", "Passivt spel"];

function emptyOmstallning(): Record<TurnoverType, number> {
  return {
    Brytning: 0,
    "Tappad boll": 0,
    Regelfel: 0,
    "Passivt spel": 0
  };
}

export type SummaryPack = {
  totalAttacks: Record<Ctx, number>;
  freeThrows: Record<Ctx, number>;
  goalsTotal: Record<Ctx, number>;
  shotsPlay: Record<Ctx, ZoneStats>;
  heatmap: Record<Ctx, Record<number, number>>;
  turnovers: Record<Ctx, Record<TurnoverType, number>>;
  shortAttacks: Record<Ctx, Record<string, number>>;
};

export function computeSummaryPack(events: MatchEvent[]): SummaryPack {
  const s: SummaryPack = {
    totalAttacks: { ANFALL: 0, FORSVAR: 0 },
    freeThrows: { ANFALL: 0, FORSVAR: 0 },
    goalsTotal: { ANFALL: 0, FORSVAR: 0 },
    shotsPlay: { ANFALL: emptyZones(), FORSVAR: emptyZones() },
    heatmap: { ANFALL: emptyHeatmap(), FORSVAR: emptyHeatmap() },
    turnovers: { ANFALL: emptyOmstallning(), FORSVAR: emptyOmstallning() },
    shortAttacks: {
      ANFALL: { "<2": 0, "<4": 0, FLER: 0 },
      FORSVAR: { "<2": 0, "<4": 0, FLER: 0 }
    }
  };

  for (const e of events) {
    const ctx = e.ctx;
    if (!ctx) continue;

    if (e.type === "TOTAL_ATTACK") {
      s.totalAttacks[ctx] += e.delta ?? 1;
    }

    if (e.type === "FREE_THROW") {
      s.freeThrows[ctx] += e.delta ?? 1;
    }

    if (e.type === "SHOT_PLAY") {
      const { zone, distance, outcome } = e;
      if (zone && distance && outcome) {
        s.shotsPlay[ctx][zone][distance][outcome] += 1;
        if (outcome === "MAL") s.goalsTotal[ctx] += 1;
      } else {
        // Miss kan sakna meta; vi räknar totals i SummaryView från råa events.
        if (outcome === "MAL") s.goalsTotal[ctx] += 1;
      }
    }

    if (e.type === "GOAL_PLACEMENT" && e.goalZone) {
      s.heatmap[ctx][e.goalZone] += 1;
    }

    if (e.type === "TURNOVER" && e.turnoverType) {
      // turnoverType är TurnoverType
      s.turnovers[ctx][e.turnoverType] = (s.turnovers[ctx][e.turnoverType] ?? 0) + 1;
    }

    if (e.type === "SHORT_ATTACK" && e.shortType) {
      s.shortAttacks[ctx][e.shortType] += 1;
    }
  }

  // Säkerställ att alla nycklar finns (om äldre events saknar init)
  for (const c of ["ANFALL", "FORSVAR"] as const) {
    for (const t of OMST_TYPES) {
      s.turnovers[c][t] = s.turnovers[c][t] ?? 0;
    }
  }

  return s;
}

export type Scope = "ALL" | "P1" | "P2";

export function filterEventsByScope(events: MatchEvent[], scope: Scope) {
  if (scope === "ALL") return events;
  const period = scope === "P1" ? 1 : 2;
  return events.filter(e => e.period === period);
}