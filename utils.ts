
import { Kpi, QcResult, PersonaKbq, MappedPersonaKbq, Hcp, CesAction } from './types';
import { toast } from './components';

export function downloadCSV(filename: string, rows: any[]) {
  if (!rows || rows.length === 0) { 
    toast.error("No rows to export"); 
    return; 
  }
  const headers = Object.keys(rows[0] || {});
  const csv = [
    headers.join(","),
    ...rows.map(r => 
      headers.map(h => JSON.stringify(r[h] ?? "")).join(",")
    )
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function qcCatalog(kpis: Kpi[]): QcResult {
  const required = ["kpi_id", "kpi_name", "kpi_category", "kpi_definition", "kpi_sqlMacro", "kpi_sampleData", "kpi_relevance"];
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  
  kpis.forEach(k => {
    if (ids.has(k.kpi_id)) {
      errors.push(`Duplicate kpi_id: ${k.kpi_id}`);
    }
    ids.add(k.kpi_id);
  });

  kpis.forEach(k => {
    required.forEach(f => {
      if (k[f] === undefined || k[f] === null) {
        errors.push(`${k.kpi_id} missing ${f}`);
      }
    });
  });

  const validCats = new Set(["Awareness", "Engagement", "Conversion", "Adherence"]);
  kpis.forEach(k => {
    if (!validCats.has(k.kpi_category)) {
      warnings.push(`${k.kpi_id} uses non-standard category '${k.kpi_category}'`);
    }
  });

  return { errors, warnings };
}

export function buildPersonaMap(kpiCatalog: Kpi[], personaKbq: PersonaKbq): MappedPersonaKbq {
  const byName = Object.fromEntries(kpiCatalog.map(k => [k.kpi_name, k.kpi_id]));
  const mapped = Object.fromEntries(
    Object.entries(personaKbq).map(([persona, rows]) => [
      persona,
      rows.map(r => ({
        ...r,
        kpi_ids: r.kpis.map(name => byName[name]).filter(Boolean)
      }))
    ])
  );
  return mapped;
}

export function scoreHcp(hcp: Hcp, actions: CesAction[]): number {
  let total = 0;
  actions.forEach(a => {
    const count = Math.max(0, Math.min(hcp[a.id] ?? 0, a.cap));
    const contribution = (count * a.basePoints) * a.weight;
    total += contribution;
  });
  const maxTheoretical = actions.reduce((sum, a) => sum + (a.cap * a.basePoints * a.weight), 0);
  if (maxTheoretical === 0) return 0;
  const score = Math.min(100, Math.round((total / maxTheoretical) * 100));
  return score;
}
