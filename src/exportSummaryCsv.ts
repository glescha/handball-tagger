import { db } from "./db";
import { computeSummaryPack, filterEventsByScope } from "./computeSummary";
import type { TeamContext, TurnoverType, Zone, Distance } from "./types";
import type { Scope } from "./computeSummary";

/* ======================
   Hjälpfunktioner
====================== */
function slug(s: string) {
  return s
    .toLowerCase()
    .replaceAll("å", "a")
    .replaceAll("ä", "a")
    .replaceAll("ö", "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dateCodeFromISO(dateISO?: string) {
  if (!dateISO) return "unknown-date";
  return dateISO.replaceAll("-", "");
}

function esc(v: unknown) {
  const s = (v ?? "").toString();
  return `"${s.replaceAll('"', '""')}"`;
}

function row(lines: string[], cells: (string | number | null | undefined)[]) {
  lines.push(cells.map(esc).join(","));
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const OMST: TurnoverType[] = ["Brytning", "Tappad boll", "Regelfel", "Passivt spel"];

/* ======================
   Export: Summary (scope)
====================== */
export async function exportSummaryCsv(matchId: string, scope: Scope) {
  const match = await db.matches.get(matchId);

  const eventsAll = await db.events.where({ matchId }).sortBy("ts");
  const events = filterEventsByScope(eventsAll, scope);

  const pack = computeSummaryPack(events);

  const dateCode = dateCodeFromISO(match?.dateISO);
  const titleSlug = slug(match?.title ?? matchId);
  const filename = `${dateCode}_${titleSlug}_summary_${scope}.csv`;

  const lines: string[] = [];

  row(lines, ["SUMMARY"]);
  row(lines, ["Match", match?.title ?? matchId]);
  row(lines, ["Scope", scope]);
  lines.push("");

  const ctxs: TeamContext[] = ["ANFALL", "FORSVAR"];

  for (const ctx of ctxs) {
    const label = ctx === "ANFALL" ? "ANFALL" : "FORSVAR";
    row(lines, [label]);
    lines.push("");

    // Överblick (enkelt)
    row(lines, ["Totala anfall", pack.totalAttacks[ctx]]);
    row(lines, [ctx === "ANFALL" ? "Mål" : "Insläppta mål", pack.goalsTotal[ctx]]);
    row(lines, ["Frikast", pack.freeThrows[ctx]]);
    lines.push("");

    // Avslut (tabell utan MISS)
    row(lines, ["Avslut"]);
    row(lines, ["Zon", "6m Mål", "6m Räddning", "9m Mål", "9m Räddning"]);

    const zones: Zone[] = [1, 2, 3];
    const d6: Distance = "6m";
    const d9: Distance = "9m";

    let sum6g = 0, sum6s = 0, sum9g = 0, sum9s = 0;

    for (const z of zones) {
      const g6 = pack.shotsPlay[ctx][z][d6].MAL;
      const s6 = pack.shotsPlay[ctx][z][d6].RADDNING;
      const g9 = pack.shotsPlay[ctx][z][d9].MAL;
      const s9 = pack.shotsPlay[ctx][z][d9].RADDNING;

      sum6g += g6; sum6s += s6; sum9g += g9; sum9s += s9;

      row(lines, [z, g6, s6, g9, s9]);
    }

    row(lines, ["SUMMA", sum6g, sum6s, sum9g, sum9s]);
    lines.push("");

    // Placering i mål
    row(lines, ["Placering i mål"]);
    row(lines, ["Ruta", "Antal"]);
    for (const gz of [1,2,3,4,5,6,7,8,9] as const) {
      row(lines, [gz, pack.heatmap[ctx][gz]]);
    }
    lines.push("");

    // Omställning
    row(lines, ["Omställning"]);
    row(lines, ["Typ", "Antal"]);
    for (const t of OMST) {
      row(lines, [t, pack.turnovers[ctx][t] ?? 0]);
    }
    row(lines, ["SUMMA", OMST.reduce((acc, t) => acc + (pack.turnovers[ctx][t] ?? 0), 0)]);
    lines.push("");

    // Pass innan mål (finns i data även för FORSVAR men är primärt relevant för ANFALL)
    row(lines, ["Antal pass innan mål"]);
    row(lines, ["< 2 pass", pack.shortAttacks[ctx]["<2"] ?? 0]);
    row(lines, ["< 4 pass", pack.shortAttacks[ctx]["<4"] ?? 0]);
    row(lines, ["Fler pass", pack.shortAttacks[ctx]["FLER"] ?? 0]);
    row(lines, ["SUMMA",
      (pack.shortAttacks[ctx]["<2"] ?? 0) + (pack.shortAttacks[ctx]["<4"] ?? 0) + (pack.shortAttacks[ctx]["FLER"] ?? 0)
    ]);
    lines.push("");

    lines.push("");
  }

  downloadCsv(filename, lines.join("\n"));
}

/* ======================
   Export: Compare (H1 vs H2)
====================== */
export async function exportSummaryCompareCsv(matchId: string) {
  const match = await db.matches.get(matchId);

  const eventsAll = await db.events.where({ matchId }).sortBy("ts");

  const p1 = computeSummaryPack(filterEventsByScope(eventsAll, "P1"));
  const p2 = computeSummaryPack(filterEventsByScope(eventsAll, "P2"));

  const dateCode = dateCodeFromISO(match?.dateISO);
  const titleSlug = slug(match?.title ?? matchId);
  const filename = `${dateCode}_${titleSlug}_summary_H1vsH2.csv`;

  const lines: string[] = [];

  row(lines, ["SUMMARY_COMPARE"]);
  row(lines, ["Match", match?.title ?? matchId]);
  lines.push("");

  for (const ctx of ["ANFALL", "FORSVAR"] as const) {
    row(lines, [ctx]);
    lines.push("");

    row(lines, ["H1"]);
    row(lines, ["Totala anfall", p1.totalAttacks[ctx]]);
    row(lines, [ctx === "ANFALL" ? "Mål" : "Insläppta mål", p1.goalsTotal[ctx]]);
    row(lines, ["Frikast", p1.freeThrows[ctx]]);
    lines.push("");

    row(lines, ["H2"]);
    row(lines, ["Totala anfall", p2.totalAttacks[ctx]]);
    row(lines, [ctx === "ANFALL" ? "Mål" : "Insläppta mål", p2.goalsTotal[ctx]]);
    row(lines, ["Frikast", p2.freeThrows[ctx]]);
    lines.push("");

    lines.push("");
  }

  downloadCsv(filename, lines.join("\n"));
}