// src/db.ts
import Dexie, { type Table } from "dexie";
import type { Match, MatchEvent } from "./types";

export type KV = { key: string; value: string };

export class HBDB extends Dexie {
  matches!: Table<Match, string>;
  events!: Table<MatchEvent, string>;
  kv!: Table<KV, string>;

  constructor() {
    super("handball_tagger_db_v1");
    this.version(1).stores({
      matches: "id, status, updatedTs, createdTs",
      events: "id, matchId, ts, period, ctx, type",
      kv: "key",
    });
  }
}

export const db = new HBDB();

export async function kvGet(key: string): Promise<string | null> {
  const row = await db.kv.get(key);
  return row?.value ?? null;
}

export async function kvSet(key: string, value: string): Promise<void> {
  await db.kv.put({ key, value });
}
