// src/exportSummaryCsv.ts
import type { TeamContext } from "./types";

function n(v: unknown) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

export function exportSummaryCsv(pack: any, ctx: TeamContext, filename = "summary.csv") {
  const om = pack.turnovers?.[ctx] ?? {};
  const shotsPlay = pack.shotsPlay?.[ctx] ?? {};

  const goals6 = n(shotsPlay?.[1]?.["6m"]?.MAL) + n(shotsPlay?.[2]?.["6m"]?.MAL) + n(shotsPlay?.[3]?.["6m"]?.MAL);
  const saves6 = n(shotsPlay?.[1]?.["6m"]?.RADDNING) + n(shotsPlay?.[2]?.["6m"]?.RADDNING) + n(shotsPlay?.[3]?.["6m"]?.RADDNING);
  const goals9 = n(shotsPlay?.[1]?.["9m"]?.MAL) + n(shotsPlay?.[2]?.["9m"]?.MAL) + n(shotsPlay?.[3]?.["9m"]?.MAL);
  const saves9 = n(shotsPlay?.[1]?.["9m"]?.RADDNING) + n(shotsPlay?.[2]?.["9m"]?.RADDNING) + n(shotsPlay?.[3]?.["9m"]?.RADDNING);

  const turnoversTotal = n(om.Brytning) + n(om["Tappad boll"]) + n(om.Regelfel) + n(om["Passivt spel"]);
  const shotsTotal = goals6 + saves6 + goals9 + saves9;

  const rows: string[][] = [
    ["ctx", ctx],
    ["shotsTotal", String(shotsTotal)],
    ["goals6m", String(goals6)],
    ["saves6m", String(saves6)],
    ["goals9m", String(goals9)],
    ["saves9m", String(saves9)],
    ["turnoversTotal", String(turnoversTotal)],
    ["turnover.Brytning", String(n(om.Brytning))],
    ["turnover.Tappad boll", String(n(om["Tappad boll"]))],
    ["turnover.Regelfel", String(n(om.Regelfel))],
    ["turnover.Passivt spel", String(n(om["Passivt spel"]))],
  ];

  const csv = rows.map((r) => r.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function escapeCsv(s: string) {
  if (/[,"\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}