// src/eventService.ts
import { db } from "./db";
import type { MatchEvent } from "./types";
import { v4 as uuidv4 } from "uuid";
import { updateMatch } from "./matchService";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function nowHHMM(): string {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export async function addEvent(e: Omit<MatchEvent, "id" | "ts" | "timeHHMM"> & Partial<Pick<MatchEvent, "ts" | "timeHHMM">>) {
  const ts = typeof e.ts === "number" ? e.ts : Date.now();
  const timeHHMM = typeof e.timeHHMM === "string" && e.timeHHMM ? e.timeHHMM : nowHHMM();
  const ev: MatchEvent = { ...(e as any), id: uuidv4(), ts, timeHHMM };
  await db.events.put(ev);
  await updateMatch(ev.matchId, {}); // bump updatedTs
  return ev.id;
}

export async function listEvents(matchId: string): Promise<MatchEvent[]> {
  return db.events.where("matchId").equals(matchId).sortBy("ts");
}

export async function deleteMatchEvents(matchId: string): Promise<void> {
  const ids = await db.events.where("matchId").equals(matchId).primaryKeys();
  await db.events.bulkDelete(ids as string[]);
  await updateMatch(matchId, {});
}
