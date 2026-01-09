import { useState, useMemo, useEffect } from "react";
import { exportToExcel } from "../utils/excelExport"; 
import { ShotMap } from "../components/Visuals/ShotMap"; 
import { EventList } from "../components/Panels/EventList";
import type { AppEvent } from "../types/AppEvents";

type Props = { matchId: string; onBack: () => void; };
type FilterPeriod = "ALL" | "H1" | "H2";
type Tab = "OVERVIEW" | "ATTACK" | "DEFENSE" | "GOALKEEPER" | "EVENTS";

// --- FÄRGER ---
const COL_ATTACK = "#38BDF8"; 
const COL_DEFENSE = "#EF4444"; 
const COL_GOALIE = "#F97316"; 
const COL_OVERVIEW = "#F8FAFC"; 

const C_GOAL = "#22C55E";   
const C_SAVE = "#F97316";   
const C_PENALTY = "#A855F7"; 

// --- STYLING KOMPONENTER ---

const StatRow = ({ label, count, pct, pctColor = "#fff", isHeader = false }: any) => (
    <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        padding: "6px 0", 
        borderBottom: "1px solid rgba(255,255,255,0.05)" 
    }}>
        <div style={{ flex: 1, paddingRight: 8 }}>
            <span style={{ fontSize: 13, color: isHeader ? "#94A3B8" : "#E2E8F0", fontWeight: isHeader ? 700 : 400 }}>{label}</span>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            {pct !== undefined && (
                <div style={{ width: 50, textAlign: "right" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: pctColor }}>
                        {pct}%
                    </span>
                </div>
            )}
            {count !== undefined && (
                <div style={{ width: 40, textAlign: "right" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{count}</span>
                </div>
            )}
        </div>
    </div>
);

const SectionCard = ({ title, children, color = "#3B82F6" }: any) => (
    <div style={{ background: "#1E293B", borderRadius: 12, border: "1px solid #334155", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ 
            background: `linear-gradient(90deg, ${color}20 0%, transparent 100%)`, 
            padding: "8px 16px", 
            borderBottom: "1px solid #334155",
            fontSize: 11, fontWeight: 800, color: color, letterSpacing: 1, textTransform: "uppercase"
        }}>
            {title}
        </div>
        <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column" }}>
            {children}
        </div>
    </div>
);

const TabButton = ({ active, label, onClick, activeColor }: any) => (
    <button onClick={onClick} style={{
        flex: 1, padding: "14px 0", border: "none", background: "none",
        borderBottom: active ? `3px solid ${activeColor}` : "3px solid transparent",
        color: active ? "#fff" : "#94A3B8", fontWeight: 800, cursor: "pointer",
        transition: "all 0.2s", fontSize: 13
    }}>{label}</button>
);

const FilterButton = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
    <button 
        onClick={onClick}
        style={{
            appearance: "none",
            background: active ? "#38BDF8" : "transparent",
            color: active ? "#0F172A" : "#94A3B8",
            border: "none",
            borderRadius: 6,
            padding: "0 10px",      
            fontSize: 12,
            fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "24px", minHeight: 0, whiteSpace: "nowrap", cursor: "pointer", lineHeight: 1
        }}
    >
        {label}
    </button>
);

// --- DETAILED GOAL MAP ---
type GoalMapMode = "ATTACK_GOAL" | "ATTACK_SAVE" | "DEFENSE" | "GOALKEEPER";

