// src/screens/Settings.tsx
import { refreshHapticsSetting } from "../hapticsGlobal";
import { useEffect, useState } from "react";
import { getSetting, setSetting } from "../kv";

export default function Settings(props: { onBack: () => void }) {
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const v = await getSetting("hapticsEnabled", true);
      setHapticsEnabled(!!v);
      setLoaded(true);
    })();
  }, []);

  const onToggle = async () => {
  const next = !hapticsEnabled;
  setHapticsEnabled(next);
  await setSetting("hapticsEnabled", next);
  await refreshHapticsSetting();
};

  return (
    <div className="page">
      <div className="card" style={{ marginTop: 0 }}>
        <div className="row between wrap" style={{ gap: 12 }}>
          <div>
            <h1 style={{ marginBottom: 6 }}>Inställningar</h1>
            <div className="muted">Grundinställningar för appen</div>
          </div>

          <button className="btn" onClick={props.onBack}>
            Tillbaka
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h2>Haptisk feedback</h2>

        {!loaded ? (
          <div className="muted">Läser inställning…</div>
        ) : (
          <div className="row between wrap" style={{ gap: 12, alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600 }}>Vibration vid knapptryck</div>
              <div className="muted">Påverkar alla knappar i appen</div>
            </div>

            <button className={hapticsEnabled ? "btnPrimary" : "btn"} onClick={onToggle}>
              {hapticsEnabled ? "På" : "Av"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
