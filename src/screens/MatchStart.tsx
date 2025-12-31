// src/screens/MatchStart.tsx
import { useEffect, useState } from "react";
import type { Match, MatchStatus } from "../types";
import { listMatches, upsertMatch, deleteMatch } from "../matchService";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function safeText(s?: string) {
  return (s ?? "").trim();
}
function displayLine(m: Match) {
  const parts: string[] = [];
  if (m.dateISO) parts.push(m.dateISO);
  if (m.venue) parts.push(m.venue);
  return parts.join(" • ");
}

export default function MatchStart(props: { onStart: (matchId: string) => void }) {
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);

  // Ny match
  const [homeTeam, setHomeTeam] = useState("Hemmalag");
  const [awayTeam, setAwayTeam] = useState("Bortalag");
  const [dateISO, setDateISO] = useState(iso);
  const [venue, setVenue] = useState("");

  // Gamla matcher
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit-läge
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHome, setEditHome] = useState("");
  const [editAway, setEditAway] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editVenue, setEditVenue] = useState("");

  const load = async () => {
    setLoading(true);
    const all = await listMatches();
    setMatches(all);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const start = async () => {
    const matchId = `${dateISO}-${uid()}`;
    const info: Match = {
      matchId,
      homeTeam: safeText(homeTeam) || "Hemmalag",
      awayTeam: safeText(awayTeam) || "Bortalag",
      dateISO,
      venue: safeText(venue) || undefined,
      updatedTs: Date.now(),
      status: "IN_PROGRESS" as MatchStatus,
    };
    await upsertMatch(info);
    props.onStart(matchId);
  };

  const continueMatch = (m: Match) => props.onStart(m.matchId);

  const onDelete = async (m: Match) => {
    const ht = safeText(m.homeTeam) || "Hemmalag";
    const at = safeText(m.awayTeam) || "Bortalag";
    const ok = window.confirm(`Ta bort matchen?\n\n${ht} – ${at}\n${displayLine(m)}`);
    if (!ok) return;
    await deleteMatch(m.matchId);
    if (editingId === m.matchId) setEditingId(null);
    await load();
  };

  // ======= EDIT =======
  function beginEdit(m: Match) {
    setEditingId(m.matchId);
    setEditHome(safeText(m.homeTeam) || "Hemmalag");
    setEditAway(safeText(m.awayTeam) || "Bortalag");
    setEditDate(m.dateISO ?? m.matchId.slice(0, 10)); // fallback
    setEditVenue(safeText(m.venue));
  }

  async function saveEdit(m: Match) {
    const next: Match = {
      ...m,
      homeTeam: safeText(editHome) || "Hemmalag",
      awayTeam: safeText(editAway) || "Bortalag",
      dateISO: safeText(editDate) || m.dateISO,
      venue: safeText(editVenue) || undefined,
      updatedTs: Date.now(),
      status: (m.status ?? "IN_PROGRESS") as MatchStatus,
    };
    await upsertMatch(next);
    setEditingId(null);
    await load();
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return (
    <div className="page">
      <h1>Handball Tagger</h1>

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

      <div className="card" style={{ marginTop: 12 }}>
        <h2>Gamla matcher</h2>
        {loading ? (
          <div className="muted">Laddar…</div>
        ) : matches.length === 0 ? (
          <div className="muted">Inga sparade matcher.</div>
        ) : (
          <div className="list">
            {matches.slice(0, 12).map((m) => {
              const ht = safeText(m.homeTeam) || "Hemmalag";
              const at = safeText(m.awayTeam) || "Bortalag";
              const under = `${m.dateISO ?? m.matchId.slice(0, 10)}${m.venue ? ` • ${m.venue}` : ""}`;

              const isEditing = editingId === m.matchId;

              return (
                <div
                  key={m.matchId}
                  className="listItem"
                  style={{ display: "flex", gap: 10, alignItems: "center" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {!isEditing ? (
                      <button
                        className="btn"
                        style={{ width: "100%", textAlign: "left" }}
                        onClick={() => continueMatch(m)}
                      >
                        <div className="listTitle">
                          {ht} – {at}
                        </div>
                        {/* UNDER-RAD: datum + ev hall. INGET matchId visas. */}
                        <div className="muted">{under}</div>
                      </button>
                    ) : (
                      <div className="card" style={{ margin: 0 }}>
                        <div className="formGrid">
                          <label className="field">
                            <div className="fieldLabel">Hemmalag</div>
                            <input value={editHome} onChange={(e) => setEditHome(e.target.value)} />
                          </label>
                          <label className="field">
                            <div className="fieldLabel">Bortalag</div>
                            <input value={editAway} onChange={(e) => setEditAway(e.target.value)} />
                          </label>
                          <label className="field">
                            <div className="fieldLabel">Datum</div>
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                            />
                          </label>
                          <label className="field">
                            <div className="fieldLabel">Hall (valfritt)</div>
                            <input value={editVenue} onChange={(e) => setEditVenue(e.target.value)} />
                          </label>
                        </div>
                        <div className="row gap wrap" style={{ marginTop: 10 }}>
                          <button className="btnPrimary" onClick={() => saveEdit(m)}>
                            Spara
                          </button>
                          <button className="btn" onClick={cancelEdit}>
                            Avbryt
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <>
                      <button className="btn" onClick={() => beginEdit(m)}>
                        Redigera
                      </button>
                      <button className="btn danger" onClick={() => onDelete(m)}>
                        Ta bort
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
