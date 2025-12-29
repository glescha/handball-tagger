import Dexie from "dexie";
import type { Table } from "dexie";
import type { MatchEvent, MatchMeta } from "./types";

export class AppDB extends Dexie {
  matches!: Table<MatchMeta, string>;
  events!: Table<MatchEvent, string>;

  constructor() {
    super("handball_tagger_db");

    this.version(1).stores({
      matches: "id, dateISO, title",
      events: "id, matchId, ts, period, ctx, type"
    });
  }
}

export const db = new AppDB();