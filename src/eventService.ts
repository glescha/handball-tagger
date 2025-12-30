// src/eventService.ts
import type { MatchEvent, MatchInfo } from "./types";

const KEY_MATCHES = "hb.matches.v1";
const KEY_EVENTS_PREFIX = "hb.events.v1.";

function safeJsonParse<T>(s: string | null, fallback: T): T {
  try {
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function listMatches(): MatchInfo[] {
  return safeJsonParse<MatchInfo[]>(localStorage.getItem(KEY_MATCHES), []);
}

export function upsertMatch(info: MatchInfo) {
  const all = listMatches();
  const idx = all.findIndex((m) => m.matchId === info.matchId);
  if (idx >= 0) all[idx] = info;
  else all.unshift(info);
  localStorage.setItem(KEY_MATCHES, JSON.stringify(all));
}

export async function listEvents(matchId: string): Promise<MatchEvent[]> {
  const key = KEY_EVENTS_PREFIX + matchId;
  return safeJsonParse<MatchEvent[]>(localStorage.getItem(key), []);
}

export async function addEvent(matchId: string, ev: MatchEvent): Promise<void> {
  const key = KEY_EVENTS_PREFIX + matchId;
  const all = safeJsonParse<MatchEvent[]>(localStorage.getItem(key), []);
  all.push(ev);
  localStorage.setItem(key, JSON.stringify(all));
}

export async function deleteLastEvent(matchId: string): Promise<void> {
  const key = KEY_EVENTS_PREFIX + matchId;
  const all = safeJsonParse<MatchEvent[]>(localStorage.getItem(key), []);
  all.pop();
  localStorage.setItem(key, JSON.stringify(all));
}

export async function clearMatch(matchId: string): Promise<void> {
  localStorage.removeItem(KEY_EVENTS_PREFIX + matchId);
}