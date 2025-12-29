import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { DebugOverlay } from "../DebugOverlay";
import { exportToExcel } from "../export/exportToExcel";
import { listEvents } from "../eventService";
import { computeSummaryPack, filterEventsByScope } from "../computeSummary";
import type { MatchEvent, TeamContext } from "../types";
import type { Scope } from "../computeSummary";

type Zone = 1 | 2 | 3;
type Distance = "6m" | "9m";

function n(v: unknown) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}
function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}
function aggShots(events: MatchEvent[], ctx: TeamContext) {
  let goals = 0,
    saves = 0,
    misses = 0;

  for (const e of events) {
    if (e.ctx !== ctx) continue;
    if (e.type !== "SHOT_PLAY") continue;

    // outcome kan ligga som e.outcome eller (e as any).outcome beroende på din typ
    const outcome = (e as any).outcome ?? (e as any).result ?? "";
    if (outcome === "MAL") goals++;
    else if (outcome === "RADDNING") saves++;
    else if (outcome === "MISS") misses++;
  }

  const total = goals + saves + misses;
  const efficiency = total ? Math.round((goals / total) * 100) : 0;
  const savePct = goals + saves > 0 ? Math.round((saves / (goals + saves)) * 100) : 0;
  return { goals, saves, misses, total, efficiency, savePct };
}
function aggOmst(pack: ReturnType<typeof computeSummaryPack>, ctx: TeamContext) {
  const b = pack.turnovers[ctx];
  const total =
    n((b as any).Brytning) + n((b as any)["Tappad boll"]) + n((b as any).Regelfel) + n((b as any)["Passivt spel"]);
  return { b, total };
}

function OverviewCard(props: {
  title: string;
  pack: ReturnType<typeof computeSummaryPack>;
  events: MatchEvent[];
  ctx: TeamContext;
}) {
  const { title, pack, events, ctx } = props;
  const shots = aggShots(events, ctx);
  const omst = aggOmst(pack, ctx);

  const attacks = shots.total + omst.total;
  const pctShotsPerAttack = pct(shots.total, attacks);
  const pctGoalsPerAttack = pct(shots.goals, attacks);
  const pctOmstPerAttack = pct(omst.total, attacks);
  const freeThrows = n((pack as any).freeThrows?.[ctx]);

  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="kpirow" style={{ alignItems: "stretch" }}>
        <div className="kpi" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="kpiLabel">Anfall</div>
          <div className="kpiValue">{attacks}</div>
        </div>

        <div className="kpi" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="kpiLabel">Avslut</div>
          <div className="kpiValue">{shots.total}</div>
          <div className="muted">Avslut per anfall: {pctShotsPerAttack} %</div>
        </div>

        <div className="kpi" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="kpiLabel">{ctx === "ANFALL" ? "Mål" : "Insläppta mål"}</div>
          <div className="kpiValue">{shots.goals}</div>
          <div className="muted">
            {ctx === "ANFALL" ? "Mål per anfall" : "Insläppta mål per anfall"}: {pctGoalsPerAttack} %
          </div>
        </div>

        <div className="kpi" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="kpiLabel">Effektivitet</div>
          <div className="kpiValue">{shots.efficiency} %</div>
        </div>

        <div className="kpi" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="kpiLabel">Räddningar</div>
          <div className="kpiValue">{shots.saves}</div>
        </div>

        <div className="kpi" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="kpiLabel">Räddningsprocent</div>
          <div className="kpiValue">{shots.savePct} %</div>
        </div>

        <div className="kpi" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="kpiLabel">Omställning</div>
          <div className="kpiValue">{omst.total}</div>
          <div className="muted">Omställning per anfall: {pctOmstPerAttack} %</div>
        </div>
      </div>

      <div className="muted">Miss: {shots.misses} • Frikast: {freeThrows}</div>
    </div>
  );
}

