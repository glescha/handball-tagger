import { useState, useEffect, ReactNode } from "react";
import { Header } from "../../components/Layout/Header";
import { CourtLayout } from "../../components/Court/CourtLayout"; 
import { EventList } from "../../components/Panels/EventList";
import { useTaggingLogic } from "../../hooks/useTaggingLogic";

type Props = { 
    matchId: string; 
    onSummary?: () => void; 
    onExit?: () => void; 
};

// --- FÄRGER ---
const C_GOAL = "#22C55E";   
const C_SAVE = "#F97316";   
const C_MISS = "#EAB308";   
const C_PEN  = "#A855F7";   
const C_FREE = "#FFFFFF";   

const DEF_1 = "#FCA5A5"; 
const DEF_2 = "#F87171"; 
const DEF_3 = "#EF4444"; 
const DEF_4 = "#B91C1C"; 

const OFF_1 = "#93C5FD"; 
const OFF_2 = "#60A5FA"; 
const OFF_3 = "#3B82F6"; 
const OFF_4 = "#1E40AF"; 

const COL_ATTACK = "#38BDF8"; 
const COL_DEFENSE = "#EF4444"; 

// --- STYLING KOMPONENTER ---

const Card = ({ children, style, className }: any) => (
    <div className={className} style={{
        background: "#1E293B",
        border: "1px solid #334155",
        borderRadius: 12,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxSizing: "border-box",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        ...style
    }}>
        {children}
    </div>
);

const SectionTitle = ({ children, color = "#94A3B8", rightContent }: { children: ReactNode, color?: string, rightContent?: ReactNode }) => (
    <div style={{ 
        width: "100%",
        padding: "8px 12px",
        background: `linear-gradient(90deg, ${color}20 0%, transparent 100%)`, 
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: 40,
        boxSizing: "border-box",
        borderRadius: "8px 8px 0 0" 
    }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: color === "#ffffff" ? "#fff" : color, textTransform: "uppercase", letterSpacing: 1, lineHeight: 1 }}>{children}</span>
        {rightContent}
    </div>
);

const ActionButton = ({ label, onClick, active = false, tabColor = "#64748B", style }: any) => (
  <button onClick={onClick} style={{
    width: "100%", padding: "12px 2px", borderRadius: 10,
    background: active ? `${tabColor}25` : "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)", borderLeft: `5px solid ${tabColor}`,
    color: active ? "#fff" : "#E2E8F0", fontWeight: 800, 
    fontSize: "clamp(8px, 2vw, 13px)", whiteSpace: "nowrap", 
    cursor: "pointer", transition: "all 0.1s ease",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: active ? `0 0 10px ${tabColor}20` : "none",
    ...style
  }}>{label}</button>
);

