// ===== Team / Period =====
export type TeamContext = "ANFALL" | "FORSVAR";
export type Period = 1 | 2;

export type EventType =
  | "TOTAL_ATTACK"
  | "SHOT_PLAY"
  | "SHOT_7M"
  | "TURNOVER"
  | "SHORT_ATTACK"
  | "FREE_THROW"
  | "GOAL_PLACEMENT";

export type Outcome = "MAL" | "MISS" | "RADDNING";
export type Distance = "9m" | "6m";
export type Zone = 1 | 2 | 3;
export type GoalZone = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** NY: Omställningstyper (gäller både Anfall och Försvar) */
export type TurnoverType = "Brytning" | "Tappad boll" | "Regelfel" | "Passivt spel";

export type MatchMeta = {
  id: string;
  title: string;
  dateISO: string;
};

export type MatchEvent = {
  id: string;
  matchId: string;
  ts: number;
  period: Period;
  ctx: TeamContext;
  type: EventType;

  delta?: 1 | -1;

  zone?: Zone;
  distance?: Distance;
  outcome?: Outcome;

  /** TURNOVER */
  turnoverType?: TurnoverType;

  /** SHORT_ATTACK */
  shortType?: "<2" | "<4" | "FLER";

  /** GOAL_PLACEMENT */
  goalZone?: GoalZone;

  note?: string;
};