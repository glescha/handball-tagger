// FILE: src/components/Panels/ShotSummaryPanel.tsx
import { useMemo } from "react";
import type { AppEvent, ShotDistance } from "../../types";
import { computeShotSummary } from "../../computeShotSummary";

type ShotSummaryPanelProps = {
  events: AppEvent[];
};

function StatRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0" }}>
      <div style={{ color: "var(--text-muted)", fontWeight: 700 }}>{label}</div>
      <div style={{ fontVariantNumeric: "tabular-nums", fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function distLabel(d: ShotDistance) {
  return d.toUpperCase();
}

export function ShotSummaryPanel({ events }: ShotSummaryPanelProps) {
  const s = useMemo(() => computeShotSummary(events), [events]);

  return (
    <div
      style={{
        background: "var(--panel-bg)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 14,
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ fontWeight: 950, fontSize: 16 }}>Skottstatistik</div>

      <div style={{ display: "grid", gap: 6 }}>
        <StatRow label="Totalt" value={s.total} />
        <StatRow label="Mål" value={s.goals} />
        <StatRow label="Miss" value={s.misses} />
        <StatRow label="Räddning" value={s.saves} />
      </div>

      <div style={{ height: 1, background: "var(--divider)" }} />

      <div>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Per avstånd</div>
        {Object.entries(s.byDistance).map(([d, v]) => (
          <div key={d} style={{ display: "grid", gap: 4, padding: "6px 0" }}>
            <div style={{ fontWeight: 900 }}>{distLabel(d as ShotDistance)}</div>
            <div style={{ display: "grid", gap: 2 }}>
              <StatRow label="Totalt" value={v.total} />
              <StatRow label="Mål" value={v.goals} />
              <StatRow label="Miss" value={v.misses} />
              <StatRow label="Räddning" value={v.saves} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