export default function LiveTaggingScreen({ matchId, onSummary, onExit }: Props) {
  const { timer, scores, teams, state, actions, events } = useTaggingLogic(matchId);
  const { tempShot } = state;
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [manualTime, setManualTime] = useState("");

  useEffect(() => {
    const savedVib = localStorage.getItem("setting_haptic");
    setVibrationEnabled(savedVib !== "false");

    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const vibrate = (ms: number = 50) => {
      if (vibrationEnabled && navigator.vibrate) navigator.vibrate(ms);
  };

  const wrapAction = (action: () => void) => {
      vibrate(50);
      action();
  };

  const openTimeModal = () => {
      const m = Math.floor(timer.ms / 60000);
      const s = Math.floor((timer.ms % 60000) / 1000);
      setManualTime(`${m}:${s.toString().padStart(2, "0")}`);
      setShowTimeModal(true);
  };

  const saveManualTime = () => {
      const parts = manualTime.split(":");
      if (parts.length === 2) {
          const m = parseInt(parts[0], 10);
          const s = parseInt(parts[1], 10);
          if (!isNaN(m) && !isNaN(s)) {
              timer.setTime((m * 60 + s) * 1000);
          }
      }
      setShowTimeModal(false);
  };

  const activeColor = state.phase === "ATTACK" ? COL_ATTACK : COL_DEFENSE;

  const ShotPanel = (
      <Card style={{ height: "auto", padding: 0, gap: 0 }}>
          <SectionTitle color={activeColor}>Avslut</SectionTitle>
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <ActionButton label="MÅL" onClick={() => wrapAction(() => actions.handleOutcome("GOAL"))} active={tempShot.outcome === "GOAL" && !tempShot.isPenalty} tabColor={C_GOAL} />
                <ActionButton label="RÄDDNING" onClick={() => wrapAction(() => actions.handleOutcome("SAVE"))} active={tempShot.outcome === "SAVE" && !tempShot.isPenalty} tabColor={C_SAVE} />
                <ActionButton label="MISS" onClick={() => wrapAction(() => actions.handleOutcome("MISS"))} active={tempShot.outcome === "MISS" && !tempShot.isPenalty} tabColor={C_MISS} />
                <ActionButton label="STRAFF" onClick={() => wrapAction(actions.startPenalty)} active={tempShot.isPenalty} tabColor={C_PEN} /> 
            </div>
            <div>
                <ActionButton label="FRIKAST" onClick={() => wrapAction(actions.handleFreeThrow)} tabColor={C_FREE} />
            </div>
          </div>
      </Card>
  );

  const TurnoverPanel = (
      <Card style={{ height: "auto", overflow: "hidden", padding: 0, gap: 0 }}>
          <div style={{ flexShrink: 0 }}>
            {state.phase === "ATTACK" ? (
                <>
                    <SectionTitle color={activeColor}>Defensiva Omställningar</SectionTitle>
                    <div style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <ActionButton label="Brytning (M)" onClick={() => wrapAction(() => actions.handleTurnover("STEAL", "Brytning (M)"))} tabColor={OFF_1} />
                        <ActionButton label="Tappad boll" onClick={() => wrapAction(() => actions.handleTurnover("LOST_BALL", "Tappad boll"))} tabColor={OFF_2} />
                        <ActionButton label="Regelfel" onClick={() => wrapAction(() => actions.handleTurnover("TECHNICAL_FAULT", "Regelfel"))} tabColor={OFF_3} />
                        <ActionButton label="Passivt spel" onClick={() => wrapAction(() => actions.handleTurnover("PASSIVE_PLAY", "Passivt spel"))} tabColor={OFF_4} />
                    </div>
                </>
            ) : (
                <>
                    <SectionTitle color={activeColor}>Offensiva Omställningar</SectionTitle>
                    <div style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <ActionButton label="Bollvinst" onClick={() => wrapAction(() => actions.handleTurnover("STEAL", "Bollvinst"))} tabColor={DEF_1} />
                        <ActionButton label="Tappad boll (M)" onClick={() => wrapAction(() => actions.handleTurnover("LOST_BALL", "Tappad boll (M)"))} tabColor={DEF_2} />
                        <ActionButton label="Regelfel (M)" onClick={() => wrapAction(() => actions.handleTurnover("TECHNICAL_FAULT", "Regelfel (M)"))} tabColor={DEF_3} />
                        <ActionButton label="Passivt spel (M)" onClick={() => wrapAction(() => actions.handleTurnover("PASSIVE_PLAY", "Passivt spel (M)"))} tabColor={DEF_4} />
                    </div>
                </>
            )}
          </div>
      </Card>
  );

  const EventsPanel = (
    <Card style={{ height: "auto", overflow: "hidden", padding: 0, gap: 0 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
            <SectionTitle color={activeColor} rightContent={
                    events.length > 0 && (
                        <button onClick={() => wrapAction(actions.undoLastEvent)}
                            style={{ background: "transparent", border: "none", color: "#EF4444", fontSize: 20, fontWeight: 800, padding: 0, cursor: "pointer", display: "flex", alignItems: "center", height: "100%" }}
                            title="Ångra">↶</button>
                    )
                // HÄR ÄR STAVFELSRÄTTELSEN:
                }>Senaste Händelser</SectionTitle>
            
            <div style={{ height: 260, overflowY: "auto", padding: 12 }}>
                <EventList events={events} />
            </div>
        </div>
    </Card>
  );

  const CourtPanel = (
      <Card style={{ 
          padding: 0, overflow: "hidden", position: "relative", background: "#1E293B", border: "1px solid #334155",
          justifyContent: "flex-start", alignItems: "flex-start", height: "auto", width: "100%"  
      }}>
          <div style={{ width: "100%", display: "block" }}>
                <CourtLayout
                    selectedWidthZone={(tempShot.zone as any) || null}
                    selectedDistance={(tempShot.distance as any) || null}
                    selectedGoalCell={(tempShot.goalCell as any) || null}
                    isPenaltyMode={!!tempShot.isPenalty}
                    onSelectShot={(z,d) => wrapAction(() => actions.handleCourtClick(z as any, d as any))}
                    onSelectGoalCell={(c) => wrapAction(() => actions.handleGoalClick(c as any))}
                />
          </div>
      </Card>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0F172A", color: "#F8FAFC", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, zIndex: 50, position: "relative" }}>
          <Header 
            homeTeam={teams.home} awayTeam={teams.away} homeScore={scores.home} awayScore={scores.away}
            period={timer.period as any} timeMs={timer.ms} phase={state.phase}
            onTogglePhase={() => wrapAction(actions.togglePhase)} 
            onToggleClock={() => wrapAction(timer.toggleTimer)} 
            onTogglePeriod={() => wrapAction(() => timer.setPeriod(p => p === 1 ? 2 : 1))}
            onBack={onExit || (() => {})} onSummary={onSummary || (() => {})}
            onAdjustTime={(s) => wrapAction(() => timer.adjustTime(s))}
            onOpenTimeSettings={openTimeModal}
          />
      </div>
      
      <div style={{ 
          overflowY: isPortrait ? "auto" : "hidden", overflowX: "hidden",
          padding: "16px 16px 0 16px", display: "grid", gap: 16,
          gridTemplateColumns: isPortrait ? "100%" : "1fr 2fr 1fr", 
          gridTemplateRows: "auto", 
          alignItems: "start", paddingBottom: 16 
      }}>
          <div style={{ order: isPortrait ? 2 : 1 }}>{ShotPanel}</div>
          <div style={{ order: isPortrait ? 1 : 2 }}>{CourtPanel}</div>
          <div style={{ order: 3, display: "flex", flexDirection: "column", gap: 16 }}>
              {TurnoverPanel}
              {EventsPanel}
          </div>
      </div>

      {(state.isReadyToSave || (tempShot.isPenalty && tempShot.goalCell)) && (
         <>
             <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 99, backdropFilter: "blur(2px)" }} onClick={actions.cancelShot} />
             <div style={{ 
                 position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "90%", maxWidth: 400, 
                 padding: 24, background: "#1E293B", border: "1px solid #334155", borderRadius: 16, 
                 display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)", zIndex: 100
             }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 12 }}>
                     <span style={{ fontWeight: 800, color: "#C084FC", fontSize: 13, textTransform: "uppercase" }}>{tempShot.isPenalty ? "STRAFFKAST" : `ZON ${tempShot.zone} • ${tempShot.distance}`}</span>
                     <span style={{ fontWeight: 900, color: "#fff", fontSize: 18 }}>{!tempShot.isPenalty && (tempShot.outcome === "GOAL" ? "MÅL" : tempShot.outcome === "MISS" ? "MISS" : "RÄDDNING")}</span>
                 </div>
                 
                 {/* HÄR: Visar bara placering om det INTE är miss */}
                 {tempShot.goalCell && tempShot.outcome !== "MISS" && (
                    <div style={{ fontSize: 14, color: "#E2E8F0", textAlign: "center", fontWeight: 600 }}>Placering: Cell {tempShot.goalCell}</div>
                 )}

                {tempShot.isPenalty && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                         <button onClick={() => wrapAction(() => actions.handleOutcome("GOAL"))} style={{ padding: 16, borderRadius: 10, border: "none", fontWeight: 800, cursor: "pointer", background: tempShot.outcome === "GOAL" ? C_GOAL : "rgba(34, 197, 94, 0.1)", color: tempShot.outcome === "GOAL" ? "#000" : C_GOAL, transition: "all 0.2s" }}>MÅL</button>
                         <button onClick={() => wrapAction(() => actions.handleOutcome("SAVE"))} style={{ padding: 16, borderRadius: 10, border: "none", fontWeight: 800, cursor: "pointer", background: tempShot.outcome === "SAVE" ? C_SAVE : "rgba(249, 115, 22, 0.1)", color: tempShot.outcome === "SAVE" ? "#000" : C_SAVE, transition: "all 0.2s" }}>RÄDD</button>
                         <button onClick={() => wrapAction(() => actions.handleOutcome("MISS"))} style={{ padding: 16, borderRadius: 10, border: "none", fontWeight: 800, cursor: "pointer", background: tempShot.outcome === "MISS" ? C_MISS : "rgba(234, 179, 8, 0.1)", color: tempShot.outcome === "MISS" ? "#000" : C_MISS, transition: "all 0.2s" }}>MISS</button>
                    </div>
                )}
                 {!tempShot.isPenalty && tempShot.outcome === "GOAL" && (
                     <div style={{ display: "flex", gap: 8 }}>
                         {[2, 4, 6].map(p => {
                             const labels: Record<number, string> = { 2: "1-2 pass", 4: "3-4 pass", 6: "5+ pass" };
                             return <button key={p} onClick={() => wrapAction(() => actions.handlePasses(p))} style={{ flex: 1, padding: "14px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: tempShot.passes === p ? "#3B82F6" : "rgba(255,255,255,0.05)", color: tempShot.passes === p ? "#fff" : "#94A3B8", fontWeight: 700, fontSize: 12, transition: "all 0.2s" }}>{labels[p]}</button>;
                         })}
                     </div>
                 )}
                 <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                     <button onClick={actions.cancelShot} style={{ flex: 1, padding: 16, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: "transparent", color: "#94A3B8", fontWeight: 800, fontSize: 13 }}>AVBRYT</button>
                     <button disabled={tempShot.isPenalty && !tempShot.outcome} onClick={() => wrapAction(() => actions.commitShot())} style={{ flex: 2, padding: 16, borderRadius: 10, border: "none", cursor: "pointer", background: tempShot.isPenalty ? (tempShot.outcome ? "#A855F7" : "#475569") : (tempShot.outcome === "MISS" ? "#F59E0B" : "#22C55E"), color: "white", fontWeight: 800, fontSize: 14, opacity: (tempShot.isPenalty && !tempShot.outcome) ? 0.5 : 1, boxShadow: "0 4px 12px rgba(0,0,0,0.3)", transition: "transform 0.1s" }}>BEKRÄFTA {tempShot.isPenalty ? "STRAFF" : ""}</button>
                 </div>
             </div>
         </>
      )}

      {showTimeModal && (
          <>
             <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 109, backdropFilter: "blur(2px)" }} onClick={() => setShowTimeModal(false)} />
             <div style={{ 
                 position: "fixed", top: "30%", left: "50%", transform: "translate(-50%, -50%)", width: "80%", maxWidth: 300, 
                 padding: 24, background: "#1E293B", border: "1px solid #334155", borderRadius: 16, 
                 display: "flex", flexDirection: "column", gap: 16, zIndex: 110
             }}>
                 <div style={{ color: "#fff", fontWeight: 800, textAlign: "center" }}>JUSTERA TID (MM:SS)</div>
                 <input 
                    type="text" value={manualTime} onChange={e => setManualTime(e.target.value)} 
                    style={{ background: "#0F172A", border: "1px solid #334155", color: "#fff", padding: 12, fontSize: 24, textAlign: "center", borderRadius: 8 }}
                 />
                 <div style={{ display: "flex", gap: 12 }}>
                     <button onClick={() => setShowTimeModal(false)} style={{ flex: 1, padding: 12, borderRadius: 8, background: "transparent", border: "1px solid #475569", color: "#94A3B8" }}>Avbryt</button>
                     <button onClick={saveManualTime} style={{ flex: 1, padding: 12, borderRadius: 8, background: "#38BDF8", border: "none", color: "#0F172A", fontWeight: 800 }}>Spara</button>
                 </div>
             </div>
          </>
      )}
    </div>
  );
}