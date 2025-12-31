// src/eventService.ts
import type { MatchEvent } from "./types";

const KEY_PREFIX = "hb_events_v1:";

function key(matchId: string) {
  return `${KEY_PREFIX}${matchId}`;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function read(matchId: string): MatchEvent[] {
  try {
    const raw = localStorage.getItem(key(matchId));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as MatchEvent[]) : [];
  } catch {
    return [];
  }
}

function write(matchId: string, events: MatchEvent[]) {
  localStorage.setItem(key(matchId), JSON.stringify(events));
}

/**
 * Returnerar events för matchen i tidsordning (äldst -> nyast).
 */
export async function listEvents(matchId: string): Promise<MatchEvent[]> {
  const events = read(matchId);
  events.sort((a: any, b: any) => (a?.ts ?? 0) - (b?.ts ?? 0));
  return events;
}

/**
 * Lägger till ett event. Du kan skicka in valfri event-payload (MatchEvent-form).
 * Saknas id/ts så fylls det i automatiskt.
 */
export async function addEvent(matchId: string, event: any): Promise<MatchEvent> {
  const events = read(matchId);

  const e: any = {
    ...event,
    matchId: event?.matchId ?? matchId,
    id: event?.id ?? uid(),
    ts: event?.ts ?? Date.now(),
  };

  events.push(e as MatchEvent);
  write(matchId, events);
  return e as MatchEvent;
}

/**
 * Tar bort senaste eventet (högst ts) för matchen.
 */
export async function deleteLastEvent(matchId: string): Promise<void> {
  const events = read(matchId);
  if (events.length === 0) return;

  let idx = 0;
  let best = (events[0] as any)?.ts ?? 0;

  for (let i = 1; i < events.length; i++) {
    const t = (events[i] as any)?.ts ?? 0;
    if (t >= best) {
      best = t;
      idx = i;
    }
  }

  events.splice(idx, 1);
  write(matchId, events);
}
/**
 * Tar bort ett specifikt event via id.
 */
export async function removeEvent(matchId: string, eventId: string): Promise<void> {
  const events = read(matchId);
  const next = events.filter((e: any) => e?.id !== eventId);
  if (next.length === events.length) return; // hittade inte
  write(matchId, next as MatchEvent[]);
}
export async function deleteEventsForMatch(matchId: string): Promise<void> {
  try {
    localStorage.removeItem(key(matchId));
  } catch {
    // ignore
  }
}
