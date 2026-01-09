// FILE: src/hooks/useEvents.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { AppEvent } from '../types';

export const useEvents = (matchId: string) => {
  // Hämta händelser live från databasen
  const events = useLiveQuery(
    async () => {
      if (!matchId) return [];
      
      // Hämta alla events för denna match och sortera på tid
      const result = await db.events
        .where('matchId')
        .equals(matchId)
        .sortBy('time');
        
      return result as AppEvent[];
    },
    [matchId]
  ) ?? []; 

  const addEvent = async (event: AppEvent) => {
    try {
      // Ta bort 'id' om det finns så Dexie får generera ett nytt
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = event; 
      
      await db.events.add(rest as AppEvent);
    } catch (error) {
      console.error("Kunde inte spara händelse:", error);
    }
  };

  // FIX: Denna funktion saknades i din kod men returnerades
  const deleteLastEvent = async () => {
    try {
      const last = await db.events
        .where('matchId')
        .equals(matchId)
        .reverse()
        .first();
      
      if (last?.id !== undefined) {
        await db.events.delete(last.id);
      }
    } catch (error) {
      console.error("Kunde inte radera:", error);
    }
  };

  return {
    events,
    addEvent,
    deleteLastEvent
  };
};
