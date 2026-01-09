// FILE: src/hooks/useMatchData.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export const useMatchData = (matchId: string) => {
  // FIX: Vi måste skicka in ett objekt { matchId } för att Dexie ska söka på indexet "matchId",
  // istället för primärnyckeln "id" (som är ett nummer).
  const match = useLiveQuery(() => db.matches.get({ matchId }), [matchId]);
  
  return { match };
};
