import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { Match } from '../types/AppEvents'; 

export type CreateMatchInput = {
  homeTeam: string;
  awayTeam: string;
  date: string; 
  matchId?: string;
};

export async function createMatch(input: CreateMatchInput): Promise<Match> {
  const newMatch: Match = {
    matchId: input.matchId || uuidv4(),
    homeTeam: input.homeTeam,
    awayTeam: input.awayTeam,
    date: input.date,
    // FIX: Tog bort homeScore/awayScore eftersom de inte finns i Match-typen
    // Poängen räknas ut dynamiskt från händelselistan istället.
  };

  const id = await db.matches.add(newMatch) as number;
  
  return { ...newMatch, id };
}

export async function listMatches(): Promise<Match[]> {
  return await db.matches.toArray();
}

export async function getMatch(matchId: string): Promise<Match | undefined> {
  return await db.matches.where('matchId').equals(matchId).first();
}

export async function deleteMatch(id: number): Promise<void> {
  await db.matches.delete(id);
}