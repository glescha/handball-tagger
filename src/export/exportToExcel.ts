// src/export/exportToExcel.ts
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { computeSummaryPack, filterEventsByScope, type Scope } from "../computeSummary";
import { listEvents } from "../eventService";
import type { MatchEvent, TeamContext } from "../types";

type Ctx = TeamContext;

function n(v: unknown) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function ctxLabel(ctx: Ctx) {
  return ctx === "ANFALL" ? "Anfall" : "Försvar";
}

function scopeLabel(scope: Scope) {
  if (scope === "P1") return "H1";
  if (scope === "P2") return "H2";
  return "ALL";
}

function buildRows(pack: ReturnType<typeof computeSummaryPack>, events: MatchEvent[], ctx: Ctx, scope: Scope) {
  const rows: Array<Record<string, any>> = [];

  // Överblick
  const shots = (() => {
    let goals = 0,
      saves = 0,
      misses = 0;
    for (const e of events) {
      if ((e as any).ctx !== ctx) continue;
      if ((e as any).type !== "SHOT_PLAY") continue;
      const o = (e as any).outcome;
      if (o === "MAL") goals++;
      else if (o === "RADDNING") saves++;
      else if (o === "MISS") misses++;
    }
    const total = goals + saves + misses;
    return { goals, saves, misses, total };
  })();

  const b = pack.turnovers[ctx];
  const omstTotal = n(b.Brytning) + n(b["Tappad boll"]) + n(b.Regelfel) + n(b["Passivt spel"]);
  const attacks = shots.total + omstTotal;

  rows.push({
    Sektion: "Överblick",
    Kontext: ctxLabel(ctx),
    Period: scopeLabel(scope),
    Anfall: attacks,
    Avslut: shots.total,
    Mål: shots.goals,
    Räddningar: shots.saves,
    Miss: shots.misses,
    Frikast: n(pack.freeThrows[ctx]),
    Omställning: omstTotal,
  });

  // Avslut (zon x avstånd)
  for (const z of [1, 2, 3] as const) {
    for (const d of ["6m", "9m"] as const) {
      rows.push({
        Sektion: "Avslut",
        Kontext: ctxLabel(ctx),
        Period: scopeLabel(scope),
        Zon: z,
        Avstånd: d,
        Mål: n(pack.shotsPlay[ctx][z][d]["MAL"]),
        Räddning: n(pack.shotsPlay[ctx][z][d]["RADDNING"]),
      });
    }
  }

  // Placering i mål (1–9)
  for (const k of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
    rows.push({
      Sektion: "Placering i mål",
      Kontext: ctxLabel(ctx),
      Period: scopeLabel(scope),
      Ruta: k,
      Antal: n((pack.heatmap as any)[ctx]?.[k] ?? 0),
    });
  }

  // Antal pass innan mål
  const pass2 = n(pack.shortAttacks[ctx]["<2"]);
  const pass4 = n(pack.shortAttacks[ctx]["<4"]);
  const passMore = n(pack.shortAttacks[ctx]["FLER"]);
  rows.push({ Sektion: "Antal pass innan mål", Kontext: ctxLabel(ctx), Period: scopeLabel(scope), Bucket: "<2", Antal: pass2 });
  rows.push({ Sektion: "Antal pass innan mål", Kontext: ctxLabel(ctx), Period: scopeLabel(scope), Bucket: "<4", Antal: pass4 });
  rows.push({ Sektion: "Antal pass innan mål", Kontext: ctxLabel(ctx), Period: scopeLabel(scope), Bucket: "FLER", Antal: passMore });

  // Omställning
  rows.push({ Sektion: "Omställning", Kontext: ctxLabel(ctx), Period: scopeLabel(scope), Typ: "Brytning", Antal: n(b.Brytning) });
  rows.push({ Sektion: "Omställning", Kontext: ctxLabel(ctx), Period: scopeLabel(scope), Typ: "Tappad boll", Antal: n(b["Tappad boll"]) });
  rows.push({ Sektion: "Omställning", Kontext: ctxLabel(ctx), Period: scopeLabel(scope), Typ: "Regelfel", Antal: n(b.Regelfel) });
  rows.push({ Sektion: "Omställning", Kontext: ctxLabel(ctx), Period: scopeLabel(scope), Typ: "Passivt spel", Antal: n(b["Passivt spel"]) });

  return rows;
}

export async function exportToExcel(matchId: string) {
  const events = await listEvents(matchId);

  const wb = XLSX.utils.book_new();

  const scopes: Scope[] = ["ALL", "P1", "P2"];
  const ctxs: Ctx[] = ["ANFALL", "FORSVAR"];

  for (const scope of scopes) {
    const scoped = filterEventsByScope(events, scope);
    const pack = computeSummaryPack(scoped);

    for (const ctx of ctxs) {
      const sheetName = `${ctxLabel(ctx)} ${scopeLabel(scope)}`;
      const rows = buildRows(pack, scoped, ctx, scope);
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  }

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `handball_${matchId}.xlsx`);
}
