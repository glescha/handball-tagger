// FILE: src/services/eventService.ts
import { db } from "../db";
import type { AppEvent } from "../types";

export const eventService = {
  async list(matchId: string): Promise<AppEvent[]> {
    return (await db.events.where("matchId").equals(matchId).sortBy("time")) as AppEvent[];
  },

  async add(event: AppEvent): Promise<number> {
    return (await db.events.add(event)) as unknown as number;
  },

  async deleteLast(matchId: string): Promise<void> {
    const last = (await db.events.where("matchId").equals(matchId).reverse().first()) as AppEvent | undefined;
    if (last?.id !== undefined) await db.events.delete(last.id);
  },
};
