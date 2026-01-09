// FILE: src/exportSummaryCsv.ts
import type { AppEvent, ShotDistance } from "./types";
import { computeShotSummary } from "./computeShotSummary";

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  const needsQuotes = /[",\n\r]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSummaryCsv(events: AppEvent[], filename = "summary.csv") {
  const s = computeShotSummary(events);

  const rows: Array<[string, number | string]> = [
    ["shots.total", s.total],
    ["shots.goals", s.goals],
    ["shots.misses", s.misses],
    ["shots.saves", s.saves],
  ];

  (Object.keys(s.byDistance) as ShotDistance[]).forEach((d) => {
    const b = s.byDistance[d];
    rows.push([`shots.byDistance.${d}.total`, b.total]);
    rows.push([`shots.byDistance.${d}.goals`, b.goals]);
    rows.push([`shots.byDistance.${d}.misses`, b.misses]);
    rows.push([`shots.byDistance.${d}.saves`, b.saves]);
  });

  const lines = [["key", "value"], ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
  downloadText(filename, lines);
}

export default exportSummaryCsv;
