import { useState, useEffect } from "react";
import { createMatch, listMatches, deleteMatch } from "../services/matchService";
// FIX: Importera från rätt fil
import type { Match } from "../types/AppEvents";

type Props = {
  onStartMatch: (matchId: string) => void;
};

export default function MatchStart({ onStartMatch }: Props) {
  const [home, setHome] = useState("Hemmalag");
  const [away, setAway] = useState("Bortalag");
  const [history, setHistory] = useState<Match[]>([]);

  // Ladda historik
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const matches = await listMatches();
    setHistory(matches);
  };

  const handleStart = async () => {
    if (!home || !away) return;
    
    try {
      // FIX: Använd 'date' (string) istället för 'time' (number)
      const match = await createMatch({
        homeTeam: home,
        awayTeam: away,
        date: new Date().toISOString(), 
        matchId: crypto.randomUUID() // Generera ID här om servicen kräver det, annars sköter servicen det
      });
      
      // Starta matchen med det nya ID:t
      onStartMatch(match.matchId);
    } catch (e) {
      console.error("Kunde inte starta match:", e);
      alert("Fel vid start av match. Kontrollera konsolen.");
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (confirm("Vill du ta bort denna match?")) {
      await deleteMatch(id);
      loadHistory();
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto", color: "#E2E8F0" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>Ny Match</h1>
      
      <div style={{ display: "grid", gap: 16, marginBottom: 30 }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14, color: "#94A3B8" }}>Hemmalag</label>
          <input 
            value={home}
            onChange={e => setHome(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #334155", background: "#1E293B", color: "white", fontSize: 16 }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14, color: "#94A3B8" }}>Bortalag</label>
          <input 
            value={away}
            onChange={e => setAway(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #334155", background: "#1E293B", color: "white", fontSize: 16 }}
          />
        </div>

        <button 
          onClick={handleStart}
          style={{ padding: 16, background: "#4CAF50", color: "white", border: "none", borderRadius: 8, fontSize: 18, fontWeight: "bold", cursor: "pointer", marginTop: 10 }}
        >
          STARTA MATCH
        </button>
      </div>

      <div style={{ borderTop: "1px solid #334155", paddingTop: 20 }}>
        <h3 style={{ color: "#94A3B8", fontSize: 14, textTransform: "uppercase" }}>Tidigare matcher</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
          {history.length === 0 && <div style={{ color: "#64748B" }}>Ingen historik än.</div>}
          
          {history.map(m => (
            <div key={m.matchId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1E293B", padding: 12, borderRadius: 8 }}>
              <div onClick={() => onStartMatch(m.matchId)} style={{ cursor: "pointer", flex: 1 }}>
                <div style={{ fontWeight: "bold" }}>{m.homeTeam} vs {m.awayTeam}</div>
                {/* FIX: Använd m.date istället för m.time */}
                <div style={{ fontSize: 12, color: "#94A3B8" }}>{new Date(m.date).toLocaleString()}</div>
              </div>
              <button 
                onClick={() => handleDelete(m.id)}
                style={{ background: "transparent", border: "1px solid #EF4444", color: "#EF4444", borderRadius: 4, padding: "4px 8px", cursor: "pointer", marginLeft: 10 }}
              >
                Radera
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}