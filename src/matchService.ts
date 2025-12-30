// src/matchService.ts
import { db, kvGet, kvSet } from "./db";
import type { Match } from "./types";
import { v4 as uuidv4 } from "uuid";

const ACTIVE_MATCH_KEY = "activeMatchId";

export async function createMatch(input: Omit<Match, "id" | "createdTs" | "updatedTs" | "status">): Promise<string> {
  const id = uuidv4();
  const now = Date.now();
  const match: Match = {
    id,
    createdTs: now,
    updatedTs: now,
    status: "IN_PROGRESS",
    ...input,
  };
  await db.matches.put(match);
  await kvSet(ACTIVE_MATCH_KEY, id);
  return id;
}

export async function updateMatch(matchId: string, patch: Partial<Match>): Promise<void> {
  const now = Date.now();
  await db.matches.update(matchId, { ...patch, updatedTs: now });
}

export async function getMatch(matchId: string): Promise<Match | undefined> {
  return db.matches.get(matchId);
}

export async function listMatches(): Promise<Match[]> {
  return db.matches.orderBy("updatedTs").reverse().toArray();
}

export async function setActiveMatch(matchId: string | null): Promise<void> {
  await kvSet(ACTIVE_MATCH_KEY, matchId ?? "");
}

export async function getActiveMatch(): Promise<string | null> {
  const v = await kvGet(ACTIVE_MATCH_KEY);
  if (!v) return null;
  const id = v.trim();
  return id ? id : null;
}

export async function finishMatch(matchId: string): Promise<void> {
  await updateMatch(matchId, { status: "DONE" });
  const active = await getActiveMatch();
  if (active === matchId) await setActiveMatch(null);
}
