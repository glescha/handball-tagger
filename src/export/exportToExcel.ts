// src/export/exportToExcel.ts
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { listEvents } from "../eventService";
import { computeSummaryPack, filterEventsByScope, type Scope } from "../computeSummary";
import type { GoalZone, MatchEvent, TeamContext, TurnoverType, PassBucket } from "../types";
import * as matchService from "../matchService";

function n(v: unknown) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}
function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

function aggShots(events: MatchEvent[], ctx: TeamContext) {
  let goals = 0,
    saves = 0,
    misses = 0;

  for (const e of events as any[]) {
    if (e?.ctx !== ctx) continue;
    if (e?.type !== "SHOT_PLAY") continue;
    const o = e?.outcome;
    if (o === "MAL") goals++;
    else if (o === "RADDNING") saves++;
    else if (o === "MISS") misses++;
  }

  const total = goals + saves + misses;
  const efficiency = total ? Math.round((goals / total) * 100) : 0;
  const savePct = goals + saves > 0 ? Math.round((saves / (goals + saves)) * 100) : 0;
  return { goals, saves, misses, total, efficiency, savePct };
}

function aggTurnovers(pack: ReturnType<typeof computeSummaryPack>, ctx: TeamContext) {
  const b = pack.turnovers[ctx];
  const total =
    n((b as any).Brytning) +
    n((b as any)["Tappad boll"]) +
    n((b as any).Regelfel) +
    n((b as any)["Passivt spel"]);
  return { b, total };
}

