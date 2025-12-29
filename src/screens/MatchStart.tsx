import { useMemo, useState } from "react";
import { createMatch, listMatches, deleteMatch } from "../eventService";

function dateCode(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${dd}`;
}

function slug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replaceAll("å", "a")
    .replaceAll("ä", "a")
    .replaceAll("ö", "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function MatchStart(props: { onStart: (matchId: string) => void }) {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [recent, setRecent] = useState<{ id: string; title: string; dateISO: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const code = dateCode();
  const fileName = useMemo(() => {
    const h = slug(home || "hemmalag");
    const a = slug(away || "bortalag");
    return `${code}_${h}-${a}`;
  }, [home, away, code]);

  async function refresh() {
    const items = await listMatches(20);
    setRecent(items as any);
  }

  useMemo(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate() {
    const h = home.trim();
    const a = away.trim();
    if (!h || !a) return;

    setLoading(true);
    const title = `${h} - ${a}`;
    const dateISO = new Date().toISOString().slice(0, 10);
    const m = await createMatch(title, dateISO);
    setLoading(false);
    props.onStart(m.id);
  }

  return (
    <div className="page">
      <div className="startHero">
  <h1 className="startTitle">Handball Tagger</h1>
</div>
      <h2>Starta match</h2>

      <div className="card">
        <label className="lbl">Hemmalag</label>
        <input value={home} onChange={e => setHome(e.target.value)} placeholder="t.ex. Hammarby" />

        <label className="lbl top">Bortalag</label>
        <input value={away} onChange={e => setAway(e.target.value)} placeholder="t.ex. Sävehof" />

        <div className="muted top">Filnamn: {fileName}</div>

        <div className="row gap top">
          <button className="primary big" disabled={loading || !home.trim() || !away.trim()} onClick={onCreate}>
            {loading ? "Skapar…" : "Starta taggning"}
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Tidigare matcher</h2>
        {recent.length === 0 ? (
          <div className="muted">Inga matcher sparade.</div>
        ) : (
          <div className="recent2">
            {recent.map(m => (
              <div key={m.id} className="recentRow">
                <div className="recentTime">{m.dateISO}</div>
                <div className="recentMeta">
                  <span className="pill subtle">{m.title}</span>
                  <button className="subtle" onClick={() => props.onStart(m.id)}>
                    Öppna
                  </button>
                  <button
                    className="danger"
                    onClick={async () => {
                      await deleteMatch(m.id);
                      refresh();
                    }}
                  >
                    Ta bort
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}