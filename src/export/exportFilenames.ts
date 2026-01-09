// FILE: src/export/exportFilenames.ts
export type ExportFilenames = {
  eventsCsv: string;
  summaryCsv: string;
  excel: string;
};

function safeId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]+/g, "_");
}

/**
 * Safe filename timestamp (Europe/Stockholm) without ":" to avoid Windows issues.
 * Format: YYYY-MM-DD_HH-mm
 */
export function getStockholmTimestampForFilename(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});

  const y = parts.year ?? "0000";
  const m = parts.month ?? "00";
  const d = parts.day ?? "00";
  const hh = parts.hour ?? "00";
  const mm = parts.minute ?? "00";

  return `${y}-${m}-${d}_${hh}-${mm}`;
}

export function buildExportFilenames(matchId: string, date = new Date()): ExportFilenames {
  const ts = getStockholmTimestampForFilename(date);
  const mid = safeId(matchId);

  return {
    eventsCsv: `handball_${mid}_${ts}_events.csv`,
    summaryCsv: `handball_${mid}_${ts}_summary.csv`,
    excel: `handball_${mid}_${ts}.xlsx`,
  };
}