export default function SummaryView(props: { matchId: string; onBack: () => void; onExit: () => void }) {
  const [events, setEvents] = useState<MatchEvent[] | null>(null);
  const [err, setErr] = useState<string>("");
  const [ctx, setCtx] = useState<TeamContext>("ANFALL");
  const [scope, setScope] = useState<Scope>("ALL");
  const [compare, setCompare] = useState(false);

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

  const scopedEvents = useMemo(() => {
    if (!events) return [];
    return filterEventsByScope(events, scope);
  }, [events, scope]);

  const packScoped = useMemo(() => computeSummaryPack(scopedEvents), [scopedEvents]);

  const p1Events = useMemo(() => (!events ? [] : filterEventsByScope(events, "P1")), [events]);
  const p2Events = useMemo(() => (!events ? [] : filterEventsByScope(events, "P2")), [events]);

  const packP1 = useMemo(() => (!events ? null : computeSummaryPack(p1Events)), [events, p1Events]);
  const packP2 = useMemo(() => (!events ? null : computeSummaryPack(p2Events)), [events, p2Events]);

  const labelCtx = ctx === "ANFALL" ? "Anfall" : "Försvar";

  const shots = useMemo(() => aggShots(scopedEvents, ctx), [scopedEvents, ctx]);
  const omst = useMemo(() => aggOmst(packScoped, ctx), [packScoped, ctx]);
  const attacksFromModel = shots.total + omst.total;

  const pctShotsPerAttack = pct(shots.total, attacksFromModel);
  const pctGoalsPerAttack = pct(shots.goals, attacksFromModel);
  const pctOmstPerAttack = pct(omst.total, attacksFromModel);

  const freeThrows = n((packScoped as any).freeThrows?.[ctx]);
  const pass2 = n((packScoped as any).shortAttacks?.[ctx]?.["<2"]);
  const pass4 = n((packScoped as any).shortAttacks?.[ctx]?.["<4"]);
  const passMore = n((packScoped as any).shortAttacks?.[ctx]?.["FLER"]);
  const passTotal = pass2 + pass4 + passMore;

  const cell = (z: Zone, d: Distance, o: "MAL" | "RADDNING") =>
    n((packScoped as any).shotsPlay?.[ctx]?.[z]?.[d]?.[o]);

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

  const sumRowStyle: CSSProperties = {
    background: "#0b1428",
    color: "#c7d2fe",
    fontWeight: 800,
  };

  const tagEventsForExport = useMemo(
    () =>
      scopedEvents.map((e) => ({
        time: String((e as any).time ?? (e as any).timestamp ?? ""),
        phase: String((e as any).phase ?? e.ctx ?? scope),
        action: String(e.type),
        result: String((e as any).outcome ?? (e as any).result ?? ""),
        scope: String(scope),
        ctx: String(ctx),
      })),
    [scopedEvents, scope, ctx]
  );

  const onExport = async () => {
    try {
      await exportToExcel({
        sheetName: `${ctx === "ANFALL" ? "Anfall" : "Försvar"} ${scope === "P1" ? "H1" : scope === "P2" ? "H2" : "ALL"}`,
        matchId: props.matchId,
        metrics: {
          attacks: attacksFromModel,
          shots: shots.total,
          goals: shots.goals,
          misses: shots.misses,
          freeThrows,
          turnovers: omst.total,
          saves: shots.saves,
          efficiencyPct: shots.efficiency,
          savePct: shots.savePct,
          shotsPerAttackPct: pctShotsPerAttack,
          goalsPerAttackPct: pctGoalsPerAttack,
          turnoversPerAttackPct: pctOmstPerAttack,
        },
        tagEvents: tagEventsForExport,
      });
    } catch (e) {
      setErr(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
    }
  };

  if (err) {
    return (
      <div className="page">
        <DebugOverlay />
        <h1>Summering – fel</h1>
        <div className="card">
          <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre>
        </div>
        <div className="row gap">
          <button onClick={props.onBack}>Tillbaka</button>
          <button onClick={props.onExit}>Avsluta</button>
        </div>
      </div>
    );
  }

  if (!events) {
    return (
      <div className="page">
        <DebugOverlay />
        <h1>Summering – laddar…</h1>
        <div className="muted">matchId: {props.matchId}</div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* ✅ RÄTT PLATS: DebugOverlay ligger INNE i returnen */}
      <DebugOverlay />

      <h1>Summering – {labelCtx}</h1>

      <div className="muted" style={{ marginTop: -6, marginBottom: 12 }}>
        Version: <strong>HB-SUM-3.0</strong> (ALL/H1/H2 + H1vsH2)
      </div>

      <div className="row between wrap" style={{ marginBottom: 12 }}>
        <div className="row gap wrap">
          <button onClick={props.onBack}>Tillbaka</button>
          <button onClick={props.onExit}>Avsluta</button>
          <button onClick={onExport}>Exportera till Excel</button>
        </div>

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
            <button className={scope === "ALL" && !compare ? "segon" : ""} onClick={() => { setCompare(false); setScope("ALL"); }}>
              ALL
            </button>
            <button className={scope === "P1" && !compare ? "segon" : ""} onClick={() => { setCompare(false); setScope("P1"); }}>
              H1
            </button>
            <button className={scope === "P2" && !compare ? "segon" : ""} onClick={() => { setCompare(false); setScope("P2"); }}>
              H2
            </button>
            <button className={compare ? "segon" : ""} onClick={() => setCompare(true)}>
              H1 vs H2
            </button>
          </div>
        </div>
      </div>

      {compare && packP1 && packP2 ? (
        <div className="grid2">
          <div>
            <OverviewCard title="H1" pack={packP1} events={p1Events} ctx={ctx} />
          </div>
          <div>
            <OverviewCard title="H2" pack={packP2} events={p2Events} ctx={ctx} />
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>Överblick</h2>
            <div className="kpirow" style={{ alignItems: "stretch" }}>
              <div className="kpi" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div className="kpiLabel">Anfall</div>
                <div className="kpiValue">{attacksFromModel}</div>
              </div>

              <div className="kpi" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div className="kpiLabel">Avslut</div>
                <div className="kpiValue">{shots.total}</div>
                <div className="muted">Avslut per anfall: {pctShotsPerAttack} %</div>
              </div>

              <div className="kpi" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div className="kpiLabel">{ctx === "ANFALL" ? "Mål" : "Insläppta mål"}</div>
                <div className="kpiValue">{shots.goals}</div>
                <div className="muted">
                  {ctx === "ANFALL" ? "Mål per anfall" : "Insläppta mål per anfall"}: {pctGoalsPerAttack} %
                </div>
              </div>

              <div className="kpi" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div className="kpiLabel">Effektivitet</div>
                <div className="kpiValue">{shots.efficiency} %</div>
              </div>

              <div className="kpi" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div className="kpiLabel">Räddningar</div>
                <div className="kpiValue">{shots.saves}</div>
              </div>

              <div className="kpi" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div className="kpiLabel">Räddningsprocent</div>
                <div className="kpiValue">{shots.savePct} %</div>
              </div>

              <div className="kpi" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div className="kpiLabel">Omställning</div>
                <div className="kpiValue">{omst.total}</div>
                <div className="muted">Omställning per anfall: {pctOmstPerAttack} %</div>
              </div>
            </div>

            <div className="muted">Miss: {shots.misses} • Frikast: {freeThrows}</div>
          </div>

          <div className="card">
            <h2>Avslut</h2>
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
            <h2>Placering i mål</h2>
            <div className="heat">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => (
                <div key={k} className="heatBox">
                  <div className="heatNum">{n((packScoped as any)?.heatmap?.[ctx]?.[k] ?? 0)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid2">
            <div className="card">
              <h2>Antal pass innan mål</h2>
              <table className="tbl">
                <tbody>
                  <tr><th>&lt; 2 pass</th><td>{pass2}</td></tr>
                  <tr><th>&lt; 4 pass</th><td>{pass4}</td></tr>
                  <tr><th>Fler pass</th><td>{passMore}</td></tr>
                  <tr style={sumRowStyle}><th style={sumRowStyle}>SUMMA</th><td style={sumRowStyle}>{passTotal}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <h2>Omställning</h2>
              <table className="tbl">
                <tbody>
                  <tr><th>Brytning</th><td>{n((omst.b as any).Brytning)}</td></tr>
                  <tr><th>Tappad boll</th><td>{n((omst.b as any)["Tappad boll"])}</td></tr>
                  <tr><th>Regelfel</th><td>{n((omst.b as any).Regelfel)}</td></tr>
                  <tr><th>Passivt spel</th><td>{n((omst.b as any)["Passivt spel"])}</td></tr>
                  <tr style={sumRowStyle}><th style={sumRowStyle}>SUMMA</th><td style={sumRowStyle}>{omst.total}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}