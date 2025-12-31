import { db } from "./db";

/* ===== helpers ===== */

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

/* ===== export ===== */

export async function exportMatchCsv(matchId: string) {
  const match = await db.matches.get(matchId);
  const events = await db.events.where({ matchId }).sortBy("ts");

  const dateCode = dateCodeFromISO(match?.dateISO);
  const titleSlug = slug(match?.matchId ?? matchId);

  const filename = `${dateCode}_${titleSlug}.csv`;

  const lines: string[] = [];

  // header
  lines.push(
    [
      "ts",
      "period",
      "ctx",
      "type",
      "outcome",
      "distance",
      "zone",
      "goalZone",
      "turnoverType",
      "shortType",
      "delta"
    ].join(",")
  );

  for (const e of events) {
    lines.push(
      [
        esc(e.ts),
        esc(e.period),
        esc(e.ctx),
        esc(e.type),
        esc((e as any).outcome),
        esc((e as any).distance),
        esc((e as any).zone),
        esc((e as any).goalZone),
        esc((e as any).turnoverType),
        esc((e as any).shortType),
        esc((e as any).delta)
      ].join(",")
    );
  }

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
