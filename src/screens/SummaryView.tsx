// src/screens/SummaryView.tsx
import { useEffect, useMemo, useState } from "react";
import type { GoalZone, MatchEvent, TeamContext, TurnoverType } from "../types";
import { listEvents } from "../eventService";
import { computeSummaryPack, filterEventsByScope, type Scope } from "../computeSummary";
import * as matchService from "../matchService";
import { exportToExcel } from "../export/exportToExcel";

function n(v: unknown) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

function btnStyle(active: boolean): React.CSSProperties {
  return active
    ? { fontWeight: 800, borderColor: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.10)" }
    : {};
}

function sumTurnovers(b: Record<TurnoverType, number>) {
  return n(b.Brytning) + n(b["Tappad boll"]) + n(b.Regelfel) + n(b["Passivt spel"]);
}

function aggShots(events: MatchEvent[], ctx: TeamContext) {
  let goals = 0,
    saves = 0,
    misses = 0;

  for (const e of events as any[]) {
    if (e?.type !== "SHOT_PLAY") continue;
    if (e?.ctx !== ctx) continue;
    if (e?.outcome === "MAL") goals++;
    else if (e?.outcome === "RADDNING") saves++;
    else if (e?.outcome === "MISS") misses++;
  }

  const total = goals + saves + misses;
  const efficiency = total ? Math.round((goals / total) * 100) : 0;
  const savePct = goals + saves > 0 ? Math.round((saves / (goals + saves)) * 100) : 0;

  return { goals, saves, misses, total, efficiency, savePct };
}

