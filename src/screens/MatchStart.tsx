// src/screens/MatchStart.tsx
import { useMemo, useState } from "react";
import type { MatchInfo } from "../types";
import { listMatches, upsertMatch } from "../eventService";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function MatchStart(props: { onStart: (matchId: string) => void }) {
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);

  const [homeTeam, setHomeTeam] = useState("Hemmalag");
  const [awayTeam, setAwayTeam] = useState("Bortalag");
  const [dateISO, setDateISO] = useState(iso);
  const [venue, setVenue] = useState("");

  const matches = useMemo(() => listMatches(), []);

  const start = () => {
    const matchId = `${dateISO}-${uid()}`;
    const info: MatchInfo = { matchId, homeTeam, awayTeam, dateISO, venue: venue || undefined };
    upsertMatch(info);
    props.onStart(matchId);
  };

  const continueMatch = (m: MatchInfo) => props.onStart(m.matchId);

  return (
    <div className="page">
      <h1>Handball</h1>

      <div className="card">
        <h2>Matchinfo</h2>

        <div className="formGrid">
          <label className="field">
            <div className="fieldLabel">Hemmalag</div>
            <input value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
          </label>

          <label className="field">
            <div className="fieldLabel">Bortalag</div>
            <input value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
          </label>

          <label className="field">
            <div className="fieldLabel">Datum</div>
            <input type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} />
          </label>

          <label className="field">
            <div className="fieldLabel">Hall (valfritt)</div>
            <input value={venue} onChange={(e) => setVenue(e.target.value)} />
          </label>
        </div>

        <div className="row gap wrap" style={{ marginTop: 12 }}>
          <button className="btnPrimary" onClick={start}>
            Starta match
          </button>
        </div>
      </div>

      {matches.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <h2>Fortsätt match</h2>
          <div className="list">
            {matches.slice(0, 6).map((m) => (
              <button key={m.matchId} className="listItem" onClick={() => continueMatch(m)}>
                <div className="listTitle">
                  {m.homeTeam} – {m.awayTeam}
                </div>
                <div className="muted">
                  {m.dateISO} {m.venue ? `• ${m.venue}` : ""} • {m.matchId}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}