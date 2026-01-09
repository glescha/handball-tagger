import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import type { AppEvent } from "../types/AppEvents"; 
import type { BackupFileV1 } from "../export/exportBackupJson";

export type ImportMode = "merge" | "replace";

// Denna funktion används nu faktiskt för validering
function isBackupV1(x: unknown): x is BackupFileV1 {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  // Vi kollar att det ser ut som vår backup-struktur
  return typeof o.matchId === "string" && Array.isArray(o.events);
}

function normalizeEvent(e: any, matchId: string): AppEvent {
  // 1. Hantera Period
  let period = 1;
  if (e.period === 2 || e.period === "H2") {
    period = 2;
  }

  // 2. Hantera Typ och Straff
  let type = e.type || "NOTE";
  let isPenalty = !!e.isPenalty;

  if (type === "PENALTY") {
    type = "SHOT";
    isPenalty = true;
  }

  // 3. Hantera Beskrivning/SubType
  let subType = e.subType || e.label || "";
  if (!subType && e.turnoverType) subType = e.turnoverType;
  if (!subType && e.meta?.turnoverType) subType = e.meta.turnoverType;

  // 4. Hantera Lag
  const team = e.team === "AWAY" ? "AWAY" : "HOME";

  return {
    id: e.id || uuidv4(),
    matchId,
    team,
    
    timestamp: Number(e.time ?? e.timestamp ?? 0),
    
    period, 
    phase: e.phase === "DEFENSE" ? "DEFENSE" : "ATTACK",
    type,
    subType,
    
    outcome: e.outcome,
    zone: e.widthZone || e.zone,
    distance: e.shotDistance || e.distance,
    goalCell: e.goalCell,
    passes: e.passes,
    isPenalty,
    
    color: e.color
  } as AppEvent;
}

export async function importBackupJsonFromText(text: string, mode: ImportMode): Promise<{ matchId: string; count: number }> {
  const parsed = JSON.parse(text);

  // FIX: Nu använder vi faktiskt funktionen, så varningen försvinner
  if (!isBackupV1(parsed)) {
    throw new Error("Ogiltig backup-fil (saknar matchId eller events).");
  }

  const matchId = parsed.matchId;
  const events = parsed.events.map((e) => normalizeEvent(e, matchId));

  await db.transaction("rw", db.events, async () => {
    if (mode === "replace") {
      await db.events.where("matchId").equals(matchId).delete();
    }
    await db.events.bulkPut(events);
  });

  return { matchId, count: events.length };
}