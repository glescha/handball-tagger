import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import type { AppEvent, EventType, ShotOutcome, TurnoverType } from "../types/AppEvents";

export function useTaggingLogic(matchId: string) {
  const [timeMs, setTimeMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [period, setPeriod] = useState(1);
  const timerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const [phase, setPhase] = useState<"ATTACK" | "DEFENSE">("ATTACK");
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [scores, setScores] = useState({ home: 0, away: 0 });
  const [teams, setTeams] = useState({ home: "HEMMA", away: "BORTA" });

  const [tempShot, setTempShot] = useState<{
    zone?: number;
    distance?: string;
    outcome?: ShotOutcome;
    goalCell?: number;
    passes?: number;
    isPenalty?: boolean;
  }>({});

  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem(`match_${matchId}_events`);
      const savedInfo = localStorage.getItem(`match_${matchId}_info`);
      if (savedEvents) {
          setEvents(JSON.parse(savedEvents));
          const savedScores = localStorage.getItem(`match_${matchId}_scores`);
          if (savedScores) setScores(JSON.parse(savedScores));
      }
      if (savedInfo) {
          const info = JSON.parse(savedInfo);
          setTeams({ home: info.homeTeam || "HEMMA", away: info.awayTeam || "BORTA" });
      }
    } catch(e) { console.error(e); }
  }, [matchId]);

  useEffect(() => {
      localStorage.setItem(`match_${matchId}_events`, JSON.stringify(events));
      localStorage.setItem(`match_${matchId}_scores`, JSON.stringify(scores));
  }, [events, scores, matchId]);

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsRunning(true);
      lastTickRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        setTimeMs(prev => prev + delta);
        lastTickRef.current = now;
      }, 100);
    }
  }, [isRunning]);

  const adjustTime = useCallback((seconds: number) => {
      setTimeMs(prev => Math.max(0, prev + (seconds * 1000)));
  }, []);

  const setTime = useCallback((ms: number) => {
      setTimeMs(ms);
  }, []);

  const addEvent = (type: EventType, data: any = {}) => {
      const newEvent: AppEvent = {
          id: uuidv4(),
          matchId,
          timestamp: timeMs,
          period,
          phase,
          type,
          ...data
      };
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
  };

  const switchPhase = () => setPhase(p => p === "ATTACK" ? "DEFENSE" : "ATTACK");
  const togglePhase = switchPhase; 

  const handleCourtClick = (zone: number, distance: string) => {
      setTempShot(prev => ({ ...prev, zone, distance }));
  };

  const handleGoalClick = (cell: number) => {
      // Om det är MISS ska vi inte sätta goalCell
      if (tempShot.outcome === "MISS") return;
      setTempShot(prev => ({ ...prev, goalCell: cell }));
  };

  const handleOutcome = (outcome: ShotOutcome) => {
      setTempShot(prev => {
          const newShot = { ...prev, outcome };
          // Om man byter till MISS, rensa eventuell vald placering
          if (outcome === "MISS") {
              delete newShot.goalCell;
              delete newShot.passes;
          }
          return newShot;
      });
  };

  const startPenalty = () => {
      setTempShot({ isPenalty: true, distance: "7m" });
  };

  const handlePasses = (n: number) => {
      setTempShot(prev => ({ ...prev, passes: n }));
  };

  const cancelShot = () => setTempShot({});

  const commitShot = () => {
      if (!tempShot.outcome) return;

      addEvent("SHOT", { ...tempShot, playerId: "Spelare" });

      if (tempShot.outcome === "GOAL") {
          setScores(s => phase === "ATTACK" ? { ...s, home: s.home + 1 } : { ...s, away: s.away + 1 });
          switchPhase(); 
      } else {
          switchPhase(); 
      }
      setTempShot({});
  };

  const handleTurnover = (subType: TurnoverType, label: string) => {
      addEvent("TURNOVER", { subType, subTypeLabel: label });
      switchPhase(); 
  };

  const handleFreeThrow = () => {
      addEvent("FREE_THROW");
  };

  const undoLastEvent = () => {
      setEvents(prev => {
          if (prev.length === 0) return prev;
          const last = prev[prev.length - 1];
          const newEvents = prev.slice(0, -1);
          if (last.type === "SHOT" && last.outcome === "GOAL") {
              setScores(s => last.phase === "ATTACK" ? { ...s, home: s.home - 1 } : { ...s, away: s.away - 1 });
          }
          setPhase(last.phase); 
          return newEvents;
      });
  };

  // --- VALIDERING ---
  const isReadyToSave = useMemo(() => {
      // Straff
      if (tempShot.isPenalty) {
          if (!tempShot.outcome) return false;
          // Om outcome INTE är MISS, krävs placering
          if (tempShot.outcome !== "MISS" && !tempShot.goalCell) return false;
          return true;
      }

      // Vanligt skott: Kräver Zon, Distans och Utfall
      if (!tempShot.zone || !tempShot.distance || !tempShot.outcome) return false;

      // Om MISS -> OK (Kräver ej placering)
      if (tempShot.outcome === "MISS") return true;

      // Om MÅL/RÄDDNING -> Kräver Placering
      if (!tempShot.goalCell) return false;

      return true;
  }, [tempShot]);

  return {
      timer: { ms: timeMs, period, isRunning, toggleTimer, setPeriod, adjustTime, setTime },
      scores, teams,
      state: { phase, tempShot, isReadyToSave },
      actions: { togglePhase, handleCourtClick, handleGoalClick, handleOutcome, startPenalty, handlePasses, cancelShot, commitShot, handleTurnover, handleFreeThrow, undoLastEvent },
      events
  };
}