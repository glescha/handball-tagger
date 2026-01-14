import { useState, useMemo, useEffect } from "react";
import { exportToExcel } from "../utils/excelExport"; 
import { ShotMap } from "../components/Visuals/ShotMap"; 
import { ShotMapDistance } from "../components/Visuals/ShotMapDistance";
import { ShotMapZones } from "../components/Visuals/ShotMapZones";
import { ShotMapPositions } from "../components/Visuals/ShotMapPositions";
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

const HeaderLabels = () => (
    <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: 40, textAlign: "right", marginRight: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8" }}>ANTAL</span>
        </div>
        <div style={{ width: 50, textAlign: "right" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8" }}>%</span>
        </div>
    </div>
);

const ThreeColHeader = () => (
    <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: 45, textAlign: "right", marginRight: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8" }}>AVSLUT</span>
        </div>
        <div style={{ width: 35, textAlign: "right", marginRight: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8" }}>MÅL</span>
        </div>
        <div style={{ width: 40, textAlign: "right" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8" }}>%</span>
        </div>
    </div>
);

const ThreeColRow = ({ label, shots, goals, pct, pctColor = "#fff", isHeader = false }: any) => (
    <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        padding: "6px 0", 
        borderBottom: "1px solid rgba(255,255,255,0.05)" 
    }}>
        <div style={{ flex: 1, paddingRight: 8 }}>
            <span style={{ fontSize: 13, color: isHeader ? "#94A3B8" : "#E2E8F0", fontWeight: isHeader ? 700 : 400 }}>{label}</span>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <div style={{ width: 45, textAlign: "right", marginRight: 4 }}>
                {shots !== undefined && <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{shots}</span>}
            </div>
            <div style={{ width: 35, textAlign: "right", marginRight: 4 }}>
                {goals !== undefined && <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{goals}</span>}
            </div>
            <div style={{ width: 40, textAlign: "right" }}>
                {pct !== undefined && <span style={{ fontSize: 14, fontWeight: 700, color: pctColor }}>{pct}%</span>}
            </div>
        </div>
    </div>
);

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
            <div style={{ width: 40, textAlign: "right", marginRight: 6 }}>
                {count !== undefined && (
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{count}</span>
                )}
            </div>
            <div style={{ width: 50, textAlign: "right" }}>
                {pct !== undefined && (
                    <span style={{ fontSize: 14, fontWeight: 700, color: pctColor }}>
                        {pct}%
                    </span>
                )}
            </div>
        </div>
    </div>
);

const SectionCard = ({ title, children, color = "#3B82F6", headerRight }: any) => (
    <div style={{ background: "#1E293B", borderRadius: 12, border: "1px solid #334155", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ 
            background: `linear-gradient(90deg, ${color}20 0%, transparent 100%)`, 
            padding: "8px 16px", 
            borderBottom: "1px solid #334155",
            display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: color, letterSpacing: 1, textTransform: "uppercase" }}>{title}</span>
            {headerRight}
        </div>
        <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column" }}>
            {children}
        </div>
    </div>
);

// NY KOMPONENT: Kombinerat kort (Tabell + Karta)
const CombinedCard = ({ title, color, tableContent, mapContent }: any) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const [view, setView] = useState<"TABLE" | "MAP">("TABLE");

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div style={{ 
            background: "#1E293B", borderRadius: 12, border: "1px solid #334155", 
            overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" 
        }}>
            <div 
                onClick={() => isMobile && setView(v => v === "TABLE" ? "MAP" : "TABLE")}
                style={{ 
                    background: `linear-gradient(90deg, ${color}20 0%, transparent 100%)`, 
                    padding: "8px 16px", borderBottom: "1px solid #334155",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    cursor: isMobile ? "pointer" : "default",
                    userSelect: "none"
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: color, letterSpacing: 1, textTransform: "uppercase" }}>{title}</span>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {(!isMobile || view === "TABLE") && <HeaderLabels />}
                </div>
            </div>
            
            {isMobile ? (
                <div style={{ padding: 12, flex: 1 }}>
                    <div key={view} style={{ animation: "fadeIn 0.25s ease-out" }}>
                        {view === "TABLE" ? tableContent : <div style={{ height: 300 }}>{mapContent}</div>}
                    </div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", height: "100%" }}>
                    <div style={{ padding: "12px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>{tableContent}</div>
                    <div style={{ padding: "12px", minHeight: 200 }}>{mapContent}</div>
                </div>
            )}
        </div>
    );
};

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

  const handlePrint = () => {
      window.print();
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
            <SectionCard title="ANFALL" color={COL_ATTACK} headerRight={<HeaderLabels />}>
                <StatRow label="Anfall" count={att.totalAttacks} />
                <StatRow label="Avslut" count={att.shots.count} pct={att.shots.pct} pctColor={COL_ATTACK} />
                <StatRow label="Mål" count={att.goals.count} pct={att.goals.pct} pctColor={COL_ATTACK} />
                <StatRow label="Effektivitet" pct={att.eff} pctColor={COL_ATTACK} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <StatRow label="PASS INNAN MÅL" isHeader />
                <StatRow label="<2 Pass" count={att.passes.low.count} pct={att.passes.low.pct} pctColor={COL_ATTACK} />
                <StatRow label="<4 Pass" count={att.passes.mid.count} pct={att.passes.mid.pct} pctColor={COL_ATTACK} />
                <StatRow label="5+ Pass" count={att.passes.high.count} pct={att.passes.high.pct} pctColor={COL_ATTACK} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <StatRow label="DEFENSIVA OMSTÄLLNINGAR" isHeader />
                <StatRow label="Omställningar" count={att.turnovers.count} pct={att.turnovers.pct} pctColor={COL_ATTACK} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <StatRow label="Räddningar (Motst)" count={att.saves.count} pct={att.saves.pct} pctColor={COL_ATTACK} />
            </SectionCard>

            <SectionCard title="FÖRSVAR" color={COL_DEFENSE} headerRight={<HeaderLabels />}>
                <StatRow label="Anfall" count={def.totalAttacks} />
                <StatRow label="Avslut" count={def.shots.count} pct={def.shots.pct} pctColor={COL_DEFENSE} />
                <StatRow label="Mål" count={def.goals.count} pct={def.goals.pct} pctColor={COL_DEFENSE} />
                <StatRow label="Effektivitet" pct={def.eff} pctColor={COL_DEFENSE} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <StatRow label="PASS INNAN MÅL" isHeader />
                <StatRow label="<2 Pass" count={def.passes.low.count} pct={def.passes.low.pct} pctColor={COL_DEFENSE} />
                <StatRow label="<4 Pass" count={def.passes.mid.count} pct={def.passes.mid.pct} pctColor={COL_DEFENSE} />
                <StatRow label="5+ Pass" count={def.passes.high.count} pct={def.passes.high.pct} pctColor={COL_DEFENSE} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <StatRow label="OFFENSIVA OMSTÄLLNINGAR" isHeader />
                <StatRow label="Omställningar" count={def.turnovers.count} pct={def.turnovers.pct} pctColor={COL_DEFENSE} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
                <StatRow label="Målvaktsräddningar" count={def.saves.count} pct={def.saves.pct} pctColor={COL_DEFENSE} />
            </SectionCard>

            <div style={{ background: "#1E293B", padding: 12, borderRadius: 12, border: "1px solid #334155", display: "flex", flexDirection: "column", height: 350 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COL_ATTACK, marginBottom: 8, textAlign: "center" }}>MÅL I ZONER</div>
                <div style={{ flex: 1, minHeight: 0 }}>
                    <ShotMap mode="ATTACK" events={filteredEvents.filter(e => e.phase === "ATTACK")} />
                </div>
            </div>
            <div style={{ background: "#1E293B", padding: 12, borderRadius: 12, border: "1px solid #334155", display: "flex", flexDirection: "column", height: 350 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COL_DEFENSE, marginBottom: 8, textAlign: "center" }}>INSLÄPPTA I ZONER</div>
                <div style={{ flex: 1, minHeight: 0 }}>
                    <ShotMap mode="DEFENSE" events={filteredEvents.filter(e => e.phase === "DEFENSE")} />
                </div>
            </div>
        </div>
      );
  };

  const DetailTab = ({ data, color, events, mode }: { data: any, color: string, events: AppEvent[], mode: GoalMapMode }) => {
      const isAttack = mode === "ATTACK_GOAL";

      return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "stretch" }}>
              
              {/* KORT 1: ANFALL (Överblick) + MÅLKARTA */}
              <CombinedCard 
                title={isAttack ? "ANFALL & MÅL" : "FÖRSVAR & INSLÄPPTA"} 
                color={color}
                tableContent={
                    <>
                        <StatRow label="Anfall" count={data.totalAttacks} />
                        <StatRow label="Avslut" count={data.shots.count} pct={data.shots.pct} pctColor={color} />
                        <StatRow label="Mål" count={data.goals.count} pct={data.goals.pct} pctColor={color} />
                        <StatRow label="Effektivitet" pct={data.eff} pctColor={color} />
                        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "8px 0" }} />
                        <StatRow label="Tekniska Fel" count={data.techFault.count} pct={data.techFault.pct} pctColor={color} />
                        <StatRow label="Tappad Boll" count={data.lostBalls.count} pct={data.lostBalls.pct} pctColor={color} />
                    </>
                }
                mapContent={
                    <DetailedGoalMap 
                        events={events.filter(e => e.outcome === "GOAL")} 
                        mode={isAttack ? "ATTACK_GOAL" : "DEFENSE"} 
                    />
                }
              />

              {/* KORT 2: AVSTÅND */}
              <CombinedCard 
                title="AVSTÅND" 
                color={color}
                tableContent={
                    <>
                        <ThreeColRow label="6m" shots={data.sixMeter.count} goals={data.sixMeter.goals} pct={data.sixMeter.effPct} pctColor={color} />
                        <ThreeColRow label="9m" shots={data.nineMeter.count} goals={data.nineMeter.goals} pct={data.nineMeter.effPct} pctColor={color} />
                        <ThreeColRow label="Straff" shots={data.penalty.count} goals={data.penalty.goals} pct={data.penalty.effPct} pctColor={color} />
                    </>
                }
                mapContent={<ShotMapDistance mode={isAttack ? "ATTACK" : "DEFENSE"} events={events} />}
              />

              {/* KORT 3: ZONER */}
              <CombinedCard 
                title="ZONER" 
                color={color}
                tableContent={
                    <>
                        <ThreeColRow label="Zon 1" shots={data.z1.count} goals={data.z1.goals} pct={data.z1.effPct} pctColor={color} />
                        <ThreeColRow label="Zon 2" shots={data.z2.count} goals={data.z2.goals} pct={data.z2.effPct} pctColor={color} />
                        <ThreeColRow label="Zon 3" shots={data.z3.count} goals={data.z3.goals} pct={data.z3.effPct} pctColor={color} />
                        <ThreeColRow label="Zon 4" shots={data.z4.count} goals={data.z4.goals} pct={data.z4.effPct} pctColor={color} />
                        <ThreeColRow label="Zon 5" shots={data.z5.count} goals={data.z5.goals} pct={data.z5.effPct} pctColor={color} />
                    </>
                }
                mapContent={<ShotMapZones events={events} mode={isAttack ? "ATTACK" : "DEFENSE"} />}
              />

              {/* KORT 4: POSITIONER */}
              <CombinedCard 
                title="POSITIONER" 
                color={color}
                tableContent={
                    <>
                        <ThreeColRow label="V6" shots={data.v6.count} goals={data.v6.goals} pct={data.v6.effPct} pctColor={color} />
                        <ThreeColRow label="V9" shots={data.v9.count} goals={data.v9.goals} pct={data.v9.effPct} pctColor={color} />
                        <ThreeColRow label="M6" shots={data.m6.count} goals={data.m6.goals} pct={data.m6.effPct} pctColor={color} />
                        <ThreeColRow label="M9" shots={data.m9.count} goals={data.m9.goals} pct={data.m9.effPct} pctColor={color} />
                        <ThreeColRow label="H9" shots={data.h9.count} goals={data.h9.goals} pct={data.h9.effPct} pctColor={color} />
                        <ThreeColRow label="H6" shots={data.h6.count} goals={data.h6.goals} pct={data.h6.effPct} pctColor={color} />
                    </>
                }
                mapContent={<ShotMapPositions events={events} mode={isAttack ? "ATTACK" : "DEFENSE"} />}
              />

          </div>
      );
  };

  const GoalkeeperTab = ({ data, events }: { data: any, events: AppEvent[] }) => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
          <SectionCard title="RÄDDNINGAR & ZONER" color={COL_GOALIE}>
             <StatRow label="6m" count={data.sixMeter.goals} pct={data.sixMeter.savePct} pctColor={COL_GOALIE} />
             <StatRow label="9m" count={data.nineMeter.goals} pct={data.nineMeter.savePct} pctColor={COL_GOALIE} />
             <StatRow label="Kanter" count={data.wing.goals} pct={data.wing.savePct} pctColor={COL_GOALIE} />
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
             <StatRow label="V6" count={data.v6.goals} pct={data.v6.savePct} pctColor={COL_GOALIE} />
             <StatRow label="V9" count={data.v9.goals} pct={data.v9.savePct} pctColor={COL_GOALIE} />
             <StatRow label="M6" count={data.m6.goals} pct={data.m6.savePct} pctColor={COL_GOALIE} />
             <StatRow label="M9" count={data.m9.goals} pct={data.m9.savePct} pctColor={COL_GOALIE} />
             <StatRow label="H9" count={data.h9.goals} pct={data.h9.savePct} pctColor={COL_GOALIE} />
             <StatRow label="H6" count={data.h6.goals} pct={data.h6.savePct} pctColor={COL_GOALIE} />
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
    <div className="print-root" style={{ height: "100vh", background: "#0F172A", color: "#F8FAFC", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @media print {
            .no-print { display: none !important; }
            .print-root { height: auto !important; overflow: visible !important; display: block !important; }
            .print-content { overflow: visible !important; height: auto !important; max-width: 100% !important; padding: 0 !important; }
            @page { size: landscape; margin: 5mm; }
            body { zoom: 0.65; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
      
      {/* HEADER (FIXAD: Inget överlapp + Gap) */}
      <div style={{ display: "flex", flexDirection: "column", background: "#1E293B", border: "1px solid #334155", borderRadius: 12, margin: "12px 12px 0 12px", padding: "8px 16px 0 16px", flexShrink: 0 }}>
          {/* FIX: Lade till gap: 12 här för att separera blocken */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 12 }}>
             
             {/* VÄNSTER: TILLBAKA */}
             <div style={{ flex: "0 0 auto" }} className="no-print"> {/* Flex auto = tar bara nödvändig plats */}
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
             <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }} className="no-print">
                 <button onClick={handlePrint} style={{ appearance: "none", background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#F43F5E", borderRadius: 6, padding: "0 12px", cursor: "pointer", fontSize: 14, fontWeight: 800, height: 28, minHeight: 0, lineHeight: 1, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>🖨</span> PDF
                 </button>

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

          <div style={{ display: "flex" }} className="no-print">
              <TabButton active={activeTab === "OVERVIEW"} label="ÖVERBLICK" onClick={() => setActiveTab("OVERVIEW")} activeColor={COL_OVERVIEW} />
              <TabButton active={activeTab === "ATTACK"} label="ANFALL" onClick={() => setActiveTab("ATTACK")} activeColor={COL_ATTACK} />
              <TabButton active={activeTab === "DEFENSE"} label="FÖRSVAR" onClick={() => setActiveTab("DEFENSE")} activeColor={COL_DEFENSE} />
              <TabButton active={activeTab === "GOALKEEPER"} label="MÅLVAKT" onClick={() => setActiveTab("GOALKEEPER")} activeColor={COL_GOALIE} />
              <TabButton active={activeTab === "EVENTS"} label="HÄNDELSER" onClick={() => setActiveTab("EVENTS")} activeColor={COL_OVERVIEW} />
          </div>
      </div>

      <div className="print-content" style={{ flex: 1, overflowY: "auto", padding: 16, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          {activeTab === "OVERVIEW" && <OverviewTab />}
          {activeTab === "ATTACK" && <DetailTab data={stats.attack} color={COL_ATTACK} mode="ATTACK_GOAL" events={filteredEvents.filter(e => e.phase === "ATTACK")} />}
          {activeTab === "DEFENSE" && <DetailTab data={stats.defense} color={COL_DEFENSE} mode="DEFENSE" events={filteredEvents.filter(e => e.phase === "DEFENSE")} />}
          {activeTab === "GOALKEEPER" && <GoalkeeperTab data={stats.defense} events={filteredEvents.filter(e => e.phase === "DEFENSE")} />}
          {activeTab === "EVENTS" && <EventList events={filteredEvents} />}
      </div>
    </div>
  );
}