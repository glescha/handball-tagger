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

export const exportToExcel = async (stats: any, events: AppEvent[], teams: { home: string, away: string }, matchId: string) => {
  const wb = XLSX.utils.book_new();
  const empty: any[] = [];
  
  const r = (label: string, count: any, total: any, pct: any, note: any = "") => [label, count, total, pct, note];
  const header = (h1: string, h2: string, h3: string, h4: string, h5: string = "") => [h1, h2, h3, h4, h5];

  // --- HJÄLPFUNKTIONER FÖR KARTOR ---
  const getZoneMapRows = (phase: "ATTACK" | "DEFENSE", title: string) => {
      const count = (dist: string, zone: number) => events.filter(e => 
          e.phase === phase && 
          e.outcome === "GOAL" && 
          e.distance === dist && 
          e.zone === zone
      ).length;

      return [
          [title],
          ["Avstånd", "Zon 1 (V)", "Zon 2 (V)", "Zon 3 (M)", "Zon 4 (H)", "Zon 5 (H)"],
          ["6m", count("6m", 1), count("6m", 2), count("6m", 3), count("6m", 4), count("6m", 5)],
          ["9m", count("9m", 1), count("9m", 2), count("9m", 3), count("9m", 4), count("9m", 5)],
          empty
      ];
  };

  const getGoalMapRows = (phase: "ATTACK" | "DEFENSE", outcome: "GOAL" | "SAVE", title: string) => {
      const counts: Record<number, number> = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0};
      
      events.filter(e => 
          e.phase === phase && 
          (e.outcome === outcome) &&
          (e.type === "SHOT" || e.isPenalty)
      ).forEach(e => {
          if (e.goalCell && counts[e.goalCell]) {
              counts[e.goalCell]++;
          }
      });

      return [
          [title],
          ["(Uppifrån vänster)", "Vänster", "Mitten", "Höger"],
          ["Övre raden", counts[1], counts[2], counts[3]],
          ["Nedre raden", counts[4], counts[5], counts[6]],
          empty
      ];
  };

  // 1. ÖVERBLICK
  const att = stats.attack;
  const def = stats.defense;

  const overviewData = [
    ["MATCHRAPPORT", `${teams.home} vs ${teams.away}`],
    ["Datum", new Date().toLocaleDateString()],
    ["Match ID", matchId], // HÄR används nu matchId
    empty,
    header("ANFALL", "Antal", "Totalt", "Procent", "Notering"),
    r("Mål", att.goals.count, att.totalAttacks, `${att.goals.pct}%`),
    r("Avslut", att.shots.count, att.totalAttacks, `${att.shots.pct}%`),
    r("Effektivitet", att.goals.count, att.shots.count, `${att.eff}%`, "Mål/Avslut"),
    r("Tekniska Fel", att.turnovers.count, att.totalAttacks, `${att.turnovers.pct}%`),
    r("Tappad Boll", att.lostBalls.count, att.totalAttacks, `${att.lostBalls.pct}%`),
    empty,
    header("PASSNINGAR INNAN MÅL", "Antal", "Totalt", "Procent"),
    r("1-2 pass", att.passes.low.count, att.totalAttacks, `${att.passes.low.pct}%`),
    r("3-4 pass", att.passes.mid.count, att.totalAttacks, `${att.passes.mid.pct}%`),
    r("5+ pass", att.passes.high.count, att.totalAttacks, `${att.passes.high.pct}%`),
    empty,
    header("FÖRSVAR", "Antal", "Totalt", "Procent"),
    r("Insläppta Mål", def.goals.count, def.totalAttacks, `${def.goals.pct}%`),
    r("Räddningar (MV)", def.saves.count, def.totalAttacks, `${def.saves.pct}%`),
    r("Bollvinster", def.steals.count, def.totalAttacks, `${def.steals.pct}%`),
    r("Framtvingade fel", def.turnovers.count, def.totalAttacks, `${def.turnovers.pct}%`),
  ];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overviewData), "Överblick");

  // 2. ANFALL
  const attackData = [
    ["ANFALLSDETALJER"],
    empty,
    header("AVSLUTSTYPER", "Mål", "Totalt", "Procent"),
    r("6 meter", att.sixMeter.goals, att.sixMeter.count, `${att.sixMeter.effPct}%`),
    r("9 meter", att.nineMeter.goals, att.nineMeter.count, `${att.nineMeter.effPct}%`),
    r("Kant", att.wing.goals, att.wing.count, `${att.wing.effPct}%`),
    r("Straff", att.penalty.goals, att.penalty.count, `${att.penalty.effPct}%`),
    empty,
    header("ZONER", "Mål", "Totalt", "Procent"),
    r("Zon 1 (V6)", att.z1.goals, att.z1.count, `${att.z1.effPct}%`),
    r("Zon 2 (V9)", att.z2.goals, att.z2.count, `${att.z2.effPct}%`),
    r("Zon 3 (M9)", att.z3.goals, att.z3.count, `${att.z3.effPct}%`),
    r("Zon 4 (H9)", att.z4.goals, att.z4.count, `${att.z4.effPct}%`),
    r("Zon 5 (H6)", att.z5.goals, att.z5.count, `${att.z5.effPct}%`),
    empty,
    ...getZoneMapRows("ATTACK", "MÅL I ZONER (Skottkarta)"),
    ...getGoalMapRows("ATTACK", "GOAL", "MÅLPLACERING (Vi gjorde mål här)"),
    ...getGoalMapRows("ATTACK", "SAVE", "RÄDDNINGAR (Motståndaren räddade här)"),
    header("OMSTÄLLNINGAR", "Antal", "Av Anfall", "Procent"),
    r("Totalt", att.turnovers.count, att.totalAttacks, `${att.turnovers.pct}%`),
    r("Tappad Boll", att.lostBalls.count, att.totalAttacks, `${att.lostBalls.pct}%`),
    r("Regelfel", att.techFault.count, att.totalAttacks, `${att.techFault.pct}%`),
    r("Passivt Spel", att.passive.count, att.totalAttacks, `${att.passive.pct}%`),
  ];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(attackData), "Anfall");

  // 3. FÖRSVAR
  const defenseData = [
    ["FÖRSVARSDETALJER"],
    empty,
    header("INSLÄPPTA", "Mål", "Totalt", "Procent"),
    r("6 meter", def.sixMeter.goals, def.sixMeter.count, `${def.sixMeter.effPct}%`),
    r("9 meter", def.nineMeter.goals, def.nineMeter.count, `${def.nineMeter.effPct}%`),
    r("Kant", def.wing.goals, def.wing.count, `${def.wing.effPct}%`),
    r("Straff", def.penalty.goals, def.penalty.count, `${def.penalty.effPct}%`),
    empty,
    ...getZoneMapRows("DEFENSE", "INSLÄPPTA I ZONER (Skottkarta)"),
    ...getGoalMapRows("DEFENSE", "GOAL", "INSLÄPPTA PLACERING (Bollen gick i mål här)"),
    header("OMSTÄLLNINGAR", "Antal", "Av Anfall", "Procent"),
    r("Brytning/Bollvinst", def.steals.count, def.totalAttacks, `${def.steals.pct}%`),
    r("Framtvingade fel", def.turnovers.count, def.totalAttacks, `${def.turnovers.pct}%`),
  ];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(defenseData), "Försvar");

  // 4. MÅLVAKT
  const gkData = [
    ["MÅLVAKTSSTATISTIK"],
    ["Notering: Visar räddningsprocent på skott på mål"],
    empty,
    header("POSITION", "Räddningar", "Skott", "Räddnings-%"),
    r("6 meter", "", def.sixMeter.count, `${def.sixMeter.savePct}%`),
    r("9 meter", "", def.nineMeter.count, `${def.nineMeter.savePct}%`),
    r("Kant", "", def.wing.count, `${def.wing.savePct}%`),
    r("Straff", "", def.penalty.count, `${def.penalty.savePct}%`),
    empty,
    ...getGoalMapRows("DEFENSE", "SAVE", "RÄDDNINGAR PLACERING (Vi räddade här)"),
    header("ZONER", "Räddningar", "Skott", "Räddnings-%"),
    r("Zon 1", "", def.z1.count, `${def.z1.savePct}%`),
    r("Zon 2", "", def.z2.count, `${def.z2.savePct}%`),
    r("Zon 3", "", def.z3.count, `${def.z3.savePct}%`),
    r("Zon 4", "", def.z4.count, `${def.z4.savePct}%`),
    r("Zon 5", "", def.z5.count, `${def.z5.savePct}%`),
  ];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(gkData), "Målvakt");

  // 5. HÄNDELSER
  const eventHeader = ["Tid", "Period", "Lag", "Fas", "Händelse", "Resultat", "Zon", "Avstånd", "Placering", "Pass", "Detalj"];
  const eventData = events.map(e => [
    fmtTime(e.timestamp),
    e.period,
    e.phase === "ATTACK" ? "Hemma" : "Borta",
    e.phase === "ATTACK" ? "Anfall" : "Försvar",
    e.type === "SHOT" ? (e.isPenalty ? "Straff" : "Avslut") : (e.type === "TURNOVER" ? "Tekniskt Fel" : e.type),
    e.outcome || "-",
    e.zone || "-",
    e.distance || "-",
    e.goalCell || "-", 
    e.passes || "-",   
    e.subTypeLabel || e.subType || "-"
  ]);

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([eventHeader, ...eventData]), "Händelser");

  // FILNAMN
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeHome = teams.home.replace(/[\/\\?%*:|"<>]/g, '-'); 
  const safeAway = teams.away.replace(/[\/\\?%*:|"<>]/g, '-');
  const filename = `Matchrapport - ${safeHome} vs ${safeAway} - ${dateStr}.xlsx`;
  
  if (Capacitor.isNativePlatform()) {
    try {
      const base64 = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
      const result = await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: Directory.Cache
      });

      await Share.share({
        title: 'Matchrapport',
        text: `Matchrapport ${teams.home} - ${teams.away}`,
        url: result.uri,
        dialogTitle: 'Dela Excel-fil'
      });
    } catch (e: any) {
      alert("Kunde inte exportera Excel: " + e.message);
    }
  } else {
    XLSX.writeFile(wb, filename);
  }
};