import { useEffect, useState } from "react";
import type { Period, Zone, Distance, GoalZone, TeamContext, Outcome, TurnoverType } from "../types";
import { addEvent, listRecent, undoLast, getMatch } from "../eventService";
import { useWakeLock } from "../useWakeLock";

type Flow =
  | { step: "HOME" }
  | { step: "SHOT_PICK" }
  | { step: "DIST"; kind: "GOAL" | "SAVE" }
  | { step: "ZONE"; kind: "GOAL" | "SAVE"; distance: Distance }
  | { step: "PLACEMENT"; kind: "GOAL" | "SAVE"; distance: Distance; zone: Zone }
  | { step: "SHORT_AFTER_GOAL"; distance: Distance; zone: Zone; goalZone: GoalZone };

type RecentRow = {
  ts: number;
  period: Period;
  ctx: TeamContext;
  title: string;
  detail?: string;
};

const OMSTALLNING: TurnoverType[] = ["Brytning", "Tappad boll", "Regelfel", "Passivt spel"];

function vibrate(ms = 15) {
  try {
    navigator.vibrate?.(ms);
  } catch {}
}

function fmt(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function groupRecent(items: any[], limit = 8): RecentRow[] {
  // items antas vara sorterade nyast först (listRecent ger dig det)
  const out: RecentRow[] = [];
  let i = 0;

  while (i < items.length && out.length < limit) {
    const e = items[i];

    // 1) Omställning (TURNOVER) = ett kort
    if (e.type === "TURNOVER") {
      out.push({
        ts: e.ts,
        period: e.period,
        ctx: e.ctx,
        title: "Omställning",
        detail: e.turnoverType ?? ""
      });
      i += 1;
      continue;
    }

    // 2) Miss = ett kort (ingen meta)
    if (e.type === "SHOT_PLAY" && e.outcome === "MISS") {
      out.push({
        ts: e.ts,
        period: e.period,
        ctx: e.ctx,
        title: "Avslut – Miss",
        detail: ""
      });
      i += 1;
      continue;
    }

    // 3) Räddning = ett kort (har meta + ev placement)
    if (e.type === "SHOT_PLAY" && e.outcome === "RADDNING") {
      const d = e.distance ? `${e.distance}` : "";
      const z = e.zone ? `z${e.zone}` : "";
      // titta om nästa event är GOAL_PLACEMENT nära i tid
      const next = items[i + 1];
      const placement =
        next && next.type === "GOAL_PLACEMENT" && Math.abs(next.ts - e.ts) < 2500 ? ` • p${next.goalZone}` : "";
      out.push({
        ts: e.ts,
        period: e.period,
        ctx: e.ctx,
        title: "Avslut – Räddning",
        detail: [d, z].filter(Boolean).join(" ") + placement
      });
      i += placement ? 2 : 1;
      continue;
    }

    // 4) Mål = ett kort (mål registreras sist efter pass → kan komma nära SHORT/PLACEMENT)
    // Vi hanterar tre möjliga "startpunkter" i listan:
    // - senaste event kan vara SHORT_ATTACK (då är det ett målflöde)
    // - eller GOAL_PLACEMENT
    // - eller SHOT_PLAY(MAL)
    if (e.type === "SHORT_ATTACK" || e.type === "GOAL_PLACEMENT" || (e.type === "SHOT_PLAY" && e.outcome === "MAL")) {
      // Samla ett “cluster” bakåt inom 3 sek från första eventet
      const baseTs = e.ts;
      const cluster: any[] = [e];
      let j = i + 1;
      while (j < items.length) {
        const ej = items[j];
        if (Math.abs(baseTs - ej.ts) > 3000) break;
        // bara relevanta mål-delar
        if (ej.type === "SHORT_ATTACK" || ej.type === "GOAL_PLACEMENT" || (ej.type === "SHOT_PLAY" && ej.outcome === "MAL")) {
          cluster.push(ej);
          j += 1;
          continue;
        }
        break;
      }

      // hitta SHOT_PLAY(MAL), placement och shortType i cluster
      const shot = cluster.find(x => x.type === "SHOT_PLAY" && x.outcome === "MAL");
      const place = cluster.find(x => x.type === "GOAL_PLACEMENT");
      const short = cluster.find(x => x.type === "SHORT_ATTACK");

      const d = shot?.distance ? `${shot.distance}` : "";
      const z = shot?.zone ? `z${shot.zone}` : "";
      const p = place?.goalZone ? `p${place.goalZone}` : "";
      const pass =
        short?.shortType === "<2" ? "<2 pass" : short?.shortType === "<4" ? "<4 pass" : short?.shortType === "FLER" ? "Fler pass" : "";

      out.push({
        ts: baseTs,
        period: e.period,
        ctx: e.ctx,
        title: "Avslut – Mål",
        detail: [d, z, p, pass].filter(Boolean).join(" • ")
      });

      i = j;
      continue;
    }

    // 5) Frikast = ett kort
    if (e.type === "FREE_THROW") {
      out.push({
        ts: e.ts,
        period: e.period,
        ctx: e.ctx,
        title: "Frikast",
        detail: "+1"
      });
      i += 1;
      continue;
    }

    // 6) Fallback: hoppa över TOTAL_ATTACK och annat
    i += 1;
  }

  return out;
}

export default function LiveTagging(props: {
  matchId: string;
  onSummary: () => void;
  onExit: () => void;
}) {
  useWakeLock(true);

  const [period, setPeriod] = useState<Period>(1);
  const [ctx, setCtx] = useState<TeamContext>("ANFALL");
  const [matchTitle, setMatchTitle] = useState("");
  const [recent, setRecent] = useState<RecentRow[]>([]);
  const [toast, setToast] = useState("");
  const [flow, setFlow] = useState<Flow>({ step: "HOME" });

  useEffect(() => {
    getMatch(props.matchId).then(m => setMatchTitle(m?.title ?? ""));
    refreshRecent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.matchId]);

  function flash(msg: string) {
    setToast(msg);
    window.clearTimeout((flash as any)._t);
    (flash as any)._t = window.setTimeout(() => setToast(""), 900);
  }

  async function refreshRecent() {
  // hämta lite fler så grouping hinner få med målklustret
  const items = await listRecent(props.matchId, 30);
  setRecent(groupRecent(items, 10));
}

  async function addAttack() {
    await addEvent({ matchId: props.matchId, period, ctx, type: "TOTAL_ATTACK", delta: 1 });
  }

  async function tagFreeThrow() {
    vibrate();
    await addEvent({ matchId: props.matchId, period, ctx, type: "FREE_THROW", delta: 1 });
    flash("Frikast +1");
    refreshRecent();
  }

  async function tagOmstallning(t: TurnoverType) {
    vibrate();
    await addAttack();
    await addEvent({ matchId: props.matchId, period, ctx, type: "TURNOVER", turnoverType: t });
    flash(t);
    setFlow({ step: "HOME" });
    refreshRecent();
  }

  async function onAngra() {
    vibrate(10);
    await undoLast(props.matchId);
    flash("Ångrat");
    refreshRecent();
  }

  function backOneStep() {
    vibrate(10);
    setFlow(prev => {
      switch (prev.step) {
        case "HOME":
          return prev;
        case "SHOT_PICK":
          return { step: "HOME" };
        case "DIST":
          return { step: "SHOT_PICK" };
        case "ZONE":
          return { step: "DIST", kind: prev.kind };
        case "PLACEMENT":
          return { step: "ZONE", kind: prev.kind, distance: prev.distance };
        case "SHORT_AFTER_GOAL":
  return { step: "PLACEMENT", kind: "GOAL", distance: prev.distance, zone: prev.zone };
        default:
          return { step: "HOME" };
      }
    });
  }

  function startShot() {
    vibrate(10);
    setFlow({ step: "SHOT_PICK" });
  }

  async function tagMissInstant() {
    vibrate();
    await addAttack();
    await addEvent({ matchId: props.matchId, period, ctx, type: "SHOT_PLAY", outcome: "MISS" as Outcome });
    flash("Miss");
    setFlow({ step: "HOME" });
    refreshRecent();
  }

  function pickDistance(kind: "GOAL" | "SAVE", d: Distance) {
    vibrate(10);
    setFlow({ step: "ZONE", kind, distance: d });
  }

  function pickZone(kind: "GOAL" | "SAVE", d: Distance, z: Zone) {
    vibrate(10);
    setFlow({ step: "PLACEMENT", kind, distance: d, zone: z });
  }

  async function finishShot(kind: "GOAL" | "SAVE", d: Distance, z: Zone, gz: GoalZone) {
  // RÄDDNING: registrera direkt som tidigare
  if (kind === "SAVE") {
    await addAttack();
    await addEvent({
      matchId: props.matchId,
      period,
      ctx,
      type: "SHOT_PLAY",
      distance: d,
      zone: z,
      outcome: "RADDNING" as Outcome
    });
    await new Promise(r => setTimeout(r, 1));
    await addEvent({ matchId: props.matchId, period, ctx, type: "GOAL_PLACEMENT", goalZone: gz });

    flash("Räddning");
    refreshRecent();
    setFlow({ step: "HOME" });
    return;
  }

  // MÅL: SPARA VALEN MEN REGISTRERA INGET ÄN
  // Först efter pass-valet registreras TOTAL_ATTACK + SHOT_PLAY(MAL) + GOAL_PLACEMENT + SHORT_ATTACK
  flash("Välj pass");
  setFlow({ step: "SHORT_AFTER_GOAL", distance: d, zone: z, goalZone: gz });
}

  async function tagShort(shortType: "<2" | "<4" | "FLER") {
  vibrate();

  // Om vi kommer från MÅL-flödet: registrera målet NU (sist i processen)
  if (flow.step === "SHORT_AFTER_GOAL") {
    const { distance, zone, goalZone } = flow;

    await addAttack();

    await addEvent({
      matchId: props.matchId,
      period,
      ctx,
      type: "SHOT_PLAY",
      distance,
      zone,
      outcome: "MAL" as Outcome
    });

    await new Promise(r => setTimeout(r, 1));
    await addEvent({
      matchId: props.matchId,
      period,
      ctx,
      type: "GOAL_PLACEMENT",
      goalZone
    });

    await new Promise(r => setTimeout(r, 1));
    await addEvent({
      matchId: props.matchId,
      period,
      ctx,
      type: "SHORT_ATTACK",
      shortType
    });

    flash(shortType === "FLER" ? "Fler pass" : shortType === "<2" ? "< 2 pass" : "< 4 pass");
    setFlow({ step: "HOME" });
    refreshRecent();
    return;
  }

  // Fallback (om shortType triggas utanför målflödet)
  await addEvent({ matchId: props.matchId, period, ctx, type: "SHORT_ATTACK", shortType });
  flash(shortType === "FLER" ? "Fler pass" : shortType === "<2" ? "< 2 pass" : "< 4 pass");
  setFlow({ step: "HOME" });
  refreshRecent();
}

  return (
    <div className="page">
      <div className="matchTitleOnly">{matchTitle}</div>

      <div className="card">
        <div className="row between wrap">
          <div className="row gap wrap">
            <div className="seg">
              <span className="seglabel">Halvlek</span>
              <button className={period === 1 ? "segon" : ""} onClick={() => setPeriod(1)}>
                H1
              </button>
              <button className={period === 2 ? "segon" : ""} onClick={() => setPeriod(2)}>
                H2
              </button>
            </div>

            <div className="seg">
              <button className={ctx === "ANFALL" ? "segon" : ""} onClick={() => setCtx("ANFALL")}>
                Anfall
              </button>
              <button className={ctx === "FORSVAR" ? "segon" : ""} onClick={() => setCtx("FORSVAR")}>
                Försvar
              </button>
            </div>

            <button className="danger" onClick={onAngra}>
              Ångra
            </button>
          </div>

          <div className="row gap wrap">
            <button onClick={props.onSummary}>Summering</button>
            <button onClick={props.onExit}>Avsluta</button>
          </div>
        </div>

        {toast && <div className="toast">{toast}</div>}
      </div>

      <div className="mainGrid">
        <div className="leftCol">
          <div className="card cardFinish">
            <div className="row between wrap">
              <h2 className="cardTitleCenter">Avslut</h2>
              {flow.step !== "HOME" && (
                <button className="subtle" onClick={backOneStep}>
                  Backa
                </button>
              )}
            </div>

            {flow.step === "HOME" && (
              <div className="row gap wrap top centerRow">
                <button className="big btnShotPrimary" onClick={startShot}>
                  Skott
                </button>
                <button className="big btnFreeThrow" onClick={tagFreeThrow}>
                  Frikast
                </button>
              </div>
            )}

            {flow.step === "SHOT_PICK" && (
              <div className="row gap wrap top centerRow">
                <button className="big btnGoal" onClick={() => setFlow({ step: "DIST", kind: "GOAL" })}>
                  Mål
                </button>
                <button className="big btnSaveYellow" onClick={() => setFlow({ step: "DIST", kind: "SAVE" })}>
                  Räddning
                </button>
                <button className="big btnMiss" onClick={tagMissInstant}>
                  Miss
                </button>
              </div>
            )}

            {flow.step === "DIST" && (
              <div className="row gap wrap top centerRow">
                <button className="big btnDist6" onClick={() => pickDistance(flow.kind, "6m")}>
                  6 m
                </button>
                <button className="big btnDist9" onClick={() => pickDistance(flow.kind, "9m")}>
                  9 m
                </button>
              </div>
            )}

            {flow.step === "ZONE" && (
              <div className="row gap wrap top centerRow">
                <button className="big btnZone1" onClick={() => pickZone(flow.kind, flow.distance, 1)}>
                  Zon 1
                </button>
                <button className="big btnZone2" onClick={() => pickZone(flow.kind, flow.distance, 2)}>
                  Zon 2
                </button>
                <button className="big btnZone3" onClick={() => pickZone(flow.kind, flow.distance, 3)}>
                  Zon 3
                </button>
              </div>
            )}

            {flow.step === "PLACEMENT" && (
              <div className="placementWrapper">
                <div className="placementGrid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(nr => (
                    <button
                      key={nr}
                      className="placementCell"
                      onClick={() => finishShot(flow.kind, flow.distance, flow.zone, nr as GoalZone)}
                    >
                      {nr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {flow.step === "SHORT_AFTER_GOAL" && (
              <>
                <div className="top muted">Antal pass innan mål</div>
                <div className="row gap wrap top centerRow">
                  <button className="big btnPass2" onClick={() => tagShort("<2")}>
                    {"< 2 pass"}
                  </button>
                  <button className="big btnPass4" onClick={() => tagShort("<4")}>
                    {"< 4 pass"}
                  </button>
                  <button className="big btnPassMore" onClick={() => tagShort("FLER")}>
                    Fler pass
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="card cardTech">
            <h2 className="cardTitleCenter">Omställning</h2>
            <div className="chips techGrid">
              {OMSTALLNING.map(t => (
                <button key={t} className="chip" onClick={() => tagOmstallning(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rightCol">
          <div className="card">
            <h2>Senaste</h2>
            {recent.length === 0 ? (
              <div className="muted">Inga events än.</div>
            ) : (
              <div className="recent2">
  {recent.map((r, i) => (
    <div key={i} className="recentRow">
      <div className="recentTime">{fmt(r.ts)}</div>
      <div className="recentMeta">
        <span className="pill">H{r.period}</span>
        <span className="pill">{r.ctx}</span>
        <span className="pill subtle">{r.title}{r.detail ? ` • ${r.detail}` : ""}</span>
      </div>
    </div>
  ))}
</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}