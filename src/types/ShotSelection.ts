// FILE: src/types/ShotSelection.ts

export type WidthZoneIndex = 1 | 2 | 3 | 4 | 5;

// LÄGG TILL DENNA: Alias för bakåtkompatibilitet
export type ShotZone = WidthZoneIndex;

export type ShotDistance = "6m" | "9m";

export type GoalCell = 1 | 2 | 3 | 4 | 5 | 6;
export type GoalZone = GoalCell;

export type ShotOutcome = "GOAL" | "MISS" | "SAVE" | "PENALTY";

export type MatchPhase = "ATTACK" | "DEFENSE";
export type Period = 1 | 2 | "OT1" | "OT2" | "PENALTY";

export type TeamContext = "HOME" | "AWAY";

export type TurnoverType = 
  | "STEAL"             
  | "TECHNICAL_FAULT"   
  | "OFFENSIVE_FOUL"    
  | "PASSIVE_PLAY"      
  | "LOST_BALL";        

export function getZoneLabel(zone: WidthZoneIndex): string {
  switch (zone) {
    case 1: return "ZON 1 Vänster";
    case 2: return "ZON 2 Vänster";
    case 3: return "ZON 3";
    case 4: return "ZON 2 Höger";
    case 5: return "ZON 1 Höger";
    default: return `Zon ${zone}`;
  }
}

export function getVisualZoneLabel(zone: WidthZoneIndex): string {
  switch (zone) {
    case 1: return "1";
    case 2: return "2";
    case 3: return "3";
    case 4: return "2";
    case 5: return "1";
    default: return String(zone);
  }
}
