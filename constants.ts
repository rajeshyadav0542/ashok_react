
import { Kpi, PersonaKbq, CesAction, Hcp, Benchmark } from './types';

export const KPI_CATALOG: Kpi[] = [

];

export const PERSONA_KBQ: PersonaKbq = {
  Executive: [
    { kbq: "What is the trend of HCP movement across funnel stages?", kpis: ["# HCPs Moved Across Stages", "Regional Stage Shift (# HCPs)"] },
    { kbq: "How much time it takes for HCPs to move down the adoption ladder?", kpis: ["Average Time in Stage (Months)", "Journey Velocity (Days to Rx)"] },
    { kbq: "What is the trend of engagement across journey stages?", kpis: ["Unified Engagement Score (HCP)", "Engagement Score Change (Δ)"] },
    { kbq: "What is the split of going well vs leakage?", kpis: ["Leakage Rate (Backward %)", "Journey Completion Rate"] },
    { kbq: "How Star Targets and Early Adopters performing?", kpis: ["Unified Engagement Score (HCP)", "Change in Rx per HCP"] },
    { kbq: "How are HCPs performing across various regions?", kpis: ["Regional Stage Shift (# HCPs)", "Engagement Score Change (Δ)"] },
  ],
  "Brand/Omni Lead": [
    { kbq: "How many unique HCPs are in a particular stage & trend?", kpis: ["# HCPs Moved Across Stages", "Regional Stage Shift (# HCPs)"] },
    { kbq: "How are HCPs moving across funnel (trialists/loyalists/new writers ↔ abandonment)?", kpis: ["# HCPs Moved Across Stages", "Leakage Rate (Backward %)"] },
    { kbq: "What is the average time spent in each stage?", kpis: ["Average Time in Stage (Months)"] },
    { kbq: "For each segment, what is engagement by channel/category/indication?", kpis: ["Unified Engagement Score (HCP)", "W-Shaped Contribution"] },
    { kbq: "What channels/messages resonate by stage?", kpis: ["Key Content Engagement Rate", "LinkedIn Lead Gen CVR", "DocNews Click Rate", "Sermo Poll Completion Rate"] },
    { kbq: "What is the Journey Completion Rate & touches needed?", kpis: ["Journey Completion Rate", "Audience Overlap Index"] },
  ],
  Analyst: [
    { kbq: "How many unique HCPs are in a stage & trend?", kpis: ["# HCPs Moved Across Stages"] },
    { kbq: "Average time in each stage?", kpis: ["Average Time in Stage (Months)"] },
    { kbq: "How are HCPs moving across funnel stages?", kpis: ["# HCPs Moved Across Stages", "Leakage Rate (Backward %)"] },
    { kbq: "Are prescriptions per HCP increasing?", kpis: ["Change in Rx per HCP", "TRx Lift (Test vs Control)"] },
    { kbq: "How deeply engaged are HCPs?", kpis: ["Unified Engagement Score (HCP)", "Key Content Engagement Rate"] },
    { kbq: "What channels/messages are resonating by stage?", kpis: ["LinkedIn Lead Gen CVR", "DocNews Click Rate", "Sermo Poll Completion Rate"] },
    { kbq: "Journey Completion & # engagements?", kpis: ["Journey Completion Rate", "Audience Overlap Index"] },
  ],
};

export const CES_ACTIONS: CesAction[] = [
  { id: "web_key", label: "Web: Key Content Interactions", basePoints: 3, cap: 6, weight: 0.15, kpi: "Key Content Engagement Rate" },
  { id: "form", label: "Web: HCP Form Completions", basePoints: 10, cap: 3, weight: 0.20, kpi: "Form Completion Rate (HCP)" },
  { id: "rte_click", label: "Rep-Triggered Email Clicks", basePoints: 8, cap: 3, weight: 0.10, kpi: "RTE CTR (Veeva)" },
  { id: "docnews", label: "Doximity DocNews Clicks", basePoints: 4, cap: 3, weight: 0.05, kpi: "DocNews Click Rate" },
  { id: "sermo", label: "Sermo Poll Completions", basePoints: 6, cap: 2, weight: 0.05, kpi: "Sermo Poll Completion Rate" },
  { id: "event_att", label: "Event Attendances", basePoints: 10, cap: 3, weight: 0.08, kpi: "Event NPS" },
  { id: "clm", label: "Rep CLM Shared in Calls", basePoints: 6, cap: 3, weight: 0.05, kpi: "Rep Call Reach" },
  { id: "ehr", label: "EHR Alert Interactions", basePoints: 8, cap: 3, weight: 0.10, kpi: "W-Shaped Contribution" },
  { id: "paid_conv", label: "Paid Media Conversions", basePoints: 12, cap: 3, weight: 0.10, kpi: "Paid Media → Site Conversion Rate" },
  { id: "rte_open", label: "RTE Opens", basePoints: 5, cap: 5, weight: 0.12, kpi: "RTE Open Rate (Veeva)" },
];

export const DEMO_HCPS: Hcp[] = [
  { id: "NPI001", name: "HCP Alpha", specialty: "Oncology", region: "NE", web_key: 4, form: 1, rte_click: 2, docnews: 1, sermo: 0, event_att: 1, clm: 1, ehr: 1, paid_conv: 1, rte_open: 3 },
  { id: "NPI002", name: "HCP Bravo", specialty: "Pulmonology", region: "SE", web_key: 5, form: 0, rte_click: 1, docnews: 1, sermo: 1, event_att: 0, clm: 0, ehr: 0, paid_conv: 0, rte_open: 2 },
  { id: "NPI003", name: "HCP Charlie", specialty: "Vaccines", region: "MW", web_key: 2, form: 2, rte_click: 0, docnews: 0, sermo: 1, event_att: 2, clm: 1, ehr: 2, paid_conv: 2, rte_open: 4 },
  { id: "NPI004", name: "HCP Delta", specialty: "Allergy/Immunology", region: "W", web_key: 1, form: 0, rte_click: 0, docnews: 0, sermo: 0, event_att: 0, clm: 0, ehr: 0, paid_conv: 0, rte_open: 1 },
  { id: "NPI005", name: "HCP Echo", specialty: "Oncology", region: "NE", web_key: 6, form: 3, rte_click: 3, docnews: 2, sermo: 2, event_att: 2, clm: 3, ehr: 3, paid_conv: 3, rte_open: 5 },
];

export const BENCHMARKS: Benchmark[] = [
  { channel: "Search (Paid)", metric: "CTR", benchmark: "≈6.9%", notes: "Healthcare avg; intent-dependent" },
  { channel: "Display", metric: "CTR", benchmark: "≈0.5–0.6%", notes: "HCP targeted; endemic higher" },
  { channel: "Email (3rd-party)", metric: "Open Rate", benchmark: "22–35%", notes: "HCP lists outperform" },
  { channel: "RTE", metric: "Open Rate", benchmark: "≈41–45%", notes: "Rep-sent trust" },
  { channel: "Social (Paid)", metric: "Video Completion", benchmark: "65–75%", notes: "Educational/KOL content" },
  { channel: "Website", metric: "Bounce Rate", benchmark: "35–45%", notes: "Pharma HCP sites" },
  { channel: "Events (Virtual)", metric: "Attendance", benchmark: "≈50%", notes: "Typical pharma webinar" },
];
