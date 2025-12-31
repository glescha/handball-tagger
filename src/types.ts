// src/types.ts
export type TeamContext = "ANFALL" | "FORSVAR";
export type Period = "H1" | "H2";

export type EventType =
  | "TOTAL_ATTACK"
  | "FREE_THROW"
  | "TURNOVER"
  | "SHOT_PLAY"
  | "GOAL_PLACEMENT"
  | "SHORT_ATTACK";

export type TurnoverType = "Brytning" | "Tappad boll" | "Regelfel" | "Passivt spel";
export type ShotOutcome = "MAL" | "RADDNING" | "MISS";
export type ShotZone = 1 | 2 | 3;
export type ShotDistance = "6m" | "9m";
export type GoalZone = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type PassBucket = "<2" | "<4" | "FLER";

export type MatchStatus = "IN_PROGRESS" | "DONE";

export type Match = {
  matchId: string;
  venue?: string;
  updatedTs: number;
  status: MatchStatus;

  // match info (fill what you have)
  dateISO?: string; // YYYY-MM-DD
  timeHHMM?: string; // HH:MM
  homeTeam?: string;
  awayTeam?: string;
  location?: string;
  competition?: string;
  notes?: string;
};

export type BaseEvent = {
  id: string;
  matchId: string;
  ts: number; // epoch ms
  timeHHMM: string; // shown in app
  period: Period; // H1/H2
  ctx: TeamContext; // ANFALL/FORSVAR
  type: EventType;
};

export type TotalAttackEvent = BaseEvent & { type: "TOTAL_ATTACK" };
export type FreeThrowEvent = BaseEvent & { type: "FREE_THROW" };
export type TurnoverEvent = BaseEvent & { type: "TURNOVER"; turnoverType: TurnoverType };

export type ShotPlayEvent = BaseEvent & {
  type: "SHOT_PLAY";
  outcome: ShotOutcome;

  // För MÅL/RÄDDNING fylls dessa i.
  // För MISS kan de lämnas tomma (så MISS blir "endast miss + anfall").
  zone?: ShotZone;
  distance?: ShotDistance;
  goalZone?: GoalZone;
};

export type GoalPlacementEvent = BaseEvent & { type: "GOAL_PLACEMENT"; goalZone: GoalZone };

export type ShortAttackEvent = BaseEvent & { type: "SHORT_ATTACK"; shortType: PassBucket };

export type MatchEvent =
  | TotalAttackEvent
  | FreeThrowEvent
  | TurnoverEvent
  | ShotPlayEvent
  | GoalPlacementEvent
  | ShortAttackEvent;
