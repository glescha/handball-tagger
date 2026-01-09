import { AppEvent } from "../types/AppEvents";

export type StatBlock = {
  count: number;        // Täljare (t.ex. Räddningar)
  total: number;        // Nämnare 1 (Totala Anfall)
  pct: number;          // count / total %
  
  // NYTT: För målvaktsstatistik (Skott på mål = Avslut - Miss)
  opportunities: number; // Nämnare 2 (Räddningar + Mål)
  savePct: number;       // count / opportunities % (Klassisk räddningsprocent)
};

export type PhaseDetails = {
  totalAttacks: number;
  sixMeter: StatBlock;
  nineMeter: StatBlock;
  wing: StatBlock; 
  penalty: StatBlock; 
  z1: StatBlock;
  z2: StatBlock;
  z3: StatBlock;
  z4: StatBlock;
  z5: StatBlock;
  misses: StatBlock; 
  turnoversTotal: StatBlock;
  steal: StatBlock;      
  lostBall: StatBlock;   
  techFault: StatBlock;  
  passive: StatBlock;    
};

export type ExtendedStats = {
  overview: {
    attack: any; 
    defense: any;
  };
  details: {
    attack: PhaseDetails;
    defense: PhaseDetails;
    goalkeeper: PhaseDetails; 
  };
};

const calcPct = (part: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

// Uppdaterad för att hantera "Opportunities" (Chanser/Skott på mål)
const createStatBlock = (count: number, total: number, opportunities: number = 0): StatBlock => ({
  count,
  total,
  pct: calcPct(count, total),
  opportunities,
  savePct: calcPct(count, opportunities)
});

export function calculateExtendedStats(events: AppEvent[]): ExtendedStats {
  
  const attackEvents = events.filter(e => e.phase === "ATTACK");
  const defenseEvents = events.filter(e => e.phase === "DEFENSE");

  const countAttacks = (evs: AppEvent[]) => 
    evs.filter(e => e.type === "SHOT").length + evs.filter(e => e.type === "TURNOVER").length;

  const totalAttackAttacks = countAttacks(attackEvents);
  const totalDefenseAttacks = countAttacks(defenseEvents);

  const getPhaseDetails = (phaseEvents: AppEvent[], totalAttacks: number, isGoalKeeper: boolean = false): PhaseDetails => {
    const shots = phaseEvents.filter(e => e.type === "SHOT");
    const turnovers = phaseEvents.filter(e => e.type === "TURNOVER");
    const targetOutcome = isGoalKeeper ? "SAVE" : "GOAL";
    
    // Hjälpfunktion för att räkna count, total och opportunities
    const getStats = (predicate: (e: AppEvent) => boolean) => {
        const subset = shots.filter(predicate);
        
        const count = subset.filter(e => e.outcome === targetOutcome).length;
        
        // Opportunities (Skott på mål) = Mål + Räddningar (dvs Avslut - Miss)
        const saves = subset.filter(e => e.outcome === "SAVE").length;
        const goals = subset.filter(e => e.outcome === "GOAL").length;
        const onTarget = saves + goals;

        // För straffar är nämnaren (total) antalet straffar, inte totala anfall
        // Men vi sköter det manuellt nedan för straffar.
        return createStatBlock(count, totalAttacks, onTarget);
    };

    const penalties = shots.filter(e => e.isPenalty);
    const penaltySuccess = penalties.filter(e => e.outcome === targetOutcome).length;
    const penaltyOnTarget = penalties.filter(e => e.outcome === "GOAL" || e.outcome === "SAVE").length;
    const misses = shots.filter(e => e.outcome === "MISS").length;

    const is6m = (e: AppEvent) => e.distance === "6m" && !e.isPenalty;
    const is9m = (e: AppEvent) => e.distance === "9m";
    const isWing = (e: AppEvent) => (e.zone === 1 || e.zone === 5) && !e.isPenalty; 
    
    const countTurnover = (subStr: string) => turnovers.filter(e => e.subType && e.subType.includes(subStr)).length;

    return {
      totalAttacks,
      sixMeter: getStats(is6m),
      nineMeter: getStats(is9m),
      wing: getStats(isWing),
      
      // Straff: count / straffar (ej anfall)
      penalty: createStatBlock(penaltySuccess, penalties.length, penaltyOnTarget),

      z1: getStats(e => e.zone === 1),
      z2: getStats(e => e.zone === 2),
      z3: getStats(e => e.zone === 3),
      z4: getStats(e => e.zone === 4),
      z5: getStats(e => e.zone === 5),

      misses: createStatBlock(misses, totalAttacks, 0),

      turnoversTotal: createStatBlock(turnovers.length, totalAttacks),
      steal: createStatBlock(countTurnover(isGoalKeeper ? "XXX" : (phaseEvents[0]?.phase === "ATTACK" ? "Brytning" : "Bollvinst")), totalAttacks),
      lostBall: createStatBlock(countTurnover("Tappad"), totalAttacks),
      techFault: createStatBlock(countTurnover("Regelfel"), totalAttacks),
      passive: createStatBlock(countTurnover("Passivt"), totalAttacks),
    };
  };

  const getOldOverview = (pe: AppEvent[], isAtt: boolean) => {
      const s = pe.filter(e => e.type === "SHOT");
      const g = s.filter(e => e.outcome === "GOAL");
      const sv = s.filter(e => e.outcome === "SAVE");
      const t = pe.filter(e => e.type === "TURNOVER");
      const tot = s.length + t.length;
      let specT = 0;
      if (isAtt) specT = t.filter(e => e.subType?.includes("Tappad")).length;
      else specT = t.filter(e => e.subType?.includes("Bollvinst")).length;
      
      const gLow = g.filter(e => e.passes !== undefined && e.passes <= 2).length;
      const gMid = g.filter(e => e.passes !== undefined && e.passes >= 3 && e.passes <= 4).length;
      const gHigh = g.filter(e => e.passes !== undefined && e.passes >= 5).length;

      return {
          totalAttacks: tot,
          shots: createStatBlock(s.length, tot),
          goals: createStatBlock(g.length, tot),
          efficiency: createStatBlock(g.length, s.length),
          turnovers: createStatBlock(t.length, tot),
          specificTurnover: createStatBlock(specT, tot),
          saves: createStatBlock(sv.length, tot),
          passes: {
            low: createStatBlock(gLow, tot),
            mid: createStatBlock(gMid, tot),
            high: createStatBlock(gHigh, tot)
          }
      };
  };

  return {
    overview: {
      attack: getOldOverview(attackEvents, true),
      defense: getOldOverview(defenseEvents, false)
    },
    details: {
      attack: getPhaseDetails(attackEvents, totalAttackAttacks, false),
      defense: getPhaseDetails(defenseEvents, totalDefenseAttacks, false),
      goalkeeper: getPhaseDetails(defenseEvents, totalDefenseAttacks, true)
    }
  };
}