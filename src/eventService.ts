import { v4 as uuidv4 } from "uuid";
import { db } from "./db";
import type { MatchEvent, MatchMeta } from "./types";

export async function createMatch(title: string, dateISO: string) {
  const match: MatchMeta = {
    id: uuidv4(),
    title,
    dateISO,
  };
  await db.matches.add(match);
  return match;
}

export async function getMatch(matchId: string) {
  return db.matches.get(matchId);
}

export async function listMatches(limit = 20) {
  const all = await db.matches.orderBy("dateISO").reverse().toArray();
  return all.slice(0, limit);
}

export async function addEvent(e: Omit<MatchEvent, "id" | "ts">) {
  const event: MatchEvent = {
    ...e,
    id: uuidv4(),
    ts: Date.now(),
  };
  await db.events.add(event);
  return event;
}

export async function listEvents(matchId: string) {
  return db.events.where({ matchId }).sortBy("ts");
}

export async function listRecent(matchId: string, n = 8) {
  const all = await db.events.where({ matchId }).reverse().sortBy("ts");
  return all.slice(0, n);
}

export async function undoLast(matchId: string) {
  const all = await db.events.where({ matchId }).reverse().sortBy("ts");
  const last = all[0];
  if (!last) return null;
  await db.events.delete(last.id);
  return last;
}

export async function deleteMatch(matchId: string) {
  await db.events.where({ matchId }).delete();
  await db.matches.delete(matchId);
}