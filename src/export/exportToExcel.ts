// src/export/exportToExcel.ts
import * as XLSX from "xlsx";
import type { MatchEvent, TeamContext, Scope } from "../types";
import { computeSummaryPack, filterEventsByScope } from "../computeSummary";

type Metrics = {
  attacks: number;
  shots: number;
  goals: number;
  misses: number;
  freeThrows: number;
  turnovers: number;
  saves: number;
  efficiencyPct: number;
  savePct: number;
  shotsPerAttackPct: number;
  goalsPerAttackPct: number;
  turnoversPerAttackPct: number;
};

export async function exportToExcel(args: {
  matchId: string;
  sheetName: string; // används som filnamn också
  metrics: Metrics;
  tagEvents: Array<{
    time: string;
    phase: string;
    action: string;
    result: string;
    scope: Scope | string;
    ctx: TeamContext | string;
  }>;
  allEvents?: MatchEvent[];
  ctx?: TeamContext;
  scope?: Scope;
}) {
  const templateUrl = "/Handball-tagger.xlsx";
  const res = await fetch(templateUrl);
  if (!res.ok) throw new Error("Kunde inte ladda Handball-tagger.xlsx");
  const buf = await res.arrayBuffer();

  const wb = XLSX.read(buf, { type: "array" });

  const ctx: TeamContext = (args.ctx as TeamContext) ?? (args.tagEvents[0]?.ctx as TeamContext) ?? "ANFALL";
  const scope: Scope = (args.scope as Scope) ?? (args.tagEvents[0]?.scope as Scope) ?? "ALL";

  const sheetBase = ctx === "ANFALL" ? "Anfall" : "Försvar";
  const sheetScope = scope === "P1" ? "H1" : scope === "P2" ? "H2" : "ALL";
  const sheet = `${sheetBase} ${sheetScope}`;

  const ws = wb.Sheets[sheet];
  if (!ws) throw new Error(`Saknar blad: ${sheet}`);

  // ---- KPI (kolumn B) ----
  setCell(ws, "B3", args.metrics.attacks);
  setCell(ws, "B4", args.metrics.shots);
  setCell(ws, "B5", args.metrics.shotsPerAttackPct / 100);
  setCell(ws, "B6", args.metrics.goals);
  setCell(ws, "B7", args.metrics.goalsPerAttackPct / 100);
  setCell(ws, "B8", args.metrics.efficiencyPct / 100);
  setCell(ws, "B9", args.metrics.saves);
  setCell(ws, "B10", args.metrics.savePct / 100);
  setCell(ws, "B11", args.metrics.turnovers);
  setCell(ws, "B12", args.metrics.turnoversPerAttackPct / 100);
  setCell(ws, "B13", args.metrics.misses);
  setCell(ws, "B14", args.metrics.freeThrows);

  // ---- Från events (för tabeller/heatmap) ----
  const events = args.allEvents ?? [];
  const scoped = filterEventsByScope(events, scope);
  const pack = computeSummaryPack(scoped);

  // ---- Avslut-tabell (zon 1-3, rader 18-20) ----
  for (const z of [1, 2, 3] as const) {
    const r = 17 + z;
    setCell(ws, `B${r}`, num(pack.shotsPlay[ctx][z]["6m"].MAL));
    setCell(ws, `C${r}`, num(pack.shotsPlay[ctx][z]["6m"].RADDNING));
    setCell(ws, `D${r}`, num(pack.shotsPlay[ctx][z]["9m"].MAL));
    setCell(ws, `E${r}`, num(pack.shotsPlay[ctx][z]["9m"].RADDNING));
  }

  // ---- Omställning (rader 29-33, kolumn B) ----
  const om = pack.turnovers[ctx];
  setCell(ws, "B29", num(om.Brytning));
  setCell(ws, "B30", num(om["Tappad boll"]));
  setCell(ws, "B31", num(om.Regelfel));
  setCell(ws, "B32", num(om["Passivt spel"]));
  setCell(ws, "B33", num(om.Brytning) + num(om["Tappad boll"]) + num(om.Regelfel) + num(om["Passivt spel"]));

  // ---- Placering i mål (3x3: B24-D26) ----
  const mapCells = [
    "B24",
    "C24",
    "D24",
    "B25",
    "C25",
    "D25",
    "B26",
    "C26",
    "D26",
  ] as const;
  for (let i = 0; i < 9; i++) {
    const k = (i + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    setCell(ws, mapCells[i], num(pack.heatmap[ctx][k]));
  }

  // ---- Antal pass innan mål (rader 42-45) ----
  const pa = pack.shortAttacks[ctx];
  setCell(ws, "B42", num(pa["<2"]));
  setCell(ws, "B43", num(pa["<4"]));
  setCell(ws, "B44", num(pa.FLER));
  setCell(ws, "B45", num(pa["<2"]) + num(pa["<4"]) + num(pa.FLER));

  // ---- Tagglista (läggs i blad "Taggar" om finns) ----
  const wsTags = wb.Sheets["Taggar"];
  if (wsTags) {
    const rows = [
      ["Tid", "Fas", "Åtgärd", "Resultat", "H", "ANF/FÖR"],
      ...args.tagEvents.map((e) => [
        e.time,
        e.phase,
        e.action,
        e.result,
        String(e.scope ?? ""),
        String(e.ctx ?? ""),
      ]),
    ];
    XLSX.utils.sheet_add_aoa(wsTags, rows, { origin: "A1" });
  }

  // skriv fil
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${args.sheetName}.xlsx`);
}

function setCell(ws: XLSX.WorkSheet, addr: string, v: number | string) {
  ws[addr] = ws[addr] ?? ({ t: "n", v: 0 } as any);
  if (typeof v === "string") {
    ws[addr] = { t: "s", v } as any;
    return;
  }
  ws[addr] = { t: "n", v } as any;
  // behåll format om det finns i mallen (procent etc)
}

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function num(v: unknown) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}