const DetailedGoalMap = ({ events, mode, title }: { events: AppEvent[], mode: GoalMapMode, title?: string }) => {
    
    const dots = useMemo(() => {
        const cellGroups: Record<string, AppEvent[]> = {};
        
        events.forEach(e => {
            let key = "UNKNOWN";
            if (e.goalCell) {
                key = e.goalCell.toString();
            } else if (e.isPenalty) {
                key = "PENALTY_NO_POS";
            }
            if (!cellGroups[key]) cellGroups[key] = [];
            cellGroups[key].push(e);
        });

        const renderedDots: any[] = [];

        Object.keys(cellGroups).forEach(key => {
            const group = cellGroups[key];
            const cellId = parseInt(key);

            group.forEach((e, index) => {
                let x, y;

                if (!isNaN(cellId) && cellId >= 1 && cellId <= 6) {
                    const cellCol = (cellId - 1) % 3; 
                    const cellRow = Math.floor((cellId - 1) / 3);
                    
                    const baseX = 16.66 + (cellCol * 33.33);
                    const baseY = 25 + (cellRow * 50); 

                    const spread = 6; 
                    const subIndex = index % 9; 
                    const subCol = (subIndex % 3) - 1; 
                    const subRow = (Math.floor(subIndex / 3)) - 1; 

                    x = baseX + (subCol * spread);
                    y = baseY + (subRow * spread);

                } else if (key === "PENALTY_NO_POS") {
                    const offset = (index % 5) * 5 - 10;
                    x = 50 + offset;
                    y = 50 + (Math.floor(index / 5) * 5);
                } else {
                    return; 
                }

                let fill = "#fff";
                let border = "none";
                
                if (e.isPenalty) {
                    fill = C_PENALTY; 
                    if (e.outcome === "GOAL") border = `2px solid ${C_GOAL}`; 
                    else if (e.outcome === "SAVE") border = `2px solid ${C_SAVE}`; 
                } else {
                    if (e.outcome === "GOAL") fill = C_GOAL;
                    else if (e.outcome === "SAVE") fill = C_SAVE;
                }

                renderedDots.push(
                    <div key={e.id || index} style={{
                        position: "absolute", left: `${x}%`, top: `${y}%`,
                        width: 14, height: 14, borderRadius: "50%",
                        background: fill, border: border,
                        transform: "translate(-50%, -50%)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.6)",
                        zIndex: 10
                    }} />
                );
            });
        });

        return renderedDots;
    }, [events]);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", height: "100%" }}>
            {title && <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase" }}>{title}</div>}
            
            <div style={{ position: "relative", width: "100%", aspectRatio: "3/2", overflow: "hidden" }}>
                <svg width="100%" height="100%" viewBox="0 0 300 200" style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}>
                    <path d="M10,10 L290,10 L290,190 L10,190 Z" fill="rgba(255,255,255,0.05)" />
                    <line x1="103" y1="10" x2="103" y2="190" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="196" y1="10" x2="196" y2="190" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="10" y1="100" x2="290" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
                    <path d="M5,195 L5,5 L295,5 L295,195" stroke="#E2E8F0" strokeWidth="8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", top: 10, left: 10, right: 10, bottom: 10, zIndex: 10 }}>
                    {dots}
                </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, padding: "0 8px" }}>
                {(mode === "ATTACK_GOAL" || mode === "DEFENSE") && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: C_GOAL }} />
                        <span style={{ fontSize: 11, color: "#94A3B8" }}>Mål</span>
                    </div>
                )}
                {(mode === "ATTACK_SAVE" || mode === "GOALKEEPER") && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: C_SAVE }} />
                        <span style={{ fontSize: 11, color: "#94A3B8" }}>Räddning</span>
                    </div>
                )}
                {(mode === "ATTACK_GOAL" || mode === "DEFENSE") && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: C_PENALTY, border: `2px solid ${C_GOAL}` }} />
                        <span style={{ fontSize: 11, color: "#94A3B8" }}>Straffmål</span>
                    </div>
                )}
                {(mode === "ATTACK_SAVE" || mode === "GOALKEEPER") && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: C_PENALTY, border: `2px solid ${C_SAVE}` }} />
                        <span style={{ fontSize: 11, color: "#94A3B8" }}>Straffrädd</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function SummaryView({ matchId, onBack }: Props) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [scores, setScores] = useState({ home: 0, away: 0 });
  const [teams, setTeams] = useState({ home: "HEMMA", away: "BORTA" });

  useEffect(() => {
    try {
        const savedEvents = localStorage.getItem(`match_${matchId}_events`);
        const savedScores = localStorage.getItem(`match_${matchId}_scores`);
        const savedSetup = localStorage.getItem(`match_${matchId}_setup`) || localStorage.getItem(`match_${matchId}_info`);
        
        if (savedEvents) setEvents(JSON.parse(savedEvents));
        if (savedScores) setScores(JSON.parse(savedScores));
        if (savedSetup) {
            const parsed = JSON.parse(savedSetup);
            setTeams({
                home: parsed.homeTeam || parsed.home || "HEMMA",
                away: parsed.awayTeam || parsed.away || "BORTA"
            });
        }
    } catch (e) { console.error(e); }
  }, [matchId]);

  const [period, setPeriod] = useState<FilterPeriod>("ALL");
  const [activeTab, setActiveTab] = useState<Tab>("OVERVIEW");

  const stats = useMemo(() => {
      const filtered = period === "ALL" ? events : events.filter(e => period === "H1" ? e.period === 1 : e.period === 2);
      
      const calcDetailedStats = (phase: "ATTACK" | "DEFENSE") => {
          const phaseEvents = filtered.filter(e => e.phase === phase);
          const shots = phaseEvents.filter(e => e.type === "SHOT");
          const goals = shots.filter(e => e.outcome === "GOAL");
          const turnovers = phaseEvents.filter(e => e.type === "TURNOVER");
          
          const totalAttacks = shots.length + turnovers.length;
          
          const pctAtt = (val: number) => totalAttacks > 0 ? Math.round((val / totalAttacks) * 100) : 0;
          const pctGoal = (val: number) => goals.length > 0 ? Math.round((val / goals.length) * 100) : 0;
          const eff = shots.length > 0 ? Math.round((goals.length / shots.length) * 100) : 0;

          const p1_2 = goals.filter(e => e.passes === 2).length;
          const p3_4 = goals.filter(e => e.passes === 4).length;
          const p5_p = goals.filter(e => e.passes === 6).length;

          const steals = turnovers.filter(e => e.subType === "STEAL").length;
          const lostBalls = turnovers.filter(e => e.subType === "LOST_BALL").length;
          const tech = turnovers.filter(e => e.subType === "TECHNICAL_FAULT").length;
          const passive = turnovers.filter(e => e.subType === "PASSIVE_PLAY").length;

          const saves = shots.filter(e => e.outcome === "SAVE").length;

          const getShotStats = (filterFn: (e: AppEvent) => boolean) => {
              const subset = shots.filter(filterFn);
              const subsetGoals = subset.filter(e => e.outcome === "GOAL");
              const subsetSaves = subset.filter(e => e.outcome === "SAVE");
              return {
                  count: subset.length, 
                  goals: subsetGoals.length,
                  effPct: subset.length > 0 ? Math.round((subsetGoals.length / subset.length) * 100) : 0,
                  savePct: subset.length > 0 ? Math.round((subsetSaves.length / subset.length) * 100) : 0, 
                  pct: totalAttacks > 0 ? Math.round((subset.length / totalAttacks) * 100) : 0, 
              };
          };

          return {
              totalAttacks,
              shots: { count: shots.length, pct: pctAtt(shots.length) },
              goals: { count: goals.length, pct: pctAtt(goals.length) },
              eff,
              misses: getShotStats(e => e.outcome === "MISS"),
              passes: {
                  low: { count: p1_2, pct: pctGoal(p1_2) },
                  mid: { count: p3_4, pct: pctGoal(p3_4) },
                  high: { count: p5_p, pct: pctGoal(p5_p) }
              },
              turnovers: { count: turnovers.length, pct: pctAtt(turnovers.length) },
              steals: { count: steals, pct: pctAtt(steals) },
              lostBalls: { count: lostBalls, pct: pctAtt(lostBalls) },
              techFault: { count: tech, pct: pctAtt(tech) },
              passive: { count: passive, pct: pctAtt(passive) },
              saves: { count: saves, pct: pctAtt(saves) },
              
              v6: getShotStats(e => e.zone === 1 && e.distance === "6m"),
              v9: getShotStats(e => e.zone === 2 && e.distance === "9m"),
              m6: getShotStats(e => (e.zone === 2 || e.zone === 3 || e.zone === 4) && e.distance === "6m"),
              m9: getShotStats(e => e.zone === 3 && e.distance === "9m"),
              h9: getShotStats(e => e.zone === 4 && e.distance === "9m"),
              h6: getShotStats(e => e.zone === 5 && e.distance === "6m"),

              sixMeter: getShotStats(e => e.distance === "6m"),
              nineMeter: getShotStats(e => e.distance === "9m"),
              wing: getShotStats(e => e.zone === 1 || e.zone === 5),
              penalty: getShotStats(e => !!e.isPenalty), 
              
              z1: getShotStats(e => e.zone === 1),
              z2: getShotStats(e => e.zone === 2),
              z3: getShotStats(e => e.zone === 3),
              z4: getShotStats(e => e.zone === 4),
              z5: getShotStats(e => e.zone === 5),
          };
      };

      return {
          attack: calcDetailedStats("ATTACK"),
          defense: calcDetailedStats("DEFENSE")
      };
  }, [events, period]);

  const handleDownload = () => {
      exportToExcel(stats, events, teams, matchId);
  };

  const filteredEvents = useMemo(() => {
      if (period === "ALL") return events;
      return events.filter(e => period === "H1" ? e.period === 1 : e.period === 2);
  }, [events, period]);

  const OverviewTab = () => {
      const att = stats.attack;
      const def = stats.defense;

      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
            <SectionCard title="ANFALL" color={COL_ATTACK}>
                <StatRow label="Anfall" count={att.totalAttacks} />
                <StatRow label="Avslut" count={att.shots.count} pct={att.shots.pct} pctColor={COL_ATTACK} />
                <StatRow label="Mål" count={att.goals.count} pct={att.goals.pct} pctColor={COL_ATTACK} />
                <StatRow label="Effektivitet" pct={att.eff} pctColor={COL_ATTACK} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <StatRow label="PASS INNAN MÅL" isHeader />
                <StatRow label="1-2 pass" count={att.passes.low.count} pct={att.passes.low.pct} pctColor={COL_ATTACK} />
                <StatRow label="3-4 pass" count={att.passes.mid.count} pct={att.passes.mid.pct} pctColor={COL_ATTACK} />
                <StatRow label="5+ pass" count={att.passes.high.count} pct={att.passes.high.pct} pctColor={COL_ATTACK} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <StatRow label="OFF. OMSTÄLLNINGAR" isHeader />
                <StatRow label="Omställningar" count={att.turnovers.count} pct={att.turnovers.pct} pctColor={COL_ATTACK} />
                <StatRow label="Tappad Boll" count={att.lostBalls.count} pct={att.lostBalls.pct} pctColor={COL_ATTACK} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <StatRow label="Räddningar (Motst)" count={att.saves.count} pct={att.saves.pct} pctColor={COL_ATTACK} />
            </SectionCard>

            <SectionCard title="FÖRSVAR" color={COL_DEFENSE}>
                <StatRow label="Anfall" count={def.totalAttacks} />
                <StatRow label="Avslut" count={def.shots.count} pct={def.shots.pct} pctColor={COL_DEFENSE} />
                <StatRow label="Mål" count={def.goals.count} pct={def.goals.pct} pctColor={COL_DEFENSE} />
                <StatRow label="Effektivitet" pct={def.eff} pctColor={COL_DEFENSE} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <StatRow label="PASS INNAN MÅL" isHeader />
                <StatRow label="1-2 pass" count={def.passes.low.count} pct={def.passes.low.pct} pctColor={COL_DEFENSE} />
                <StatRow label="3-4 pass" count={def.passes.mid.count} pct={def.passes.mid.pct} pctColor={COL_DEFENSE} />
                <StatRow label="5+ pass" count={def.passes.high.count} pct={def.passes.high.pct} pctColor={COL_DEFENSE} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <StatRow label="DEF. OMSTÄLLNINGAR" isHeader />
                <StatRow label="Omställningar" count={def.turnovers.count} pct={def.turnovers.pct} pctColor={COL_DEFENSE} />
                <StatRow label="Bollvinst" count={def.steals.count} pct={def.steals.pct} pctColor={COL_DEFENSE} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <StatRow label="Målvaktsräddningar" count={def.saves.count} pct={def.saves.pct} pctColor={COL_DEFENSE} />
            </SectionCard>

            <div style={{ background: "#1E293B", padding: 12, borderRadius: 12, border: "1px solid #334155", display: "flex", flexDirection: "column", height: 350 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COL_ATTACK, marginBottom: 8, textAlign: "center" }}>MÅL I ZONER</div>
                <div style={{ flex: 1 }}>
                    <ShotMap mode="ATTACK" events={filteredEvents.filter(e => e.phase === "ATTACK")} />
                </div>
            </div>
            <div style={{ background: "#1E293B", padding: 12, borderRadius: 12, border: "1px solid #334155", display: "flex", flexDirection: "column", height: 350 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COL_DEFENSE, marginBottom: 8, textAlign: "center" }}>INSLÄPPTA I ZONER</div>
                <div style={{ flex: 1 }}>
                    <ShotMap mode="DEFENSE" events={filteredEvents.filter(e => e.phase === "DEFENSE")} />
                </div>
            </div>
        </div>
      );
  };

  const DetailTab = ({ data, color, events, mode }: { data: any, color: string, events: AppEvent[], mode: GoalMapMode }) => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SectionCard title="AVSLUT & MÅL" color={color}>
                <StatRow label="6m" count={data.sixMeter.goals} pct={data.sixMeter.effPct} pctColor={color} />
                <StatRow label="9m" count={data.nineMeter.goals} pct={data.nineMeter.effPct} pctColor={color} />
                <StatRow label="Kant (Zon 1, 5)" count={data.wing.goals} pct={data.wing.effPct} pctColor={color} />
                <StatRow label="Straff" count={data.penalty.goals} pct={data.penalty.effPct} pctColor={color} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <StatRow label="ZONER" isHeader />
                <StatRow label="Zon 1" count={data.z1.goals} pct={data.z1.effPct} pctColor={color} />
                <StatRow label="Zon 2" count={data.z2.goals} pct={data.z2.effPct} pctColor={color} />
                <StatRow label="Zon 3" count={data.z3.goals} pct={data.z3.effPct} pctColor={color} />
                <StatRow label="Zon 4" count={data.z4.goals} pct={data.z4.effPct} pctColor={color} />
                <StatRow label="Zon 5" count={data.z5.goals} pct={data.z5.effPct} pctColor={color} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <StatRow label="POSITIONSAVSLUT" isHeader />
                <StatRow label="V6 (Zon 1 + 6m)" count={data.v6.goals} pct={data.v6.effPct} pctColor={color} />
                <StatRow label="V9 (Zon 2 + 9m)" count={data.v9.goals} pct={data.v9.effPct} pctColor={color} />
                <StatRow label="M6 (Zon 2-4 + 6m)" count={data.m6.goals} pct={data.m6.effPct} pctColor={color} />
                <StatRow label="M9 (Zon 3 + 9m)" count={data.m9.goals} pct={data.m9.effPct} pctColor={color} />
                <StatRow label="H9 (Zon 4 + 9m)" count={data.h9.goals} pct={data.h9.effPct} pctColor={color} />
                <StatRow label="H6 (Zon 5 + 6m)" count={data.h6.goals} pct={data.h6.effPct} pctColor={color} />
            </SectionCard>

            <SectionCard title="OMSTÄLLNINGAR" color={color}>
                <StatRow label="Totala omställningar" count={data.turnovers.count} pct={data.turnovers.pct} pctColor={color} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <StatRow label="Brytningar" count={data.steals.count} pct={data.steals.pct} pctColor={color} />
                <StatRow label="Tappad Boll" count={data.lostBalls.count} pct={data.lostBalls.pct} pctColor={color} />
                <StatRow label="Regelfel" count={data.techFault.count} pct={data.techFault.pct} pctColor={color} />
                <StatRow label="Passivt Spel" count={data.passive.count} pct={data.passive.pct} pctColor={color} />
            </SectionCard>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
             {mode === "ATTACK_GOAL" && (
                 <>
                    <div style={{ background: "#1E293B", padding: 12, borderRadius: 12, border: "1px solid #334155", display: "flex", flexDirection: "column" }}>
                        <div style={{ flex: 1 }}>
                            <DetailedGoalMap 
                                title="MÅL"
                                events={events.filter(e => e.outcome === "GOAL")} 
                                mode="ATTACK_GOAL" 
                            />
                        </div>
                    </div>
                    <div style={{ background: "#1E293B", padding: 12, borderRadius: 12, border: "1px solid #334155", display: "flex", flexDirection: "column" }}>
                        <div style={{ flex: 1 }}>
                            <DetailedGoalMap 
                                title="RÄDDNINGAR (MOTSTÅNDARE)"
                                events={events.filter(e => e.outcome === "SAVE")} 
                                mode="ATTACK_SAVE" 
                            />
                        </div>
                    </div>
                 </>
             )}

             {mode === "DEFENSE" && (
                 <div style={{ background: "#1E293B", padding: 12, borderRadius: 12, border: "1px solid #334155", display: "flex", flexDirection: "column" }}>
                    <div style={{ flex: 1 }}>
                        <DetailedGoalMap 
                            title="INSLÄPPTA MÅL"
                            events={events.filter(e => e.outcome === "GOAL")} 
                            mode="DEFENSE" 
                        />
                    </div>
                 </div>
             )}
          </div>
      </div>
  );

  const GoalkeeperTab = ({ data, events }: { data: any, events: AppEvent[] }) => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
          <SectionCard title="RÄDDNINGAR & ZONER" color={COL_GOALIE}>
             <StatRow label="6m" count={data.sixMeter.goals} pct={data.sixMeter.savePct} pctColor={COL_GOALIE} />
             <StatRow label="9m" count={data.nineMeter.goals} pct={data.nineMeter.savePct} pctColor={COL_GOALIE} />
             <StatRow label="Kant" count={data.wing.goals} pct={data.wing.savePct} pctColor={COL_GOALIE} />
             <StatRow label="Straff" count={data.penalty.goals} pct={data.penalty.savePct} pctColor={COL_GOALIE} />
             <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
             <StatRow label="ZONER" isHeader />
             <StatRow label="Zon 1" count={data.z1.goals} pct={data.z1.savePct} pctColor={COL_GOALIE} />
             <StatRow label="Zon 2" count={data.z2.goals} pct={data.z2.savePct} pctColor={COL_GOALIE} />
             <StatRow label="Zon 3" count={data.z3.goals} pct={data.z3.savePct} pctColor={COL_GOALIE} />
             <StatRow label="Zon 4" count={data.z4.goals} pct={data.z4.savePct} pctColor={COL_GOALIE} />
             <StatRow label="Zon 5" count={data.z5.goals} pct={data.z5.savePct} pctColor={COL_GOALIE} />
             <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
             <StatRow label="POSITIONSAVSLUT" isHeader />
             <StatRow label="V6 (Zon 1 + 6m)" count={data.v6.goals} pct={data.v6.savePct} pctColor={COL_GOALIE} />
             <StatRow label="V9 (Zon 2 + 9m)" count={data.v9.goals} pct={data.v9.savePct} pctColor={COL_GOALIE} />
             <StatRow label="M6 (Zon 2-4 + 6m)" count={data.m6.goals} pct={data.m6.savePct} pctColor={COL_GOALIE} />
             <StatRow label="M9 (Zon 3 + 9m)" count={data.m9.goals} pct={data.m9.savePct} pctColor={COL_GOALIE} />
             <StatRow label="H9 (Zon 4 + 9m)" count={data.h9.goals} pct={data.h9.savePct} pctColor={COL_GOALIE} />
             <StatRow label="H6 (Zon 5 + 6m)" count={data.h6.goals} pct={data.h6.savePct} pctColor={COL_GOALIE} />
          </SectionCard>
          <div style={{ background: "#1E293B", padding: 12, borderRadius: 12, border: "1px solid #334155", display: "flex", flexDirection: "column", minHeight: 0, position: "sticky", top: 0 }}>
                <div style={{ flex: 1 }}>
                    <DetailedGoalMap 
                        title="RÄDDNINGAR (PLACERING)"
                        events={events.filter(e => e.outcome === "SAVE")} 
                        mode="GOALKEEPER" 
                    />
                </div>
          </div>
      </div>
  );

  return (
    <div style={{ height: "100vh", background: "#0F172A", color: "#F8FAFC", display: "flex", flexDirection: "column" }}>
      
      {/* HEADER (FIXAD: Inget överlapp + Gap) */}
      <div style={{ display: "flex", flexDirection: "column", background: "#1E293B", border: "1px solid #334155", borderRadius: 12, margin: "12px 12px 0 12px", padding: "8px 16px 0 16px", flexShrink: 0 }}>
          {/* FIX: Lade till gap: 12 här för att separera blocken */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 12 }}>
             
             {/* VÄNSTER: TILLBAKA */}
             <div style={{ flex: "0 0 auto" }}> {/* Flex auto = tar bara nödvändig plats */}
                 <button onClick={onBack} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 32, cursor: "pointer", padding: 0 }}>←</button>
             </div>

             {/* MITTEN: SCOREBOARD (Får krympa om det behövs) */}
             <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minWidth: 0 }}>
                 
                 {/* HEMMALAG */}
                 <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 18, color: "#fff", fontWeight: 800, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "right" }}>
                        {teams.home}
                    </span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1, whiteSpace: "nowrap" }}>
                        {scores.home}
                    </span>
                 </div>
                 
                 <span style={{ fontSize: 16, color: "#64748B", fontWeight: 700, flexShrink: 0 }}>-</span>
                 
                 {/* BORTALAG */}
                 <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 8, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1, whiteSpace: "nowrap" }}>
                        {scores.away}
                    </span>
                    <span style={{ fontSize: 18, color: "#fff", fontWeight: 800, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "left" }}>
                        {teams.away}
                    </span>
                 </div>
             </div>

             {/* HÖGER: EXPORT & FILTER (Får ALDRIG krympa) */}
             <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                 <button onClick={handleDownload} style={{ appearance: "none", background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#38BDF8", borderRadius: 6, padding: "0 12px", cursor: "pointer", fontSize: 14, fontWeight: 800, height: 28, minHeight: 0, lineHeight: 1, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>↓</span> XLSX
                 </button>

                 <div style={{ display: "flex", background: "#0F172A", padding: 2, borderRadius: 6, border: "1px solid #334155", gap: 2 }}>
                    {(["ALL", "H1", "H2"] as FilterPeriod[]).map(p => (
                        <FilterButton key={p} active={period === p} label={p === "ALL" ? "TOT" : p} onClick={() => setPeriod(p)} />
                    ))}
                 </div>
             </div>
          </div>

          <div style={{ display: "flex" }}>
              <TabButton active={activeTab === "OVERVIEW"} label="ÖVERBLICK" onClick={() => setActiveTab("OVERVIEW")} activeColor={COL_OVERVIEW} />
              <TabButton active={activeTab === "ATTACK"} label="ANFALL" onClick={() => setActiveTab("ATTACK")} activeColor={COL_ATTACK} />
              <TabButton active={activeTab === "DEFENSE"} label="FÖRSVAR" onClick={() => setActiveTab("DEFENSE")} activeColor={COL_DEFENSE} />
              <TabButton active={activeTab === "GOALKEEPER"} label="MÅLVAKT" onClick={() => setActiveTab("GOALKEEPER")} activeColor={COL_GOALIE} />
              <TabButton active={activeTab === "EVENTS"} label="HÄNDELSER" onClick={() => setActiveTab("EVENTS")} activeColor={COL_OVERVIEW} />
          </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          {activeTab === "OVERVIEW" && <OverviewTab />}
          {activeTab === "ATTACK" && <DetailTab data={stats.attack} color={COL_ATTACK} mode="ATTACK_GOAL" events={filteredEvents.filter(e => e.phase === "ATTACK")} />}
          {activeTab === "DEFENSE" && <DetailTab data={stats.defense} color={COL_DEFENSE} mode="DEFENSE" events={filteredEvents.filter(e => e.phase === "DEFENSE")} />}
          {activeTab === "GOALKEEPER" && <GoalkeeperTab data={stats.defense} events={filteredEvents.filter(e => e.phase === "DEFENSE")} />}
          {activeTab === "EVENTS" && <EventList events={filteredEvents} />}
      </div>
    </div>
  );
}