async function getMatchMeta(matchId: string): Promise<any | null> {
  try {
    const ms: any = matchService as any;

    if (typeof ms.getMatch === "function") {
      return (await ms.getMatch(matchId)) ?? null;
    }
    if (typeof ms.getMatchById === "function") {
      return (await ms.getMatchById(matchId)) ?? null;
    }
    if (typeof ms.listMatches === "function") {
      const all = await ms.listMatches();
      if (Array.isArray(all)) return all.find((x: any) => x?.matchId === matchId) ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

function sheetName(ctx: TeamContext, scope: Scope) {
  const c = ctx === "ANFALL" ? "Anfall" : "Försvar";
  const s = scope === "ALL" ? "ALL" : scope; // H1/H2
  return `${c} ${s}`;
}

/**
 * Excel-layout från din mall (Handball-tagger.xlsx):
 *
 * Matchinfo:
 *  B3 Hemmalag
 *  B4 Bortalag
 *  B5 Datum
 *  B6 Hall
 *
 * Stats-blad (Anfall/Försvar):
 *  B3  Anfall (antal)
 *  B4  Avslut
 *  B5  Mål / Insläppta mål
 *  B6  Effektivitet (%)
 *  B7  Räddningar
 *  B8  Räddningsprocent (%)
 *  B9  Miss
 *  B10 Frikast
 *  B11 Omställning (total)
 *  C12 Avslut per anfall (%)
 *  C13 Mål per anfall / Insläppta mål per anfall (%)
 *  C14 Omställning per anfall (%)
 *
 * Avslut-tabell:
 *  Zon 1: B18 (6m mål) C18 (6m räddn) D18 (9m mål) E18 (9m räddn)
 *  Zon 2: B19 C19 D19 E19
 *  Zon 3: B20 C20 D20 E20
 *  SUMMA: B21 C21 D21 E21
 *
 * Placering i mål (3x3):
 *  (1..3)  rad 25: B25 C25 D25
 *  (4..6)  rad 26: B26 C26 D26
 *  (7..9)  rad 27: B27 C27 D27
 *
 * Omställning:
 *  Brytning      B30
 *  Tappad boll   B31
 *  Regelfel      B32
 *  Passivt spel  B33
 *  SUMMA         B34
 *
 * Typ av avslut:
 *  Mål       B37
 *  Miss      B38
 *  Räddning  B39
 *
 * Korta anfall / Pass innan mål:
 *  <2   B43
 *  <4   B44
 *  Fler B45
 *  SUM  B46
 */

function setCell(ws: ExcelJS.Worksheet, addr: string, value: any) {
  ws.getCell(addr).value = value;
}

function fillStatsSheet(
  ws: ExcelJS.Worksheet,
  eventsScoped: MatchEvent[],
  pack: ReturnType<typeof computeSummaryPack>,
  ctx: TeamContext
) {
  const shots = aggShots(eventsScoped, ctx);
  const omst = aggTurnovers(pack, ctx);
  const attacks = shots.total + omst.total;

  const freeThrows = n(pack.freeThrows[ctx]);

  // Top KPI (kolumn B + några % i C)
  setCell(ws, "B3", attacks);
  setCell(ws, "B4", shots.total);
  setCell(ws, "B5", shots.goals);
  setCell(ws, "B6", shots.efficiency);
  setCell(ws, "B7", shots.saves);
  setCell(ws, "B8", shots.savePct);
  setCell(ws, "B9", shots.misses);
  setCell(ws, "B10", freeThrows);
  setCell(ws, "B11", omst.total);

  setCell(ws, "C12", pct(shots.total, attacks));
  setCell(ws, "C13", pct(shots.goals, attacks));
  setCell(ws, "C14", pct(omst.total, attacks));

  // Avslut per zon/avstånd (pack.shotsPlay[ctx][zone][distance][outcome])
  const zones = [1, 2, 3] as const;
  const rowByZone: Record<1 | 2 | 3, number> = { 1: 18, 2: 19, 3: 20 };

  let sumB = 0,
    sumC = 0,
    sumD = 0,
    sumE = 0;

  for (const z of zones) {
    const r = rowByZone[z];

    const g6 = n(pack.shotsPlay[ctx][z]["6m"].MAL);
    const s6 = n(pack.shotsPlay[ctx][z]["6m"].RADDNING);
    const g9 = n(pack.shotsPlay[ctx][z]["9m"].MAL);
    const s9 = n(pack.shotsPlay[ctx][z]["9m"].RADDNING);

    setCell(ws, `B${r}`, g6);
    setCell(ws, `C${r}`, s6);
    setCell(ws, `D${r}`, g9);
    setCell(ws, `E${r}`, s9);

    sumB += g6;
    sumC += s6;
    sumD += g9;
    sumE += s9;
  }

  setCell(ws, "B21", sumB);
  setCell(ws, "C21", sumC);
  setCell(ws, "D21", sumD);
  setCell(ws, "E21", sumE);

  // Placering i mål (GoalZone 1..9)
  const mapGoal: Array<{ addr: string; key: GoalZone }> = [
    { addr: "B25", key: 1 },
    { addr: "C25", key: 2 },
    { addr: "D25", key: 3 },
    { addr: "B26", key: 4 },
    { addr: "C26", key: 5 },
    { addr: "D26", key: 6 },
    { addr: "B27", key: 7 },
    { addr: "C27", key: 8 },
    { addr: "D27", key: 9 },
  ];
  for (const m of mapGoal) {
    setCell(ws, m.addr, n(pack.heatmap[ctx][m.key]));
  }

  // Omställning breakdown
  const b = omst.b as Record<TurnoverType, number>;
  setCell(ws, "B30", n(b.Brytning));
  setCell(ws, "B31", n(b["Tappad boll"]));
  setCell(ws, "B32", n(b.Regelfel));
  setCell(ws, "B33", n(b["Passivt spel"]));
  setCell(ws, "B34", omst.total);

  // Typ av avslut
  setCell(ws, "B37", shots.goals);
  setCell(ws, "B38", shots.misses);
  setCell(ws, "B39", shots.saves);

  // Pass innan mål (SHORT_ATTACK)
  const p = pack.shortAttacks[ctx] as Record<PassBucket, number>;
  const pass2 = n(p["<2"]);
  const pass4 = n(p["<4"]);
  const passMore = n(p.FLER);
  setCell(ws, "B43", pass2);
  setCell(ws, "B44", pass4);
  setCell(ws, "B45", passMore);
  setCell(ws, "B46", pass2 + pass4 + passMore);
}

export async function exportToExcel(matchId: string) {
  // 1) hämta mall
  const res = await fetch("/Handball-tagger.xlsx");
  if (!res.ok) throw new Error("Kunde inte läsa Excel-mallen /Handball-tagger.xlsx (lägg den i /public).");
  const buf = await res.arrayBuffer();

  // 2) ladda workbook
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);

  // 3) hämta data
  const [events, match] = await Promise.all([listEvents(matchId), getMatchMeta(matchId)]);

  // 4) skriv Matchinfo
  const wsInfo = wb.getWorksheet("Matchinfo");
  if (!wsInfo) throw new Error("Hittar inte fliken 'Matchinfo' i Excel-mallen.");

  setCell(wsInfo, "B3", match?.homeTeam ?? "");
  setCell(wsInfo, "B4", match?.awayTeam ?? "");
  setCell(wsInfo, "B5", match?.dateISO ?? matchId.slice(0, 10));
  setCell(wsInfo, "B6", match?.venue ?? "");

  // 5) scopes + ctx
  const scopes: Scope[] = ["ALL", "H1", "H2"];
  const ctxs: TeamContext[] = ["ANFALL", "FORSVAR"];

  for (const scope of scopes) {
    const scoped = filterEventsByScope(events, scope);
    const pack = computeSummaryPack(scoped);

    for (const ctx of ctxs) {
      const name = sheetName(ctx, scope);
      const ws = wb.getWorksheet(name);
      if (!ws) throw new Error(`Hittar inte fliken '${name}' i Excel-mallen.`);

      fillStatsSheet(ws, scoped, pack, ctx);
    }
  }

  // 6) spara fil
  const out = await wb.xlsx.writeBuffer();
  const fileName =
    match?.homeTeam && match?.awayTeam
      ? `${match?.dateISO ?? matchId.slice(0, 10)}-${match.homeTeam}-${match.awayTeam}.xlsx`
      : `Handball-${matchId}.xlsx`;

  saveAs(new Blob([out]), fileName);
}
