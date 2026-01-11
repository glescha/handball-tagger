import * as XLSX from "xlsx";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import type { AppEvent } from "../types/AppEvents";

function fmtTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export type ExportToExcelArgs = {
  events: AppEvent[];
  filename?: string;
};

export async function exportToExcel({ events, filename = "handball-tagger.xlsx" }: ExportToExcelArgs) {
  
  // 1. Skapa rader för Händelselistan
  const eventRows = events.map((e) => {
    // Skapa en läsbar beskrivning baserat på typen
    let description = "";
    if (e.type === "SHOT") {
        description = e.isPenalty ? "Straffkast" : "Avslut";
    } else if (e.type === "TURNOVER") {
        // Använd subTypeLabel om den finns (från TurnoverPanel), annars fallback
        description = e.subTypeLabel || e.subType || "Tekniskt fel";
    } else if (e.type === "FREE_THROW") {
        description = "Frikast";
    }

    return {
      MatchID: e.matchId,
      Period: e.period,
      Tid: fmtTime(e.timestamp),
      // Avgör lag baserat på Phase då 'team' inte längre finns på AppEvent
      Lag: e.phase === "ATTACK" ? "Hemma" : "Borta",
      Fas: e.phase === "ATTACK" ? "Anfall" : "Försvar",
      Typ: e.type,
      Beskrivning: description,
      Resultat: e.outcome || "", // Mål/Miss/Räddning
      Zon: e.zone || "",         // 1-5
      Avstånd: e.distance || "", // 6m, 9m
      Placering: e.goalCell || "", // 1-6
      Passningar: e.passes || "",
      Detalj: e.subType || ""    // ID för tekniskt fel (t.ex STEAL)
    };
  });

  // 2. Beräkna en enkel summering
  const shots = events.filter(e => e.type === "SHOT");
  const goals = shots.filter(e => e.outcome === "GOAL");
  const saves = shots.filter(e => e.outcome === "SAVE");
  const misses = shots.filter(e => e.outcome === "MISS");
  const penalties = shots.filter(e => e.isPenalty);

  const summaryRows = [
    { Kategori: "TOTALT ANTAL SKOTT", Antal: shots.length },
    { Kategori: "Mål", Antal: goals.length },
    { Kategori: "Räddningar", Antal: saves.length },
    { Kategori: "Missar", Antal: misses.length },
    { Kategori: "Straffkast", Antal: penalties.length },
    { Kategori: "", Antal: "" }, // Tomrad
    { Kategori: "ANTAL ANFALL (Estimat)", Antal: shots.length + events.filter(e => e.type === "TURNOVER" && e.phase === "ATTACK").length },
  ];

  // 3. Skapa arbetsboken
  const wb = XLSX.utils.book_new();
  
  // Lägg till flik: Events
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(eventRows), "Händelser");
  
  // Lägg till flik: Summary
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), "Summering");

  // 4. Exportera filen
  if (Capacitor.isNativePlatform()) {
    try {
      const base64 = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
      await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: Directory.Cache,
      });
      const uri = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
      await Share.share({ title: "Exportera Excel", url: uri.uri });
    } catch (error: any) {
      console.error("Export failed:", error);
      alert(`Kunde inte spara fil: ${error.message}`);
    }
  } else {
    const arrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    downloadBlob(blob, filename);
  }
}