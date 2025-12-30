// src/types.ts
export type TeamContext = "ANFALL" | "FORSVAR";
export type Period = "H1" | "H2";

export type Scope = "ALL" | "P1" | "P2";

export type TurnoverType = "Brytning" | "Tappad boll" | "Regelfel" | "Passivt spel";
export type PassBucket = "<2" | "<4" | "FLER";

export type ShotDistance = "6m" | "9m";
export type ShotZone = 1 | 2 | 3;
export type ShotOutcome = "MAL" | "RADDNING" | "MISS";
export type GoalPlacement = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type EventType = "SHOT_PLAY" | "TURNOVER" | "FREE_THROW";

export type MatchInfo = {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  dateISO: string; // YYYY-MM-DD
  venue?: string;
};

export type BaseEvent = {
  id: string;
  matchId: string;
  ts: number; // epoch ms
  timeHHMM: string; // "MM:SS" eller "HH:MM"
  period: Period; // H1/H2
  ctx: TeamContext; // ANFALL/FORSVAR
  type: EventType;
};

export type ShotPlayEvent = BaseEvent & {
  type: "SHOT_PLAY";
  zone: ShotZone; // 1-3 (bredd)
  distance: ShotDistance; // 6m/9m
  outcome: ShotOutcome; // MAL/RADDNING/MISS
  goalPlacement?: GoalPlacement; // 1-9
  passBucket?: PassBucket; // <2/<4/FLER
};

export type TurnoverEvent = BaseEvent & {
  type: "TURNOVER";
  turnoverType: TurnoverType;
};

export type FreeThrowEvent = BaseEvent & {
  type: "FREE_THROW";
};

export type MatchEvent = ShotPlayEvent | TurnoverEvent | FreeThrowEvent;

export type CtxRecord<T> = Record<TeamContext, T>;