import { useState } from "react"; // Tog bort useEffect
import { exportAllDataToJson } from "../export/exportBackupJson"; 
import { LogoSymbol } from "../components/Visuals/LogoSymbolIcon";

type Props = {
  onBack: () => void;
};

// --- KOMPONENTER ---

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

const Toggle = ({ value, onToggle }: { value: boolean, onToggle: () => void }) => (
    <div 
        onClick={onToggle}
        style={{
            width: 44,
            height: 24,
            background: value ? "#38BDF8" : "#334155", 
            borderRadius: 999,
            position: "relative",
            cursor: "pointer",
            transition: "background 0.2s ease"
        }}
    >
        <div style={{
            width: 20,
            height: 20,
            background: "#fff",
            borderRadius: "50%",
            position: "absolute",
            top: 2,
            left: value ? 22 : 2, 
            transition: "left 0.2s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
        }} />
    </div>
);

export default function Settings({ onBack }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(() => localStorage.getItem("setting_confirm_delete") !== "false");
  const [vibration, setVibration] = useState(() => localStorage.getItem("setting_vibration") !== "false");
  const [language, setLanguage] = useState(() => localStorage.getItem("setting_language") || "sv");
  const [defaultHomeTeam, setDefaultHomeTeam] = useState(() => localStorage.getItem("setting_defaultHomeTeam") || "");

  const toggleConfirm = () => {
    const newVal = !confirmDelete;
    setConfirmDelete(newVal);
    localStorage.setItem("setting_confirm_delete", String(newVal));
  };

  const toggleVibration = () => {
    const newVal = !vibration;
    setVibration(newVal);
    localStorage.setItem("setting_vibration", String(newVal));
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("setting_language", lang);
    if (confirm("För att byta språk fullständigt krävs en omladdning. Ladda om nu?")) {
        window.location.reload();
    }
  };

  const handleDefaultTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setDefaultHomeTeam(val);
      localStorage.setItem("setting_defaultHomeTeam", val);
  };

  const t = language === "en" ? {
      title: "SETTINGS",
      back: "BACK",
      pref: "PREFERENCES",
      custom: "CUSTOMIZATION",
      data: "DATA & BACKUP",
      delete: "Confirm match deletion",
      vib: "Haptic feedback",
      lang: "Language",
      team: "Default Home Team",
      teamDesc: "Auto-filled when creating new match",
      backupBtn: "Download Backup (JSON)",
      backupDesc: "Save all matches and settings to a file."
  } : {
      title: "INSTÄLLNINGAR",
      back: "TILLBAKA",
      pref: "PREFERENSER",
      custom: "ANPASSNING",
      data: "DATA & BACKUP",
      delete: "Bekräfta radering av match",
      vib: "Vibration vid klick",
      lang: "Språk",
      team: "Förifyllt Hemmalag",
      teamDesc: "Fylls i automatiskt vid ny match",
      backupBtn: "Ladda ner Backup (JSON)",
      backupDesc: "Spara alla matcher och inställningar till en fil."
  };

  return (
    <div style={{ 
        height: "100vh", display: "flex", flexDirection: "column", 
        background: "#0F172A", color: "#F8FAFC", overflowY: "auto",
        padding: "24px 20px"
    }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, maxWidth: 500, margin: "0 auto 32px auto", width: "100%" }}>
        <button 
            onClick={onBack} 
            style={{ 
                background: "none", border: "none", color: "#94A3B8", 
                fontSize: 16, fontWeight: 800, cursor: "pointer", 
                display: "flex", alignItems: "center", gap: 8 
            }}
        >
            ← {t.back}
        </button>

        {/* LOGO & TITEL */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LogoSymbol height={32} />
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 1, color: "#fff" }}>
                {t.title}
            </div>
        </div>

        <div style={{ width: 60 }}></div> 
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 500, margin: "0 auto", width: "100%" }}>
        
        {/* PREFERENSER */}
        <GradientCard title={t.pref} bg="linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)" txt="#fff">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0F172A", padding: 12, borderRadius: 8, border: "1px solid #334155" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t.delete}</span>
                <Toggle value={confirmDelete} onToggle={toggleConfirm} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0F172A", padding: 12, borderRadius: 8, border: "1px solid #334155" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t.vib}</span>
                <Toggle value={vibration} onToggle={toggleVibration} />
            </div>
        </GradientCard>

        {/* ANPASSNING */}
        <GradientCard title={t.custom} bg="linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)" txt="#fff">
            
            {/* Språk */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>{t.lang}</span>
                <div style={{ display: "flex", background: "#0F172A", padding: 4, borderRadius: 8, border: "1px solid #334155" }}>
                    <button 
                        onClick={() => changeLanguage("sv")}
                        style={{ 
                            flex: 1, padding: "10px", borderRadius: 6, border: "none", fontWeight: 800, cursor: "pointer", fontSize: 13,
                            background: language === "sv" ? "#38BDF8" : "transparent",
                            color: language === "sv" ? "#0F172A" : "#94A3B8"
                        }}
                    >
                        SVENSKA
                    </button>
                    <button 
                        onClick={() => changeLanguage("en")}
                        style={{ 
                            flex: 1, padding: "10px", borderRadius: 6, border: "none", fontWeight: 800, cursor: "pointer", fontSize: 13,
                            background: language === "en" ? "#38BDF8" : "transparent",
                            color: language === "en" ? "#0F172A" : "#94A3B8"
                        }}
                    >
                        ENGLISH
                    </button>
                </div>
            </div>

            <div style={{ height: 1, background: "#334155" }} />

            {/* Default Team */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>{t.team}</span>
                <input 
                    value={defaultHomeTeam}
                    onChange={handleDefaultTeamChange}
                    placeholder="T.ex. Mitt Lag IF"
                    style={{ 
                        background: "#0F172A", border: "1px solid #475569", borderRadius: 8, padding: "12px", 
                        color: "#fff", fontSize: 16, fontWeight: 600, outline: "none" 
                    }}
                />
                <span style={{ fontSize: 11, color: "#64748B" }}>{t.teamDesc}</span>
            </div>
        </GradientCard>

        {/* DATA & BACKUP */}
        <GradientCard title={t.data} bg="linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)" txt="#fff">
            <button 
                onClick={exportAllDataToJson}
                style={{ 
                    padding: 16, background: "#334155", color: "#fff", border: "1px solid #475569", 
                    borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    width: "100%"
                }}
            >
                💾 {t.backupBtn}
            </button>
            <p style={{ fontSize: 12, color: "#64748B", margin: 0, textAlign: "center" }}>
                {t.backupDesc}
            </p>
        </GradientCard>

        <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 11, color: "#475569", fontWeight: 700 }}>
            <LogoSymbol height={20} animated={false} />
            <span>HANDBOLL TAGGER v{import.meta.env.VITE_APP_VERSION || "Dev"}</span>
        </div>

      </div>
    </div>
  );
}