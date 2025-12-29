import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export type ExportOptions = {
  /** Vilket blad i mallen som ska fyllas, t.ex. "Anfall ALL" / "Försvar H1" */
  sheetName: string;

  /** Match-id eller valfri matchtext */
  matchId: string;

  /** Datumsträng (YYYY-MM-DD). Om du inte skickar in används dagens datum. */
  date?: string;

  /** Summeringsdata som ska skrivas in i mallen */
  metrics: {
    attacks: number;
    shots: number;
    goals: number;
    misses: number;
    freeThrows: number;
    turnovers: number; // omställningar/turnovers enligt din modell
    saves: number;
    efficiencyPct: number;
    savePct: number;
    shotsPerAttackPct: number;
    goalsPerAttackPct: number;
    turnoversPerAttackPct: number;
  };

  /** Alla taggningar som ska in i bladet "Taggningar" */
  tagEvents: Array<{
    time: string;
    phase: string;
    action: string;
    result?: string;
    scope?: string; // valfri (ALL/P1/P2)
    ctx?: string;   // valfri (ANFALL/FORSVAR)
  }>;
};

function findRowByLabel(rows: any[], label: string): number {
  const idx = rows.findIndex((r) => {
    const a = (r[""] ?? r["Label"] ?? r["label"] ?? r[0] ?? "").toString().trim();
    return a === label;
  });
  return idx;
}

function ensureSheet(workbook: XLSX.WorkBook, name: string) {
  if (!workbook.Sheets[name]) {
    workbook.Sheets[name] = XLSX.utils.aoa_to_sheet([[]]);
    if (!workbook.SheetNames.includes(name)) workbook.SheetNames.push(name);
  }
}

export async function exportToExcel(opts: ExportOptions) {
  const date = opts.date ?? new Date().toISOString().slice(0, 10);

  // 1) Ladda Excel-mallen från public/
  const res = await fetch("/Handball-tagger.xlsx");
  if (!res.ok) throw new Error(`Kunde inte hämta Excel-mallen (status ${res.status}). Ligger den i public/ ?`);
  const buffer = await res.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  // 2) Fyll summeringsbladet (t.ex. "Anfall ALL")
  ensureSheet(workbook, opts.sheetName);
  const ws = workbook.Sheets[opts.sheetName];

  // Vi läser bladet som “json” där första kolumnen blir "" (tom sträng) i headern.
  const rows = XLSX.utils.sheet_to_json<any>(ws, { defval: "", blankrows: true });

  // Om bladet är tomt (nytt), skapa en enkel struktur
  if (rows.length === 0) {
    const aoa = [
      ["", "Antal", "%"],
      ["Anfall", "", ""],
      ["Avslut", "", ""],
      ["Avslut/Anfall", "", ""],
      ["Mål", "", ""],
      ["Mål/Anfall", "", ""],
      ["Effektivitet", "", ""],
      ["Räddningar", "", ""],
      ["Räddningsprocent", "", ""],
      ["Omställningar", "", ""],
      ["Omställningar/Anfall", "", ""],
      ["Miss", "", ""],
      ["Frikast", "", ""],
    ];
    workbook.Sheets[opts.sheetName] = XLSX.utils.aoa_to_sheet(aoa);
  }

  // Läs igen efter ev. init
  const rows2 = XLSX.utils.sheet_to_json<any>(workbook.Sheets[opts.sheetName], {
    defval: "",
    blankrows: true,
  });

  // Helper: sätt Antal + % på en rad med given label
  const setRow = (label: string, antal: number | "", pct: number | "") => {
    const i = findRowByLabel(rows2, label);
    if (i === -1) return;
    rows2[i]["Antal"] = antal;
    rows2[i]["%"] = pct;
  };

  const m = opts.metrics;

  setRow("Anfall", m.attacks, "");
  setRow("Avslut", m.shots, m.shotsPerAttackPct);
  setRow("Avslut/Anfall", "", m.shotsPerAttackPct);

  setRow("Mål", m.goals, m.goalsPerAttackPct);
  setRow("Mål/Anfall", "", m.goalsPerAttackPct);

  setRow("Effektivitet", "", m.efficiencyPct);

  setRow("Räddningar", m.saves, m.savePct);
  setRow("Räddningsprocent", "", m.savePct);

  setRow("Omställningar", m.turnovers, m.turnoversPerAttackPct);
  setRow("Omställningar/Anfall", "", m.turnoversPerAttackPct);

  setRow("Miss", m.misses, "");
  setRow("Frikast", m.freeThrows, "");

  // Skriv tillbaka
  workbook.Sheets[opts.sheetName] = XLSX.utils.json_to_sheet(rows2, {
    skipHeader: false,
  });

  // 3) Taggningar → eget blad ("Taggningar"), append
  const tagSheetName = "Taggningar";
  ensureSheet(workbook, tagSheetName);

  const existingTags = XLSX.utils.sheet_to_json<any>(workbook.Sheets[tagSheetName], { defval: "" });
  const tagRows = Array.isArray(existingTags) ? existingTags : [];

  // Om bladet är tomt: skapa rubriker via första objektets keys (genom att push:a första rad)
  const toAdd = opts.tagEvents.map((e) => ({
   DATE: String(date),
   MATCH: String(opts.matchId),
   TIME: String(e.time ?? ""),
   PHASE: String(e.phase ?? ""),
   ACTION: String(e.action ?? ""),
   RESULT: String(e.result ?? ""),
   SCOPE: String(e.scope ?? ""),
   CTX: String(e.ctx ?? ""),
  }));

  const merged = [...tagRows, ...toAdd];
  workbook.Sheets[tagSheetName] = XLSX.utils.json_to_sheet(merged);

  if (!workbook.SheetNames.includes(tagSheetName)) workbook.SheetNames.push(tagSheetName);

  // 4) Exportera filen
  const out = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `HandballTagger_${opts.matchId}_${date}.xlsx`
  );
}