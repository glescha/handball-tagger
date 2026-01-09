export type EventType = "SHOT" | "TURNOVER" | "FREE_THROW" | "TIMEOUT";
export type MatchPhase = "ATTACK" | "DEFENSE";
export type ShotOutcome = "GOAL" | "SAVE" | "MISS";
export type TurnoverType = "STEAL" | "LOST_BALL" | "TECHNICAL_FAULT" | "PASSIVE_PLAY";

// Typer för Zoner och Avstånd
export type GoalCell = 1 | 2 | 3 | 4 | 5 | 6;
export type WidthZoneIndex = 1 | 2 | 3 | 4 | 5;
export type ShotDistance = "6m" | "9m" | "7m";

// NY: Match-definition för Startskärmen och databasen
export interface Match {
    id?: number;      // Databas-ID (ofta auto-increment i IndexedDB)
    matchId: string;  // Unikt UUID
    homeTeam: string;
    awayTeam: string;
    date: string;     // ISO-datumsträng
}

export interface AppEvent {
    id: string;
    matchId: string;
    timestamp: number;
    period: 1 | 2;
    phase: MatchPhase;
    type: EventType;
    playerId?: string;

    // Skottdata
    zone?: number;       
    distance?: string;   
    outcome?: ShotOutcome;
    goalCell?: number;   
    isPenalty?: boolean;
    passes?: number;

    // Omställningsdata
    subType?: TurnoverType;
    subTypeLabel?: string;
    
    // UI-specifikt (valfritt)
    color?: string;
}