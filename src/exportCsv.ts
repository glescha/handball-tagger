import type { AppEvent } from "./types/AppEvents";

function fmtTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

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

// Input är number eftersom AppEvent.zone är number
function getZoneLabel(zone?: number): string {
    if (!zone) return "";
    const map: Record<number, string> = {
        1: "V6", 2: "V9", 3: "M9", 4: "H9", 5: "H6"
    };
    return map[zone] || String(zone);
}

export function exportCsv(events: AppEvent[], filename = "events.csv") {
  const headers = [
    "MatchID",
    "Period",
    "Tid",
    "Tid (ms)",
    "Lag",
    "Fas",
    "Händelsetyp",
    "Beskrivning", 
    "Resultat",    
    "Är Straff",
    "Avstånd",     
    "Zon (Nr)",    
    "Zon (Namn)",  
    "Målcell",     
    "Passningar",  
    "Detaljinfo"   
  ];

  const lines: string[] = [];
  lines.push(headers.map(csvEscape).join(","));

  for (const e of events) {
    
    // 1. Zon-namn
    const widthValue = e.zone ? getZoneLabel(e.zone) : "";
    
    // 2. Straff-status
    const isPenalty = e.isPenalty ? "Ja" : "Nej";

    // 3. Beskrivning
    let description = "";
    if (e.type === "SHOT") {
        description = e.isPenalty ? "Straffkast" : "Avslut";
    } else if (e.type === "TURNOVER") {
        description = e.subTypeLabel || "Tekniskt Fel";
    } else if (e.type === "FREE_THROW") {
        description = "Frikast";
    }

    // 4. Bygg raden
    const row = [
      e.matchId,
      e.period,
      fmtTime(e.timestamp),
      e.timestamp,
      e.phase === "ATTACK" ? "Hemma" : "Borta",
      e.phase,
      e.type,
      description,
      e.outcome ?? "",
      isPenalty,
      e.distance ?? "",     
      e.zone ?? "",         
      widthValue,
      e.goalCell ?? "",
      e.passes ?? "", 
      e.subType ?? ""       
    ];

    lines.push(row.map(csvEscape).join(","));
  }

  downloadText(filename, lines.join("\n"));
}

export default exportCsv;