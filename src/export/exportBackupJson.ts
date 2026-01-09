// FILE: src/export/exportBackupJson.ts
import type { AppEvent } from "../types";

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export type BackupFileV1 = {
  version: 1;
  matchId: string;
  exportedAt: string; // ISO
  events: AppEvent[];
};

export function exportBackupJson(events: AppEvent[], matchId: string, filename: string) {
  const payload: BackupFileV1 = {
    version: 1,
    matchId,
    exportedAt: new Date().toISOString(),
    events,
  };

  downloadText(filename, JSON.stringify(payload, null, 2));
}
