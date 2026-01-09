import Dexie, { type Table } from "dexie";
// FIX: Importera från rätt fil där vi nyss lade till Match
import type { AppEvent, Match } from "./types/AppEvents";

export class HandballTaggerDB extends Dexie {
  matches!: Table<Match>;
  events!: Table<AppEvent>;

  constructor() {
    super("HandballTaggerDB");
    
    this.version(2).stores({
      matches: "++id, matchId, date, homeTeam, awayTeam",
      events: "++id, matchId, timestamp, type, phase" // OBS: time -> timestamp för att matcha AppEvent
    });
  }
}

export const db = new HandballTaggerDB();