export default function SummaryView(props: { matchId: string; onBack: () => void; onExit: () => void }) {
  const [events, setEvents] = useState<MatchEvent[] | null>(null);
  const [err, setErr] = useState<string>("");
  const [match, setMatch] = useState<any>(null);

  const [ctx, setCtx] = useState<TeamContext>("ANFALL");
  const [scope, setScope] = useState<Scope>("ALL");

  // ---- load events
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        const ev = await listEvents(props.matchId);
        if (!alive) return;
        setEvents(ev);
      } catch (e) {
        if (!alive) return;
        setErr(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, [props.matchId]);

  // ---- load match meta (för titel)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const ms: any = matchService as any;

        if (typeof ms.getMatch === "function") {
          const m = await ms.getMatch(props.matchId);
          if (!alive) return;
          setMatch(m ?? null);
          return;
        }
        if (typeof ms.getMatchById === "function") {
          const m = await ms.getMatchById(props.matchId);
          if (!alive) return;
          setMatch(m ?? null);
          return;
        }
        if (typeof ms.listMatches === "function") {
          const all = await ms.listMatches();
          const m = Array.isArray(all) ? all.find((x: any) => x?.matchId === props.matchId) : null;
          if (!alive) return;
          setMatch(m ?? null);
          return;
        }

        if (!alive) return;
        setMatch(null);
      } catch {
        if (!alive) return;
        setMatch(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [props.matchId]);

  const scopedEvents = useMemo(() => {
    if (!events) return [];
    return filterEventsByScope(events, scope);
  }, [events, scope]);

  const pack = useMemo(() => computeSummaryPack(scopedEvents), [scopedEvents]);

  // ---- Överblick-beräkningar
  const shots = useMemo(() => aggShots(scopedEvents, ctx), [scopedEvents, ctx]);
  const turnoverBlock = pack.turnovers[ctx];
  const omstTotal = sumTurnovers(turnoverBlock);
  const attacksFromModel = shots.total + omstTotal;

  const pctShotsPerAttack = pct(shots.total, attacksFromModel);
  const pctGoalsPerAttack = pct(shots.goals, attacksFromModel);
  const pctOmstPerAttack = pct(omstTotal, attacksFromModel);

  const freeThrows = n(pack.freeThrows[ctx]);

  // ---- Pass innan mål
  const pass2 = n(pack.shortAttacks[ctx]["<2"]);
  const pass4 = n(pack.shortAttacks[ctx]["<4"]);
  const passMore = n(pack.shortAttacks[ctx]["FLER"]);
  const passTotal = pass2 + pass4 + passMore;

  // ---- Avslut tabell (mål + räddning per zon/avstånd)
  type Zone = 1 | 2 | 3;
  type Distance = "6m" | "9m";
  const cell = (z: Zone, d: Distance, o: "MAL" | "RADDNING") => n(pack.shotsPlay[ctx][z][d][o]);
  const rows = ([1, 2, 3] as Zone[]).map((z) => ({
    z,
    g6: cell(z, "6m", "MAL"),
    s6: cell(z, "6m", "RADDNING"),
    g9: cell(z, "9m", "MAL"),
    s9: cell(z, "9m", "RADDNING"),
  }));
  const sum = rows.reduce(
    (a, r) => ({ g6: a.g6 + r.g6, s6: a.s6 + r.s6, g9: a.g9 + r.g9, s9: a.s9 + r.s9 }),
    { g6: 0, s6: 0, g9: 0, s9: 0 }
  );

  const sumRowStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    fontWeight: 800,
  };

  const heatKeys: GoalZone[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // ---- UI header text
  const title =
    match?.homeTeam && match?.awayTeam ? `${match.homeTeam} – ${match.awayTeam}` : "Summering";
  const subline = match?.dateISO
    ? `${match.dateISO}${match?.venue ? ` • ${match.venue}` : ""}`
    : `MatchId: ${props.matchId}`;

  const onExport = async () => {
    try {
      setErr("");
      await exportToExcel(props.matchId);
    } catch (e) {
      setErr(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
    }
  };

  if (err) {
    return (
      <div className="page">
        <h1>Summering – fel</h1>
        <div className="card">
          <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre>
        </div>
        <div className="row gap wrap">
          <button className="btn" onClick={props.onBack}>
            Tillbaka
          </button>
          <button className="btn" onClick={props.onExit}>
            Avsluta
          </button>
          <button className="btn" onClick={onExport}>
            Exportera till Excel
          </button>
        </div>
      </div>
    );
  }

  if (!events) {
    return (
      <div className="page">
        <h1>Summering – laddar…</h1>
        <div className="muted">{props.matchId}</div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="card" style={{ marginTop: 0 }}>
        <div className="row between wrap" style={{ gap: 12 }}>
          <div>
            <h1 style={{ marginBottom: 6 }}>{title}</h1>
            <div className="muted">{subline}</div>
          </div>
          <div className="row gap wrap">
            <button className="btn" onClick={props.onBack}>
              Tillbaka
            </button>
            <button className="btn" onClick={props.onExit}>
              Avsluta
            </button>
            <button className="btn" onClick={onExport}>
              Exportera till Excel
            </button>
          </div>
        </div>

        {/* Toggles */}
        <div className="row between wrap" style={{ marginTop: 12, gap: 12 }}>
          <div className="row gap wrap">
            <div className="row gap wrap">
              <button className="btn" style={btnStyle(ctx === "ANFALL")} onClick={() => setCtx("ANFALL")}>
                Anfall
              </button>
              <button className="btn" style={btnStyle(ctx === "FORSVAR")} onClick={() => setCtx("FORSVAR")}>
                Försvar
              </button>
            </div>

            <div className="row gap wrap">
              <button className="btn" style={btnStyle(scope === "ALL")} onClick={() => setScope("ALL")}>
                ALL
              </button>
              <button className="btn" style={btnStyle(scope === "H1")} onClick={() => setScope("H1")}>
                H1
              </button>
              <button className="btn" style={btnStyle(scope === "H2")} onClick={() => setScope("H2")}>
                H2
              </button>
            </div>
          </div>

          <div className="pill">
            <span className="muted">Visar</span> <strong>{ctx === "ANFALL" ? "Anfall" : "Försvar"}</strong>
            <span className="muted"> • </span>
            <strong>{scope}</strong>
          </div>
        </div>
      </div>

      {/* Överblick */}
      <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0 }}>Överblick</h2>

        <div className="kpirow" style={{ alignItems: "stretch" }}>
          <div className="kpi">
            <div className="kpiLabel">Anfall</div>
            <div className="kpiValue">{attacksFromModel}</div>
          </div>

          <div className="kpi">
            <div className="kpiLabel">Avslut</div>
            <div className="kpiValue">{shots.total}</div>
            <div className="muted">Avslut/anfall: {pctShotsPerAttack} %</div>
          </div>

          <div className="kpi">
            <div className="kpiLabel">{ctx === "ANFALL" ? "Mål" : "Insläppta mål"}</div>
            <div className="kpiValue">{shots.goals}</div>
            <div className="muted">{ctx === "ANFALL" ? "Mål/anfall" : "Mål emot/anfall"}: {pctGoalsPerAttack} %</div>
          </div>

          <div className="kpi">
            <div className="kpiLabel">Effektivitet</div>
            <div className="kpiValue">{shots.efficiency} %</div>
          </div>

          <div className="kpi">
            <div className="kpiLabel">Räddningar</div>
            <div className="kpiValue">{shots.saves}</div>
            <div className="muted">Räddnings%: {shots.savePct} %</div>
          </div>

          <div className="kpi">
            <div className="kpiLabel">Omställning</div>
            <div className="kpiValue">{omstTotal}</div>
            <div className="muted">Omst/anfall: {pctOmstPerAttack} %</div>
          </div>
        </div>

        <div className="muted" style={{ marginTop: 8 }}>
          Miss: {shots.misses} • Frikast: {freeThrows}
        </div>
      </div>

      {/* Avslut + Placering */}
      <div className="grid2" style={{ marginTop: 12 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Avslut</h2>
          <table className="tbl">
            <thead>
              <tr>
                <th>Zon</th>
                <th>6m Mål</th>
                <th>6m Räddn.</th>
                <th>9m Mål</th>
                <th>9m Räddn.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.z}>
                  <td>{r.z}</td>
                  <td>{r.g6}</td>
                  <td>{r.s6}</td>
                  <td>{r.g9}</td>
                  <td>{r.s9}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={sumRowStyle}>
                <th style={sumRowStyle}>SUMMA</th>
                <th style={sumRowStyle}>{sum.g6}</th>
                <th style={sumRowStyle}>{sum.s6}</th>
                <th style={sumRowStyle}>{sum.g9}</th>
                <th style={sumRowStyle}>{sum.s9}</th>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Placering i mål</h2>
          <div className="heat">
            {heatKeys.map((k) => (
              <div key={k} className="heatBox">
                <div className="heatNum">{n(pack.heatmap[ctx][k])}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pass + Omställning */}
      <div className="grid2" style={{ marginTop: 12 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Antal pass innan mål</h2>
          <table className="tbl">
            <tbody>
              <tr>
                <th>&lt; 2 pass</th>
                <td>{pass2}</td>
              </tr>
              <tr>
                <th>&lt; 4 pass</th>
                <td>{pass4}</td>
              </tr>
              <tr>
                <th>Fler pass</th>
                <td>{passMore}</td>
              </tr>
              <tr style={sumRowStyle}>
                <th style={sumRowStyle}>SUMMA</th>
                <td style={sumRowStyle}>{passTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Omställning</h2>
          <table className="tbl">
            <tbody>
              <tr>
                <th>Brytning</th>
                <td>{n(turnoverBlock.Brytning)}</td>
              </tr>
              <tr>
                <th>Tappad boll</th>
                <td>{n(turnoverBlock["Tappad boll"])}</td>
              </tr>
              <tr>
                <th>Regelfel</th>
                <td>{n(turnoverBlock.Regelfel)}</td>
              </tr>
              <tr>
                <th>Passivt spel</th>
                <td>{n(turnoverBlock["Passivt spel"])}</td>
              </tr>
              <tr style={sumRowStyle}>
                <th style={sumRowStyle}>SUMMA</th>
                <td style={sumRowStyle}>{omstTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
