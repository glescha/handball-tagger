// src/matchService.ts
import type { Match } from "./types";
import { kvGetAll, kvPut, kvGet, kvDel } from "./kv";
import { deleteEventsForMatch } from "./eventService";

function sortMatches(a: Match, b: Match) {
  const at = (a as any).updatedTs ?? 0;
  const bt = (b as any).updatedTs ?? 0;
  return bt - at;
}

export async function listMatches(): Promise<Match[]> {
  const all = await kvGetAll<Match>("matches");
  return all.sort(sortMatches);
}

export async function getMatch(matchId: string): Promise<Match | undefined> {
  return await kvGet<Match>("matches", matchId);
}

export async function upsertMatch(match: Match): Promise<void> {
  if (!(match as any).matchId) {
    throw new Error("upsertMatch: match.matchId saknas");
  }
  const now = Date.now();
  const withTs: Match = {
    ...(match as any),
    updatedTs: (match as any).updatedTs ?? now,
  } as Match;

  await kvPut("matches", withTs);
}

export async function deleteMatch(matchId: string): Promise<void> {
  await kvDel("matches", matchId);
  // rensa även events för matchen (localStorage)
  await deleteEventsForMatch(matchId);
}

// OBS: vill du alltid starta på startsidan, använd INTE getActiveMatch i App längre.
export async function getActiveMatch(): Promise<Match | undefined> {
  const matches = await listMatches();
  return matches[0];
}
