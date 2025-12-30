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

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function nowHHMM() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function LiveTagging(props: {
  matchId: string;
  onSummary: () => void;
  onExit: () => void;
}) {
  const [ctx, setCtx] = useState<TeamContext>("ANFALL");
  const [period, setPeriod] = useState<Period>("H1");

  // Shot toggles
  const [zone, setZone] = useState<ShotZone>(2);
  const [distance, setDistance] = useState<ShotDistance>("9m");
  const [outcome, setOutcome] = useState<ShotOutcome>("MAL");

  // Placering i mål (GoalZone 1..9) – används ej vid MISS
  const [goalZone, setGoalZone] = useState<GoalZone>(5);

  // Antal pass innan mål (PassBucket) – används bara vid MAL
  const [shortType, setShortType] = useState<PassBucket>("<4");

  const [events, setEvents] = useState<MatchEvent[]>([]);

  const refresh = async () => {
    setEvents(await listEvents(props.matchId));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.matchId]);

  const latest = useMemo(() => [...events].slice(-8).reverse(), [events]);

  const push = async (ev: MatchEvent) => {
    await addEvent(props.matchId, ev);
    await refresh();
  };

  const onUndo = async () => {
    await deleteLastEvent(props.matchId);
    await refresh();
  };

  const addShot = async () => {
    await push({
      id: `${Date.now()}-${uid()}`,
      matchId: props.matchId,
      ts: Date.now(),
      timeHHMM: nowHHMM(),
      period,
      ctx,
      type: "SHOT_PLAY",
      zone,
      distance,
      outcome,
      goalZone: outcome === "MISS" ? undefined : goalZone,
    });

    // Spara "antal pass innan mål" som separat event endast vid MAL
    if (outcome === "MAL") {
      await push({
        id: `${Date.now()}-${uid()}`,
        matchId: props.matchId,
        ts: Date.now(),
        timeHHMM: nowHHMM(),
        period,
        ctx,
        type: "SHORT_ATTACK",
        shortType,
      });
    }
  };

  const addTurnover = async (turnoverType: TurnoverType) => {
    await push({
      id: `${Date.now()}-${uid()}`,
      matchId: props.matchId,
      ts: Date.now(),
      timeHHMM: nowHHMM(),
      period,
      ctx,
      type: "TURNOVER",
      turnoverType,
    });
  };

  const addFreeThrow = async () => {
    await push({
      id: `${Date.now()}-${uid()}`,
      matchId: props.matchId,
      ts: Date.now(),
      timeHHMM: nowHHMM(),
      period,
      ctx,
      type: "FREE_THROW",
    });
  };

  const title = ctx === "ANFALL" ? "Anfall" : "Försvar";

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <h1>Handball</h1>
          <div className="muted">Match: {props.matchId}</div>
        </div>
        <div className="row gap wrap">
          <button className="btn" onClick={props.onSummary}>
            Summering
          </button>
          <button className="btn" onClick={props.onExit}>
            Avsluta
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="row between wrap">
          <h2>{title}</h2>
          <div className="row gap wrap">
            <button className="btn" onClick={onUndo}>
              Ångra
            </button>
          </div>
        </div>

        <div className="row between wrap" style={{ marginTop: 10 }}>
          <div className="row gap wrap">
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

          <div className="pill">
            <span className="muted">Läge</span> <strong>{period}</strong> <span className="muted">•</span>{" "}
            <strong>{ctx === "ANFALL" ? "Anfall" : "Försvar"}</strong>
          </div>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 12 }}>
        <div className="card">
          <h2>Avslut</h2>

          <div className="subGrid">
            <div className="group">
              <div className="groupTitle">Avstånd</div>
              <div className="seg">
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
              <div className="seg">
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
              <div className="groupTitle">Resultat</div>
              <div className="seg">
                <button className={outcome === "MAL" ? "segon" : ""} onClick={() => setOutcome("MAL")}>
                  Mål
                </button>
                <button className={outcome === "RADDNING" ? "segon" : ""} onClick={() => setOutcome("RADDNING")}>
                  Räddning
                </button>
                <button className={outcome === "MISS" ? "segon" : ""} onClick={() => setOutcome("MISS")}>
                  Miss
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
                    disabled={outcome === "MISS"}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="group">
              <div className="groupTitle">Antal pass innan mål</div>
              <div className="seg">
                <button className={shortType === "<2" ? "segon" : ""} onClick={() => setShortType("<2")} disabled={outcome !== "MAL"}>
                  &lt; 2
                </button>
                <button className={shortType === "<4" ? "segon" : ""} onClick={() => setShortType("<4")} disabled={outcome !== "MAL"}>
                  &lt; 4
                </button>
                <button className={shortType === "FLER" ? "segon" : ""} onClick={() => setShortType("FLER")} disabled={outcome !== "MAL"}>
                  Fler
                </button>
              </div>
            </div>
          </div>

          <button className="btnPrimary" style={{ width: "100%", marginTop: 12 }} onClick={addShot}>
            Spara avslut
          </button>
        </div>

        <div className="card">
          <h2>Omställning</h2>
          <div className="btnGrid">
            <button className="btn" onClick={() => addTurnover("Brytning")}>
              Brytning
            </button>
            <button className="btn" onClick={() => addTurnover("Tappad boll")}>
              Tappad boll
            </button>
            <button className="btn" onClick={() => addTurnover("Regelfel")}>
              Regelfel
            </button>
            <button className="btn" onClick={() => addTurnover("Passivt spel")}>
              Passivt spel
            </button>
          </div>

          <div style={{ height: 10 }} />

          <h2>Frikast</h2>
          <button className="btn" style={{ width: "100%" }} onClick={addFreeThrow}>
            Registrera frikast
          </button>

          <div style={{ height: 14 }} />

          <h2>Senaste taggar</h2>
          <div className="list">
            {latest.length === 0 ? (
              <div className="muted">Inga taggar ännu.</div>
            ) : (
              latest.map((e) => {
                const label =
                  e.type === "SHOT_PLAY"
                    ? `Avslut • ${e.distance} • Zon ${e.zone} • ${e.outcome}${(e as any).goalZone ? ` • ${(e as any).goalZone}` : ""}`
                    : e.type === "SHORT_ATTACK"
                    ? `Pass innan mål • ${e.shortType}`
                    : e.type === "TURNOVER"
                    ? `Omställning • ${e.turnoverType}`
                    : "Frikast";

                return (
                  <div key={e.id} className="listRow">
                    <div className="listTitle">{label}</div>
                    <div className="muted">
                      {e.period} • {e.ctx} • {e.timeHHMM}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
