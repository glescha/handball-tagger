// FILE: src/components/Panels/ExportButtons.tsx
import { useRef, useState } from "react";
import type { AppEvent } from "../../types";
import { useEvents } from "../../hooks/useEvents";
import { exportCsv } from "../../exportCsv";
import { exportSummaryCsv } from "../../exportSummaryCsv";
import { exportToExcel } from "../../export/exportToExcel";
import { buildExportFilenames } from "../../export/exportFilenames";
import { exportBackupJson } from "../../export/exportBackupJson";
import { importBackupJsonFromText, type ImportMode } from "../../import/importBackupJson";

type ExportButtonsProps = {
  matchId: string;
  events: AppEvent[];
  className?: string;
};

export function ExportButtons({ matchId, events, className }: ExportButtonsProps) {
  const names = buildExportFilenames(matchId);

  const { deleteLastEvent } = useEvents(matchId);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [undoStatus, setUndoStatus] = useState<string | null>(null);

  async function handleImport(mode: ImportMode) {
    setImportStatus(null);
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setImportStatus("Välj en JSON-fil först.");
      return;
    }

    try {
      const text = await file.text();
      const res = await importBackupJsonFromText(text, mode);
      setImportStatus(`Import klar: ${res.count} events (matchId: ${res.matchId}).`);
    } catch (err) {
      setImportStatus(err instanceof Error ? err.message : "Import misslyckades.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleUndoLast() {
    setUndoStatus(null);
    try {
      await deleteLastEvent();
      setUndoStatus("Senaste händelsen togs bort.");
    } catch (err) {
      setUndoStatus(err instanceof Error ? err.message : "Undo misslyckades.");
    }
  }

  return (
    <div className={className} style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="ui-toggle" onClick={() => exportCsv(events, names.eventsCsv)}>
          Export Events (CSV)
        </button>

        <button type="button" className="ui-toggle" onClick={() => exportSummaryCsv(events, names.summaryCsv)}>
          Export Summary (CSV)
        </button>

        <button type="button" className="ui-toggle" onClick={() => exportToExcel({ events, filename: names.excel })}>
          Export Excel
        </button>

        <button
          type="button"
          className="ui-toggle"
          onClick={() => {
            exportCsv(events, names.eventsCsv);
            exportSummaryCsv(events, names.summaryCsv);
            exportToExcel({ events, filename: names.excel });
          }}
        >
          Export All
        </button>

        <button
          type="button"
          className="ui-toggle"
          onClick={() => exportBackupJson(events, matchId, `${names.excel}.json`)}
        >
          Export Backup (JSON)
        </button>

        <button
          type="button"
          className="ui-toggle"
          onClick={handleUndoLast}
          title="Tar bort senaste eventet i matchen"
        >
          Undo last event
        </button>

        {undoStatus && <div style={{ color: "var(--text-muted)", fontWeight: 700 }}>{undoStatus}</div>}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input ref={inputRef} type="file" accept="application/json" />

        <button type="button" className="ui-toggle" onClick={() => handleImport("merge")}>
          Import (Merge)
        </button>

        <button type="button" className="ui-toggle" onClick={() => handleImport("replace")}>
          Import (Replace)
        </button>

        {importStatus && <div style={{ color: "var(--text-muted)", fontWeight: 700 }}>{importStatus}</div>}
      </div>
    </div>
  );
}
