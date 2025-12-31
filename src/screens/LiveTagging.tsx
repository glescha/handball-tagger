// src/screens/LiveTagging.tsx
import { useEffect, useMemo, useState } from "react";
import type {
  GoalZone,
  MatchEvent,
  PassBucket,
  Period,
  ShotDistance,
  ShotOutcome,
  ShotZone,
  TeamContext,
  TurnoverType,
} from "../types";
import { addEvent, deleteLastEvent, listEvents } from "../eventService";
import * as matchService from "../matchService";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function nowHHMM() {
  const d = new Date();
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function LiveTagging(props: {
  matchId: string;
  onSummary: () => void;
  onExit: () => void;
}) {
  // Match-meta (för titel) – robust: funkar även om matchService saknar exakt funktion
  const [match, setMatch] = useState<any>(null);

  const [ctx, setCtx] = useState<TeamContext>("ANFALL");
  const [period, setPeriod] = useState<Period>("H1");

  // Avslut inputs
  const [outcome, setOutcome] = useState<ShotOutcome>("MAL");
  const [distance, setDistance] = useState<ShotDistance>("9m");
  const [zone, setZone] = useState<ShotZone>(2);
  const [goalZone, setGoalZone] = useState<GoalZone>(5);
  const [passBucket, setPassBucket] = useState<PassBucket>("<4");

  const [events, setEvents] = useState<MatchEvent[]>([]);
  const latest = useMemo(() => [...events].slice().reverse(), [events]);

  const isGoal = outcome === "MAL";
  const isSave = outcome === "RADDNING";
  const isMiss = outcome === "MISS";

  const refresh = async () => {
    setEvents(await listEvents(props.matchId));
  };

  useEffect(() => {
    refresh();

    // Försök hitta matchinfo för titel
    (async () => {
      try {
        const ms: any = matchService as any;

        // 1) getMatch(matchId)
        if (typeof ms.getMatch === "function") {
          const m = await ms.getMatch(props.matchId);
          setMatch(m ?? null);
          return;
        }

        // 2) getMatchById(matchId)
        if (typeof ms.getMatchById === "function") {
          const m = await ms.getMatchById(props.matchId);
          setMatch(m ?? null);
          return;
        }

        // 3) listMatches() och leta
        if (typeof ms.listMatches === "function") {
          const all = await ms.listMatches();
          const m = Array.isArray(all) ? all.find((x: any) => x?.matchId === props.matchId) : null;
          setMatch(m ?? null);
          return;
        }

        setMatch(null);
      } catch {
        setMatch(null);
      }
    })();
  }, [props.matchId]);

  const push = async (ev: any) => {
    await addEvent(props.matchId, ev);
    await refresh();
  };

  const onUndo = async () => {
    await deleteLastEvent(props.matchId);
    await refresh();
  };

  const base = <T extends MatchEvent["type"]>(type: T) =>
    ({
      id: uid(),
      matchId: props.matchId,
      ts: Date.now(),
      timeHHMM: nowHHMM(),
      period,
      ctx,
      type,
    }) as Extract<MatchEvent, { type: T }>;

  // ===========
  // SPARA AVSLUT
  // ===========
  const saveShot = async () => {
    if (isMiss) {
      // MISS: spara bara outcome + period + ctx (ingen zon/avstånd/placering/pass)
      await push({
        ...base("SHOT_PLAY"),
        outcome: "MISS",
      } as any);
      return;
    }

    // MÅL / RÄDDNING: spara zon+avstånd+placering
    await push({
      ...base("SHOT_PLAY"),
      zone,
      distance,
      outcome: isGoal ? "MAL" : "RADDNING",
      goalZone,
    } as any);

    // Vid mål: spara också antal pass
    if (isGoal) {
      await push({
        ...base("SHORT_ATTACK"),
        shortType: passBucket,
      } as any);
    }
  };

  // ===========
  // OMSTÄLLNING / FRIKAST
  // ===========
  const addTurnover = async (turnoverType: TurnoverType) => {
    await push({
      ...base("TURNOVER"),
      turnoverType,
    } as any);
  };

  const addFreeThrow = async () => {
    await push({
      ...base("FREE_THROW"),
    } as any);
  };

// =========================
  // Keyboard shortcuts (UX)
  // =========================
  const [showKeys, setShowKeys] = useState(false);

  function isTypingTarget(el: EventTarget | null) {
    const t = el as HTMLElement | null;
    if (!t) return false;
    const tag = (t.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || (t as any).isContentEditable;
  }

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      // om man skriver i input/textarea -> gör inget
      if (isTypingTarget(ev.target)) return;

      // undvik att kapa browser-shortcuts
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;

      const k = ev.key;

      // Hjälp overlay
      if (k === "?" || k === "h" || k === "H") {
        ev.preventDefault();
        setShowKeys((s) => !s);
        return;
      }

      // Undo
      if (k === "Backspace") {
        ev.preventDefault();
        onUndo();
        return;
      }

      // Spara avslut
      if (k === "Enter") {
        ev.preventDefault();
        saveShot();
        return;
      }

      // Halvlek
      if (k === "1") {
        ev.preventDefault();
        setPeriod("H1");
        return;
      }
      if (k === "2") {
        ev.preventDefault();
        setPeriod("H2");
        return;
      }

      // Kontext
      if (k === "a" || k === "A") {
        ev.preventDefault();
        setCtx("ANFALL");
        return;
      }
      if (k === "f" || k === "F") {
        // OBS: vi använder "f" för Försvar – frikast får annan tangent längre ned
        ev.preventDefault();
        setCtx("FORSVAR");
        return;
      }

      // Resultat (Mål/Räddning/Miss)
      if (k === "g" || k === "G") {
        ev.preventDefault();
        setOutcome("MAL");
        return;
      }
      if (k === "r" || k === "R") {
        ev.preventDefault();
        setOutcome("RADDNING");
        return;
      }
      if (k === "m" || k === "M") {
        ev.preventDefault();
        setOutcome("MISS");
        return;
      }

      // Avstånd
      if (k === "6") {
        ev.preventDefault();
        setDistance("6m");
        return;
      }
      if (k === "9") {
        ev.preventDefault();
        setDistance("9m");
        return;
      }

      // Bredd / zon
      if (k === "z" || k === "Z") {
        ev.preventDefault();
        setZone(1);
        return;
      }
      if (k === "x" || k === "X") {
        ev.preventDefault();
        setZone(2);
        return;
      }
      if (k === "c" || k === "C") {
        ev.preventDefault();
        setZone(3);
        return;
      }

      // Placering i mål (1–9) via tangent
      // (obs: siffrorna 1/2 är redan halvlek, så vi låter goalZone ta 3–9 direkt
      // och 1/2 nås via UI eller genom att använda Numpad om du vill vidareutveckla)
      if ("3456789".includes(k)) {
        ev.preventDefault();
        setGoalZone(Number(k) as GoalZone);
        return;
      }

      // Pass-bucket (bara relevant vid mål, men vi sätter ändå state)
      if (k === "<") {
        // valfri: inget här
        return;
      }
      if (k === "p" || k === "P") {
        // p = <2
        ev.preventDefault();
        setPassBucket("<2");
        return;
      }
      if (k === "o" || k === "O") {
        // o = <4
        ev.preventDefault();
        setPassBucket("<4");
        return;
      }
      if (k === "l" || k === "L") {
        // l = FLER
        ev.preventDefault();
        setPassBucket("FLER");
        return;
      }

      // Omställning (brytning/tappad/regelfel/passivt)
      if (k === "b" || k === "B") {
        ev.preventDefault();
        addTurnover("Brytning");
        return;
      }
      if (k === "t" || k === "T") {
        ev.preventDefault();
        addTurnover("Tappad boll");
        return;
      }
      if (k === "e" || k === "E") {
        ev.preventDefault();
        addTurnover("Regelfel");
        return;
      }
      if (k === "s" || k === "S") {
        ev.preventDefault();
        addTurnover("Passivt spel");
        return;
      }

      // Frikast (använd "k" för att inte krocka med Försvar = f)
      if (k === "k" || k === "K") {
        ev.preventDefault();
        addFreeThrow();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onUndo, saveShot, addTurnover, addFreeThrow]);

  // ===========
  // UI labels
  // ===========
  const matchTitle =
    match?.homeTeam && match?.awayTeam ? `${match.homeTeam} – ${match.awayTeam}` : "Handball";

  const matchSubline = match?.dateISO
    ? `${match.dateISO}${match?.venue ? ` • ${match.venue}` : ""}`
    : `MatchId: ${props.matchId}`;

  return (
    <div className="page">
      {/* Header */}
      <div className="card" style={{ marginTop: 0 }}>
        <div className="row between" style={{ gap: 12 }}>
          <div>
            <h1 style={{ marginBottom: 6 }}>{matchTitle}</h1>
            <div className="muted">{matchSubline}</div>
          </div>
          <div className="row gap">
            <button className="btn" onClick={props.onSummary}>
              Summering
            </button>
            <button className="btn" onClick={props.onExit}>
              Avsluta
            </button>
          </div>
        </div>

        <div className="row between" style={{ marginTop: 12, gap: 12 }}>
          <div className="row gap">
            <div className="seg">
              <button className={ctx === "ANFALL" ? "segon" : ""} onClick={() => setCtx("ANFALL")}>
                Anfall
              </button>
              <button className={ctx === "FORSVAR" ? "segon" : ""} onClick={() => setCtx("FORSVAR")}>
                Försvar
              </button>
            </div>

            <div className="seg">
              <button className={period === "H1" ? "segon" : ""} onClick={() => setPeriod("H1")}>
                H1
              </button>
              <button className={period === "H2" ? "segon" : ""} onClick={() => setPeriod("H2")}>
                H2
              </button>
            </div>
          </div>

          <button className="btn" onClick={onUndo}>
            Ångra senaste
          </button>
        </div>
      </div>

      {/* WRAPPER: två rutor bredvid varandra */}
      <div className="liveGrid" style={{ marginTop: 12 }}>
        {/* VÄNSTER: Anfall/Avslut */}
        <div className="card">
          <h2>Anfall</h2>

          <div className="subGrid">
            {/* Resultat först */}
            <div className="group">
              <div className="groupTitle">Resultat</div>
              <div className="btnGrid3">
                <button className={isGoal ? "segon" : ""} onClick={() => setOutcome("MAL")}>
                  Mål
                </button>
                <button className={isSave ? "segon" : ""} onClick={() => setOutcome("RADDNING")}>
                  Räddning
                </button>
                <button className={isMiss ? "segon" : ""} onClick={() => setOutcome("MISS")}>
                  Miss
                </button>
              </div>
            </div>

            {/* Vid MÅL/RÄDDNING: visa resten */}
            {!isMiss && (
              <>
                <div className="group">
                  <div className="groupTitle">Avstånd</div>
                  <div className="btnGrid2">
                    <button className={distance === "6m" ? "segon" : ""} onClick={() => setDistance("6m")}>
                      6m
                    </button>
                    <button className={distance === "9m" ? "segon" : ""} onClick={() => setDistance("9m")}>
                      9m
                    </button>
                  </div>
                </div>

                <div className="group">
                  <div className="groupTitle">Bredd</div>
                  <div className="btnGrid3">
                    <button className={zone === 1 ? "segon" : ""} onClick={() => setZone(1)}>
                      Zon 1
                    </button>
                    <button className={zone === 2 ? "segon" : ""} onClick={() => setZone(2)}>
                      Zon 2
                    </button>
                    <button className={zone === 3 ? "segon" : ""} onClick={() => setZone(3)}>
                      Zon 3
                    </button>
                  </div>
                </div>

                <div className="group">
                  <div className="groupTitle">Placering i mål</div>
                  <div className="goalGrid">
                    {([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((k) => (
                      <button
                        key={k}
                        className={`goalCell ${goalZone === k ? "goalOn" : ""}`}
                        onClick={() => setGoalZone(k)}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pass: bara vid MÅL */}
                {isGoal && (
                  <div className="group">
                    <div className="groupTitle">Antal pass innan mål</div>
                    <div className="seg">
                      <button className={passBucket === "<2" ? "segon" : ""} onClick={() => setPassBucket("<2")}>
                        &lt; 2
                      </button>
                      <button className={passBucket === "<4" ? "segon" : ""} onClick={() => setPassBucket("<4")}>
                        &lt; 4
                      </button>
                      <button className={passBucket === "FLER" ? "segon" : ""} onClick={() => setPassBucket("FLER")}>
                        Fler
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <button className="btnPrimary" style={{ width: "100%", marginTop: 12 }} onClick={saveShot}>
            {isMiss ? "Spara miss" : isGoal ? "Spara mål" : "Spara räddning"}
          </button>
        </div>
{/* HÖGER: tre rutor under varandra */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Omställning */}
          <div className="card">
            <h2>Omställning</h2>
            <div className="btnGrid">
              <button onClick={() => addTurnover("Brytning")}>Brytning</button>
              <button onClick={() => addTurnover("Tappad boll")}>Tappad boll</button>
              <button onClick={() => addTurnover("Regelfel")}>Regelfel</button>
              <button onClick={() => addTurnover("Passivt spel")}>Passivt spel</button>
            </div>
          </div>

          {/* Frikast */}
          <div className="card">
            <h2>Frikast</h2>
            <button style={{ width: "100%" }} onClick={addFreeThrow}>
              Registrera frikast
            </button>
          </div>

          {/* Senaste */}
          <div className="card">
            <div className="row between" style={{ gap: 12 }}>
              <h2 style={{ margin: 0 }}>Senaste</h2>
              <button className="btn" onClick={onUndo}>
                Ångra senaste
              </button>
            </div>

            <div className="list listScroll" style={{ marginTop: 10 }}>
              {latest.length === 0 ? (
                <div className="muted">Inga taggar ännu.</div>
              ) : (
                latest.map((e) => {
                  const label =
                    e.type === "SHOT_PLAY"
                      ? `Avslut • ${(e as any).outcome}${
                          (e as any).distance ? ` • ${(e as any).distance}` : ""
                        }${(e as any).zone ? ` • Zon ${(e as any).zone}` : ""}${
                          (e as any).goalZone ? ` • ${(e as any).goalZone}` : ""
                        }`
                      : e.type === "TURNOVER"
                      ? `Omställning • ${(e as any).turnoverType}`
                      : e.type === "SHORT_ATTACK"
                      ? `Pass • ${(e as any).shortType}`
                      : "Frikast";

                  return (
                    <div key={(e as any).id} className="listRow">
                      <div className="listTitle">{label}</div>
                      <div className="muted">
                        {(e as any).period} • {(e as any).ctx} • {(e as any).timeHHMM}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {showKeys && (
        <div className="card" style={{ marginTop: 12 }}>
          <h2>Genvägar</h2>
          <div className="muted" style={{ lineHeight: 1.6 }}>
            <div><strong>H</strong> / <strong>?</strong> = visa/dölj denna</div>
            <div><strong>Enter</strong> = Spara avslut</div>
            <div><strong>Backspace</strong> = Ångra senaste</div>
            <div><strong>1</strong> = H1, <strong>2</strong> = H2</div>
            <div><strong>A</strong> = Anfall, <strong>F</strong> = Försvar</div>
            <div><strong>G</strong> = Mål, <strong>R</strong> = Räddning, <strong>M</strong> = Miss</div>
            <div><strong>6</strong> = 6m, <strong>9</strong> = 9m</div>
            <div><strong>Z</strong>=Zon1, <strong>X</strong>=Zon2, <strong>C</strong>=Zon3</div>
            <div><strong>3–9</strong> = Placering i mål</div>
            <div><strong>P</strong>=&lt;2 pass, <strong>O</strong>=&lt;4 pass, <strong>L</strong>=Fler</div>
            <div><strong>B</strong>=Brytning, <strong>T</strong>=Tappad boll, <strong>E</strong>=Regelfel, <strong>S</strong>=Passivt</div>
            <div><strong>K</strong> = Frikast</div>
          </div>
        </div>
      )}
        </div>
        

  
</div>
      </div>
  );
}
