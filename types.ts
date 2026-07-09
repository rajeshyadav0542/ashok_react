
export interface KpiSampleData {
  labels: string[];
  values: (number | string)[];
}

export interface Kpi {
  kpi_id: string;
  kpi_name: string;
  kpi_category: string;
  kpi_definition: string;
  channel_group: string;
  channel_detail: string;
  pace_pillar: string;
  kpi_type: string;
  kpi_sqlMacro: string;
  kpi_sampleData: KpiSampleData;
  kpi_relevance: string[];
  [key: string]: any;
}

export interface PersonaKbqItem {
  kbq: string;
  kpis: string[];
  kpi_ids?: string[];
}

export interface MappedPersonaKbqItem extends PersonaKbqItem {
  kpi_ids: string[];
}

export interface PersonaKbq {
  [persona: string]: PersonaKbqItem[];
}

export interface MappedPersonaKbq {
  [persona: string]: MappedPersonaKbqItem[];
}

export interface CesAction {
  id: string;
  label: string;
  basePoints: number;
  cap: number;
  weight: number;
  kpi: string;
}

export interface Hcp {
  id: string;
  name: string;
  specialty: string;
  region: string;
  web_key: number;
  form: number;
  rte_click: number;
  docnews: number;
  sermo: number;
  event_att: number;
  clm: number;
  ehr: number;
  paid_conv: number;
  rte_open: number;
  [key: string]: any;
}

export interface ScoredHcp extends Hcp {
  score: number;
}

export interface Benchmark {
  channel: string;
  metric: string;
  benchmark: string;
  notes: string;
}

export interface QcResult {
    errors: string[];
    warnings: string[];
}
