import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
// Importera den nya loggan
import { Logo } from "../components/Visuals/Logo";

type Props = {
  onStartMatch: (matchId: string) => void;
  onSettings?: () => void;
};

// Generisk GradientCard
const GradientCard = ({ title, bg, txt, children }: { title: string, bg: string, txt: string, children: React.ReactNode }) => (
    <div style={{
        background: "#1E293B",
        border: "1px solid #334155",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
    }}>
        <div style={{
            background: bg,
            padding: "12px 16px",
            borderBottom: "1px solid #334155",
            fontSize: 12, fontWeight: 800, color: txt, letterSpacing: 1, textTransform: "uppercase"
        }}>
            {title}
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {children}
        </div>
    </div>
);

export default function HomeScreen({ onStartMatch }: Props) {
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [savedMatches, setSavedMatches] = useState<any[]>([]);
  
  const lang = localStorage.getItem("setting_language") || "sv";
  const t = {
      newMatch: lang === "en" ? "NEW MATCH" : "NY MATCH",
      prevMatch: lang === "en" ? "PREVIOUS MATCHES" : "TIDIGARE MATCHER",
      home: lang === "en" ? "Home Team" : "Hemmalag",
      away: lang === "en" ? "Away Team" : "Bortalag",
      start: lang === "en" ? "START MATCH" : "STARTA MATCH",
      noHistory: lang === "en" ? "No saved matches yet" : "Inga sparade matcher än"
  };

  useEffect(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("match_") && k.endsWith("_info"));
    const matches = keys.map(k => {
        try {
            const info = JSON.parse(localStorage.getItem(k) || "{}");
            const scores = JSON.parse(localStorage.getItem(k.replace("_info", "_scores")) || '{"home":0,"away":0}');
            return { ...info, scores };
        } catch (e) { return null; }
    }).filter(Boolean).sort((a, b) => b.date - a.date);
    setSavedMatches(matches);

    const defaultHome = localStorage.getItem("setting_defaultHomeTeam");
    if (defaultHome) {
        setHomeTeam(defaultHome);
    }
  }, []);

  const handleStart = () => {
    if (!homeTeam || !awayTeam) return;
    const matchId = uuidv4();
    const info = { id: matchId, homeTeam, awayTeam, date: Date.now() };
    localStorage.setItem(`match_${matchId}_info`, JSON.stringify(info));
    onStartMatch(matchId);
  };

  const handleDelete = (id: string, e: any) => {
      e.stopPropagation();
      const confirmDelete = localStorage.getItem("setting_confirm_delete") !== "false";
      if (confirmDelete && !confirm(lang === "en" ? "Delete match?" : "Radera match?")) return;

      Object.keys(localStorage).forEach(k => {
          if (k.includes(id)) localStorage.removeItem(k);
      });
      setSavedMatches(prev => prev.filter(m => m.id !== id));
  };

  const isFormValid = homeTeam && awayTeam;

  return (
    <div style={{ 
        height: "100vh", display: "flex", flexDirection: "column", 
        background: "#0F172A", color: "#F8FAFC", overflowY: "auto",
        padding: "24px 20px"
    }}>
      
      {/* HEADER MED STOR LOGO */}
      <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          marginBottom: 0,
          width: "100%",
          maxWidth: 400, // Begränsa bredden lite på stora skärmar
          alignSelf: "center"
      }}>
          {/* Logo-komponenten hanterar sin egen storlek och text */}
          <Logo style={{ width: "100%", height: "auto", minHeight: 80 }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 500, margin: "0 auto", width: "100%" }}>
          
          {/* NY MATCH */}
          <GradientCard 
            title={t.newMatch} 
            bg="linear-gradient(90deg, rgba(56, 189, 248, 0.2) 0%, transparent 100%)" 
            txt="#fff"
          >
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>{t.home}</label>
                      <input 
                        type="text" value={homeTeam} onChange={e => setHomeTeam(e.target.value)} 
                        placeholder={lang === "en" ? "Name..." : "T.ex. Önnered"}
                        style={{ 
                            background: "#334155", border: "1px solid #475569", borderRadius: 8, padding: "12px", 
                            color: "#fff", fontSize: 16, fontWeight: 600, outline: "none"
                        }}
                      />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>{t.away}</label>
                      <input 
                        type="text" value={awayTeam} onChange={e => setAwayTeam(e.target.value)} 
                        placeholder={lang === "en" ? "Name..." : "T.ex. Sävehof"}
                        style={{ 
                            background: "#334155", border: "1px solid #475569", borderRadius: 8, padding: "12px", 
                            color: "#fff", fontSize: 16, fontWeight: 600, outline: "none"
                        }}
                      />
                  </div>
              </div>
              
              <button 
                onClick={handleStart} 
                disabled={!isFormValid}
                style={{
                    background: isFormValid 
                        ? "#38BDF8" 
                        : "linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0.0) 100%)",
                    border: isFormValid ? "none" : "1px solid rgba(56, 189, 248, 0.25)",
                    color: "#fff",
                    padding: "16px", borderRadius: 12, 
                    fontWeight: 800, fontSize: 14, letterSpacing: 0.5,
                    cursor: isFormValid ? "pointer" : "not-allowed",
                    transition: "all 0.3s ease", 
                    marginTop: 8,
                    boxShadow: isFormValid ? "0 4px 15px rgba(56, 189, 248, 0.4)" : "none",
                    opacity: isFormValid ? 1 : 0.7
                }}
              >
                  {t.start}
              </button>
          </GradientCard>

          {/* TIDIGARE MATCHER */}
          <GradientCard 
            title={t.prevMatch} 
            bg="linear-gradient(90deg, rgba(56, 189, 248, 0.2) 0%, transparent 100%)" 
            txt="#fff"
          >
              {savedMatches.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "#64748B", fontSize: 14 }}>
                      {t.noHistory}
                  </div>
              ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {savedMatches.map((m) => (
                          <div 
                            key={m.id} onClick={() => onStartMatch(m.id)}
                            style={{ 
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                background: "linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0.0) 100%)",
                                border: "1px solid rgba(56, 189, 248, 0.25)",
                                borderRadius: 10, padding: "12px 16px",
                                cursor: "pointer", transition: "all 0.2s"
                            }}
                          >
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>
                                      {m.homeTeam} <span style={{ color: "#64748B", margin: "0 4px" }}>vs</span> {m.awayTeam}
                                  </div>
                                  <div style={{ fontSize: 11, color: "#94A3B8" }}>
                                      {new Date(m.date).toLocaleDateString()} • {m.scores?.home || 0}-{m.scores?.away || 0}
                                  </div>
                              </div>
                              <button 
                                onClick={(e) => handleDelete(m.id, e)}
                                style={{ 
                                    background: "rgba(239, 68, 68, 0.1)", border: "none", borderRadius: 6,
                                    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", color: "#EF4444", fontSize: 16
                                }}
                              >
                                  ×
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </GradientCard>

      </div>
    </div>
  );
}