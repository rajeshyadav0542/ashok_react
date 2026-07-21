
import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button,
  Badge,
  Input,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
  Toaster, toast
} from "./components";
import {
  Database, Gauge, Search as SearchIcon, Copy, Download,
  Rocket, Users, Target, BookOpen, Globe2, BarChart3,
  LineChart as LineChartIcon, ShieldCheck, Network, Calendar, ClipboardList,
  Sparkles, Settings2, GaugeCircle, ChevronDown, Image, TrendingUp 
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  AreaChart, Area, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter
} from "recharts";

import {  KPI_CATALOG,PERSONA_KBQ, CES_ACTIONS, DEMO_HCPS, BENCHMARKS } from './constants';
import { Kpi, QcResult, MappedPersonaKbq, CesAction, Hcp, ScoredHcp, Benchmark } from './types';
import { downloadCSV, qcCatalog, buildPersonaMap, scoreHcp } from './utils';

import PersonaMapping from './src/components/PersonaKBQ'
import * as XLSX from "xlsx";
import KpiGapAnalysis from "./src/components/KPI-Analysis";
import KpiCatalogTable from "./src/components/KPI-catalog";
import DashboardPage from "./src/components/new-dashboard";

import DQRules from "./src/components/DQRules";

// --- Infographic Components ---

const InfographicSection: React.FC<{id: string, title: string, subtitle: string, children: React.ReactNode, className?: string}> = ({id, title, subtitle, children, className}) => (
    <section id={id} className={`mb-20 ${className || ''}`}>
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#003DA5]">{title}</h2>
            <p className="text-md text-slate-500 mt-2 max-w-2xl mx-auto">{subtitle}</p>
        </div>
        {children}
    </section>
);

const InfographicPaceCard: React.FC<{icon: string, title: string, children: React.ReactNode, borderColor: string}> = ({icon, title, children, borderColor}) => (
    <div className="bg-white rounded-xl p-6 shadow-md transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg text-center border-t-4" style={{borderColor}}>
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-slate-800">{title}</h3>
        <p className="text-slate-600">{children}</p>
    </div>
);

const InfographicFunnelStage: React.FC<{widthClass: string, bgColor: string, title: string, value: string}> = ({widthClass, bgColor, title, value}) => (
    <div 
        className={`w-full ${widthClass} text-white p-4 text-center shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:brightness-110`}
        style={{
            backgroundColor: bgColor,
            clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)'
        }}
    >
        <h3 className="font-bold text-xl">{title}</h3>
        <p className="text-lg font-semibold">{value}</p>
    </div>
);

const OverviewInfographic: React.FC = () => {
    const indegeneColors = {
        darkBlue: '#003DA5',
        cyan: '#00AEEF',
        magenta: '#EC008C',
        gray: '#E5E7EB',
        lightBlue: '#B9E8F9',
        midBlue: '#0087C1',
        darkerBlue: '#005587'
    };
    
    
    // Data for charts
    const engagementScoreData = [{ name: 'Depth (40%)', value: 85 }, { name: 'Frequency (25%)', value: 90 }, { name: 'Recency (20%)', value: 75 }, { name: 'Breadth (15%)', value: 95 }];
    const channelContributionData = [ { name: 'Email', value: 22.3 }, { name: 'Field', value: 17.4 }, { name: 'Paid Search', value: 18.5 }, { name: 'Website', value: 14.2 }, { name: 'Display', value: 11.0 }, { name: 'EHR', value: 8.5 }, { name: 'Social', value: 8.1 }].sort((a, b) => a.value - b.value);
    const journeyProgressionData = [ { name: 'Jan', value: 5.2 }, { name: 'Feb', value: 5.5 }, { name: 'Mar', value: 6.1 }, { name: 'Apr', value: 5.9 }, { name: 'May', value: 6.5 }, { name: 'Jun', value: 6.8 }];
    const engagementVsRxLiftData = [ { x: 15, y: -2 }, { x: 25, y: 1 }, { x: 35, y: 2.5 }, { x: 45, y: 4 }, { x: 55, y: 5.5 }, { x: 65, y: 8 }, { x: 75, y: 10 }, { x: 85, y: 12.5 }, { x: 95, y: 14 }];
    const channelBenchmarkData = [ { name: 'Paid Search CTR', campaign: 7.2, benchmark: 6.9 }, { name: 'RTE Open Rate', campaign: 42.5, benchmark: 41.0 }, { name: 'Virtual Event Attendance', campaign: 52.0, benchmark: 50.0 }];

    const kpiData = {
        email: [ { label: 'RTE Open Rate', value: '42.5%', benchmark: '41.0%' }, { label: 'RTE CTR', value: '8.2%', benchmark: 'N/A' }, { label: '3rd Party Open Rate', value: '28.5%', benchmark: '25.0%' }, { label: '3rd Party CTR', value: '3.1%', benchmark: '2.8%' } ],
        website: [ { label: 'Unique HCP Visitors', value: '15,230', trend: '+8%' }, { label: 'Avg. Session Duration', value: '4m 15s', trend: '+12s' }, { label: 'Key Content Engagement', value: '18.2%', benchmark: '15.0%' }, { label: 'Sample Request Rate', value: '2.1%', benchmark: '2.0%' } ],
        events: [ { label: 'Attendance Rate', value: '52.0%', benchmark: '50.0%' }, { label: 'Avg. Engagement Duration', value: '54 min', benchmark: '52 min' }, { label: 'Audience Interaction Rate', value: '25.0%', trend: '+3%' }, { label: 'On-Demand View Rate', value: '18.0%', benchmark: '15.0%' } ]
    };
    
    const [selectedKpiChannel, setSelectedKpiChannel] = useState<keyof typeof kpiData>('email');

    const renderKpiCards = () => {
        return kpiData[selectedKpiChannel].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-xl p-4 shadow-md text-center">
                <h4 className="font-bold text-lg text-[#003DA5]">{kpi.label}</h4>
                <p className="text-4xl font-bold my-2 text-slate-800">{kpi.value}</p>
                {kpi.benchmark && <p className="text-sm text-gray-500">vs. {kpi.benchmark} benchmark</p>}
                {kpi.trend && <p className={`text-sm ${kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{kpi.trend} vs. prior period</p>}
            </div>
        ));
    };

    return (
        <div className="text-slate-800 font-sans">
            <header className="text-center my-8">
                <h1 className="text-4xl md:text-5xl font-bold text-[#003DA5] mb-4">The Master Omnichannel Measurement Framework</h1>
                <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">A unified guide to understanding and optimizing the complete HCP journey.</p>
            </header>

            <InfographicSection id="pace-framework" title="The P.A.C.E. Framework: Asking the Right Questions" subtitle="Our strategic foundation, ensuring every analysis is fit-for-purpose before it begins.">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <InfographicPaceCard icon="🎯" title="Purpose" borderColor={indegeneColors.magenta}>Which strategic or tactical decisions are we supporting?</InfographicPaceCard>
                    <InfographicPaceCard icon="💾" title="Access" borderColor={indegeneColors.cyan}>What data is available and at what granularity?</InfographicPaceCard>
                    <InfographicPaceCard icon="⏳" title="Cadence" borderColor={indegeneColors.darkBlue}>How frequently are insights required?</InfographicPaceCard>
                    <InfographicPaceCard icon="📈" title="Evidence" borderColor={indegeneColors.cyan}>What level of statistical confidence is needed?</InfographicPaceCard>
                </div>
            </InfographicSection>

            <InfographicSection id="hcp-journey-funnel" title="The HCP Adoption Journey" subtitle="We measure success by how effectively we guide HCPs through the stages of adoption, from initial awareness to brand loyalty.">
                 <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-1">
                    <InfographicFunnelStage widthClass="md:w-10/12" bgColor={indegeneColors.cyan} title="Awareness" value="120,500 HCPs" />
                    <InfographicFunnelStage widthClass="md:w-8/12" bgColor={indegeneColors.midBlue} title="Consideration" value="75,310 HCPs" />
                    <InfographicFunnelStage widthClass="md:w-6/12" bgColor={indegeneColors.darkerBlue} title="Trial & Adoption" value="28,450 HCPs" />
                    <InfographicFunnelStage widthClass="md:w-4/12" bgColor={indegeneColors.darkBlue} title="Loyalty & Advocacy" value="15,670 HCPs" />
                </div>
            </InfographicSection>

            <InfographicSection id="engagement-score" title="The Unified HCP Engagement Score" subtitle="A single, powerful metric that holistically measures an HCP's interaction level, factoring in the depth, frequency, breadth, and recency of their engagement." className="bg-white rounded-xl p-8 shadow-inner">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={engagementScoreData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="name" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="Dr. Smith" dataKey="value" stroke={indegeneColors.magenta} fill={indegeneColors.magenta} fillOpacity={0.2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InfographicPaceCard icon="🌊" title="Depth" borderColor={indegeneColors.darkBlue}><p className="text-sm">Weighted value of all actions.</p></InfographicPaceCard>
                        <InfographicPaceCard icon="🔄" title="Frequency" borderColor={indegeneColors.cyan}><p className="text-sm">Total number of touchpoints.</p></InfographicPaceCard>
                        <InfographicPaceCard icon="🗓️" title="Recency" borderColor={indegeneColors.magenta}><p className="text-sm">Time since last engagement.</p></InfographicPaceCard>
                        <InfographicPaceCard icon="🌐" title="Breadth" borderColor="#9ca3af"><p className="text-sm">Number of unique channels used.</p></InfographicPaceCard>
                    </div>
                </div>
            </InfographicSection>
            
            <InfographicSection id="persona-dashboards" title="Persona-Based Dashboards" subtitle="Delivering the right insights to the right audience, from high-level strategy to tactical diagnostics.">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <h3 className="text-2xl font-bold text-center mb-6 text-[#003DA5]">Executive View: Strategic Performance</h3>
                        <div className="bg-slate-50/50 p-4 rounded-lg mb-8">
                            <h4 className="font-bold text-lg mb-2 text-center">Top Channels by Engagement Contribution</h4>
                            <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={channelContributionData} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" tickFormatter={(v) => `${v}%`} /><YAxis type="category" dataKey="name" width={80} tick={{fontSize: 12}} /><RTooltip formatter={(v) => `${v}%`} /><Bar dataKey="value" fill={indegeneColors.cyan} /></BarChart></ResponsiveContainer></div>
                        </div>
                        <div className="bg-slate-50/50 p-4 rounded-lg">
                             <h4 className="font-bold text-lg mb-2 text-center">Journey Stage Progression Rate</h4>
                            <div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={journeyProgressionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={(v) => `${v}%`} /><RTooltip formatter={(v) => `${v}%`} /><Line type="monotone" dataKey="value" stroke={indegeneColors.darkBlue} fill={indegeneColors.darkBlue} /></LineChart></ResponsiveContainer></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md">
                         <h3 className="text-2xl font-bold text-center mb-6 text-[#00AEEF]">Analyst View: Tactical Diagnostics</h3>
                        <div className="bg-slate-50/50 p-4 rounded-lg mb-8">
                            <h4 className="font-bold text-lg mb-2 text-center">Engagement Score vs. Rx Lift</h4>
                            <div className="h-64"><ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}><CartesianGrid /><XAxis type="number" dataKey="x" name="Engagement Score" unit="" /><YAxis type="number" dataKey="y" name="TRx Lift" unit="%" /><RTooltip cursor={{ strokeDasharray: '3 3' }} /><Scatter name="HCP Segments" data={engagementVsRxLiftData} fill={indegeneColors.magenta} /></ScatterChart></ResponsiveContainer></div>
                        </div>
                        <div className="bg-slate-50/50 p-4 rounded-lg">
                             <h4 className="font-bold text-lg mb-2 text-center">Channel Performance vs. Benchmark</h4>
                            <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={channelBenchmarkData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{fontSize: 11}} /><YAxis tickFormatter={(v) => `${v}%`} /><RTooltip formatter={(v) => `${v}%`} /><Legend /><Bar dataKey="campaign" name="Campaign Performance" fill={indegeneColors.darkBlue} /><Bar dataKey="benchmark" name="Industry Benchmark" fill={indegeneColors.gray} /></BarChart></ResponsiveContainer></div>
                        </div>
                    </div>
                </div>
            </InfographicSection>

            <InfographicSection id="kpi-deep-dive" title="Interactive KPI Deep Dive" subtitle="Select a channel to explore its core performance metrics." className="bg-white rounded-xl p-8 shadow-inner">
                <div className="mt-6 text-center">
                    <Select value={selectedKpiChannel} onValueChange={(val) => setSelectedKpiChannel(val as any)}>
                      <SelectTrigger className="w-[200px] mx-auto">
                        <SelectValue placeholder="Select a channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{renderKpiCards()}</div>
            </InfographicSection>

            <InfographicSection id="unified-attribution" title="The Path to Maturity: Unified Attribution" subtitle="Using a tiered approach to connect high-level strategy with granular tactics.">
                 <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 md:space-x-8">
                        <div className="flex-1 text-center p-6 border-2 border-dashed border-slate-300 rounded-lg"><h4 className="font-bold text-xl text-[#003DA5]">Top-Down Strategic Planning</h4><p className="text-4xl my-4">📊</p><h5 className="font-semibold">Marketing Mix Modeling (MMM)</h5><p className="text-sm text-gray-600 mt-2">Sets annual/quarterly budgets and allocates resources across high-level channels.</p></div>
                        <div className="text-5xl font-bold text-[#00AEEF] transform rotate-90 md:rotate-0">→</div>
                        <div className="flex-1 text-center p-6 border-2 border-dashed border-slate-300 rounded-lg"><h4 className="font-bold text-xl text-[#00AEEF]">Bottom-Up Tactical Optimization</h4><p className="text-4xl my-4">🖱️</p><h5 className="font-semibold">Multi-Touch Attribution (MTA)</h5><p className="text-sm text-gray-600 mt-2">Optimizes the media mix within the NPP budget on a weekly/monthly basis.</p></div>
                    </div>
                </div>
            </InfographicSection>
        </div>
    );
};


// --- Helper Components ---

const Header: React.FC<{ 
  qc: QcResult;
  logoSrc: string | null;
  onLogoClick: () => void;
}> = ({ qc, logoSrc, onLogoClick }) => (
  <div className="flex items-center justify-between gap-4 w-full">
    {/* Left: Logo */}
    <div className="w-48 flex-shrink-0">
       <img
  src="https://hconline.indegene.com/assets/images/logo.png"
  alt="Indegene Logo"
  className="w-36 h-16 object-contain p-1"
/>

    </div>

    {/* Center: Title */}
    <div className="flex-1 text-center">
      <h1 className="text-3xl font-bold text-[#003D7C]">Omnichannel Measurement Framework & Catalog</h1>
      <p className="text-sm text-slate-500">Interactive demo for Pharma Omnichannel Data & Analytics stakeholders</p>
    </div>
    
    {/* Right: Controls */}
    <div className="w-48 flex-shrink-0 flex items-center justify-end gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={qc.errors.length > 0 ? "destructive" : "secondary"} size="sm" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4"/>
              <span>{qc.errors.length > 0 ? `${qc.errors.length} Issues` : "QC Passed"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[420px] bg-white text-slate-800 border border-slate-200 p-2 rounded-lg shadow-lg">
            <div className="text-xs">
              <p className="font-semibold mb-1 text-[#E0007A]">Errors ({qc.errors.length})</p>
              {qc.errors.length===0 ? <p>None</p> : qc.errors.slice(0,6).map((e,i)=>(<p key={i}>• {e}</p>))}
              <p className="font-semibold mt-2 mb-1 text-orange-500">Warnings ({qc.warnings.length})</p>
              {qc.warnings.length===0 ? <p>None</p> : qc.warnings.slice(0,6).map((w,i)=>(<p key={i}>• {w}</p>))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Button size="sm" onClick={()=>downloadCSV("kpi_catalog_demo.csv", KPI_CATALOG)}><Download className="mr-2 h-4 w-4"/>Export CSV</Button>
    </div>
  </div>
);

const Stat: React.FC<{ icon: React.ElementType, label: string, value: React.ReactNode, sub?: string }> = ({ icon:Icon, label, value, sub }) => (
  <Card className="shadow-sm">
    <CardHeader className="pb-2">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="h-4 w-4"/>
        <span>{label}</span>
      </div>
      <CardTitle className="text-2xl mt-1 text-[#003D7C]">{value}</CardTitle>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </CardHeader>
  </Card>
);

const PillarCard: React.FC<{ title: string, desc: string, icon: React.ElementType }> = ({ title, desc, icon:Icon }) => (
  <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="pb-2"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-[#00AEEF]"/><CardTitle className="text-base text-[#003D7C]">{title}</CardTitle></div></CardHeader>
    <CardContent className="text-sm text-slate-600">{desc}</CardContent>
  </Card>
);

const Section: React.FC<{ title: string, children: React.ReactNode, icon?: React.ElementType }> = ({ title, children, icon:Icon }) => (
  <div className="space-y-3 pt-4">
    <div className="flex items-center gap-2 mt-2">
      {Icon && <Icon className="h-5 w-5 text-[#003D7C]"/>}
      <h2 className="text-xl font-semibold text-[#003D7C]">{title}</h2>
    </div>
    {children}
  </div>
);

const SearchBar: React.FC<{ query: string, setQuery: (q: string) => void }> = ({ query, setQuery }) => (
  <div className="relative">
    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
    {/* defensive onChange: supports e.target.value OR direct string */}
    <Input
      placeholder="Search KPIs by name, ID, channel…"
      value={query}
      onChange={(e: any) => {
        const newVal = e?.target?.value ?? e ?? "";
        setQuery(String(newVal));
      }}
      className="pl-9"
    />
  </div>
);




const CESandbox = () => {
  const [actions, setActions] = useState<CesAction[]>(CES_ACTIONS);
  const scored = useMemo(()=> DEMO_HCPS.map(h => ({ ...h, score: scoreHcp(h, actions) })), [actions]);
  const dist = useMemo(()=>{
    const bands: {[key: string]: number} = { "A+":0, "A":0, "B":0, "C":0, "D":0, "E":0 };
    const grade = (s: number) => s>=90?"A+": s>=80?"A": s>=70?"B": s>=60?"C": s>=50?"D":"E";
    scored.forEach(h => { bands[grade(h.score)]++; });
    return Object.entries(bands).map(([name,value])=>({ name, value }));
  }, [scored]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base text-[#003D7C]">Action Weights & Caps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.map((a, idx)=> (
            <div key={a.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center border border-slate-200 rounded p-2">
              <div className="md:col-span-2">
                <div className="font-medium text-sm text-[#003D7C]">{a.label}</div>
                <div className="text-xs text-slate-500">Base {a.basePoints} pts • Cap {a.cap} • KPI: {a.kpi}</div>
              </div>
              <div>
                <label className="text-xs text-slate-500">Weight</label>
                <Input type="number" step="0.01" value={a.weight}
                  onChange={e=>{
                    const v = Math.max(0, Math.min(1, Number(e.target.value)));
                    const next=[...actions]; next[idx]={...a, weight: v}; setActions(next);
                  }}/>
              </div>
              <div>
                <label className="text-xs text-slate-500">Cap</label>
                <Input type="number" value={a.cap}
                  onChange={e=>{ const next=[...actions]; next[idx]={...a, cap: Math.max(0, Number(e.target.value))}; setActions(next); }}/>
              </div>
              <div className="flex gap-2 items-center">
                <Button size="sm" variant="outline" onClick={()=>{
                  const def = CES_ACTIONS.find(x=>x.id===a.id)!; const next=[...actions]; next[idx]={...a, weight: def.weight, cap: def.cap}; setActions(next);
                }}>Reset</Button>
              </div>
            </div>
          ))}
          <div className="text-xs text-slate-500">Tip: Emphasize high-intent actions (Forms, EHR, CLM). Score scales to 0–100 with clipping.</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#003D7C]">Score Distribution (Demo HCPs)</CardTitle>
        </CardHeader>
        <CardContent style={{height: 260}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dist} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <RTooltip />
              <Bar dataKey="value" fill="#00AEEF"/>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle className="text-base text-[#003D7C]">HCP Scores (Sandbox)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-slate-600">
                <th className="px-3 py-2 text-left font-semibold">NPI</th>
                <th className="px-3 py-2 text-left font-semibold">Name</th>
                <th className="px-3 py-2 text-left font-semibold">Specialty</th>
                <th className="px-3 py-2 text-left font-semibold">Region</th>
                {actions.map(a => (<th key={a.id} className="px-2 py-2 text-right font-semibold">{a.id}</th>))}
                <th className="px-3 py-2 text-right font-semibold">Score</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {scored.map(h => (
                <tr key={h.id} className="border-t border-slate-200">
                  <td className="px-3 py-2 font-mono text-xs">{h.id}</td>
                  <td className="px-3 py-2">{h.name}</td>
                  <td className="px-3 py-2">{h.specialty}</td>
                  <td className="px-3 py-2">{h.region}</td>
                  {actions.map(a => (<td key={a.id} className="px-2 py-2 text-right">{h[a.id]}</td>))}
                  <td className="px-3 py-2 text-right font-semibold">{h.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};


const DemoDashboard = () => {
  const funnel = [ { stage: "Awareness", hcps: 12000 }, { stage: "Consideration", hcps: 7800 }, { stage: "Trialist", hcps: 3200 }, { stage: "Loyalist", hcps: 1550 } ];
  const velocity = [ { ta: "Acute", days: 45 }, { ta: "Chronic", days: 127 }, { ta: "Specialty", days: 89 }, { ta: "Rare", days: 203 } ];
  const regionShift = [ { region: "NE", delta: 220 }, { region: "SE", delta: 140 }, { region: "MW", delta: 90 }, { region: "W", delta: 180 } ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card className="xl:col-span-1"><CardHeader><CardTitle className="text-base text-[#003D7C]">Journey Funnel (HCPs)</CardTitle></CardHeader>
        <CardContent style={{height: 260}}>
          <ResponsiveContainer width="100%" height="100%"><BarChart data={funnel} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="stage" fontSize={12} /><YAxis fontSize={12}/><RTooltip /><Bar dataKey="hcps" fill="#00AEEF" /></BarChart></ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="xl:col-span-1"><CardHeader><CardTitle className="text-base text-[#003D7C]">Journey Velocity (Days to Rx)</CardTitle></CardHeader>
        <CardContent style={{height: 260}}>
          <ResponsiveContainer width="100%" height="100%"><LineChart data={velocity} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="ta" fontSize={12} /><YAxis fontSize={12}/><RTooltip /><Line type="monotone" dataKey="days" stroke="#E0007A" strokeWidth={2}/></LineChart></ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="xl:col-span-1"><CardHeader><CardTitle className="text-base text-[#003D7C]">Regional Stage Shift (Δ HCPs)</CardTitle></CardHeader>
        <CardContent style={{height: 260}}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={regionShift} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00AEEF" stopOpacity={0.8}/><stop offset="95%" stopColor="#00AEEF" stopOpacity={0.1}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="region" fontSize={12}/><YAxis fontSize={12}/><RTooltip /><Area type="monotone" dataKey="delta" stroke="#00AEEF" fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
const App: React.FC = () => {
  const [selectedKpi, setSelectedKpi] = useState<Kpi | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // Excel data state - THIS IS THE SOURCE OF TRUTH
  const [kpiData, setKpiData] = useState<Kpi[]>([]);
  
  // Filter states
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("All");
  const [pillar, setPillar] = useState("All");
  const [category, setCategory] = useState("All");
  
  const [selectedDQRule, setSelectedDQRule] = useState<{
    dq_rule_type: string;
    attribute_name: string;
    check_description: string;
  } | null>(null);

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (logoSrc) {
        URL.revokeObjectURL(logoSrc);
      }
      setLogoSrc(URL.createObjectURL(file));
    }
  };
const qc = useMemo(() => qcCatalog(kpiData), [kpiData]);
const personaMap = useMemo(() => buildPersonaMap(kpiData, PERSONA_KBQ), [kpiData]);

  
  // Create dynamic dropdown options from Excel data
const channels = useMemo(() => {
  if (!kpiData || kpiData.length === 0) return ["All"];
  const vals = Array.from(new Set(kpiData.map(k => (k.channel_group ?? "").toString().trim()).filter(v => v)));
  return ["All", ...vals];
}, [kpiData]);

const pillars = useMemo(() => {
  if (!kpiData || kpiData.length === 0) return ["All"];
  const vals = Array.from(new Set(kpiData.map(k => (k.pace_pillar ?? "").toString().trim()).filter(v => v)));
  return ["All", ...vals];
}, [kpiData]);

const categories = useMemo(() => {
  if (!kpiData || kpiData.length === 0) return ["All"];
  const vals = Array.from(new Set(kpiData.map(k => (k.kpi_category ?? "").toString().trim()).filter(v => v)));
  return ["All", ...vals];
}, [kpiData]);

  // MAIN FILTER LOGIC - This filters the Excel data
 // MAIN FILTER LOGIC - This filters the Excel data
const filtered = useMemo(() => {
  if (!kpiData || kpiData.length === 0) return [];

  const q = (query ?? "").toString().toLowerCase().trim();

  return kpiData.filter(k => {
    // match search query across many fields (robust to numbers / arrays)
    const candidates = [
      k.kpi_id,
      k.kpi_name,
      k.channel_group,
      k.channel_detail,
      k.kpi_definition,
      k.kpi_sqlMacro,
      Array.isArray(k.kpi_relevance) ? k.kpi_relevance.join(" ") : k.kpi_relevance,
      k.kpi_category,
      k.pace_pillar
    ];

    const hay = candidates
      .filter(Boolean)
      .map(x => String(x).toLowerCase())
      .join(" ");

    const matchesQuery = !q || hay.includes(q);

    // dropdown filters (All means no filter)
    const matchesChannel = channel === "All" || (k.channel_group ?? "").toString().trim() === channel;
    const matchesPillar = pillar === "All" || (k.pace_pillar ?? "").toString().trim() === pillar;
    const matchesCategory = category === "All" || (k.kpi_category ?? "").toString().trim() === category;

    return matchesQuery && matchesChannel && matchesPillar && matchesCategory;
  });
}, [query, channel, pillar, category, kpiData]);

  // Log for debugging
  useEffect(() => {
    console.log('Filter State:', { query, channel, pillar, category });
    console.log('KPI Data Count:', kpiData.length);
    console.log('Filtered Count:', filtered.length);
  }, [query, channel, pillar, category, kpiData, filtered]);

  const handleKpiFilter = (kpiId: string) => {
    setQuery(kpiId);
    setActiveTab("catalog");
  };
  
  const handleKpinameFilter = (kpiName: string) => {
    setQuery(kpiName);
    setActiveTab("catalog");
  };
interface GapAnalysisRow {
     kbq: string;
     kpis: string[];
   }

   interface GapAnalysisMap {
     [key: string]: GapAnalysisRow[];
   }


  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <Toaster richColors position="top-right" />
        <input
          type="file"
          ref={logoInputRef}
          onChange={handleLogoChange}
          accept="image/*"
          className="hidden"
        />
        <Header qc={qc} logoSrc={logoSrc} onLogoClick={handleLogoClick}/>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 sm:grid-cols-5 lg:flex lg:flex-wrap gap-0.5 h-auto pt-3">
            <TabsTrigger value="overview"><GaugeCircle className="h-4 w-4 mr-2"/>Overview</TabsTrigger>
            <TabsTrigger value="pace"><Settings2 className="h-4 w-4 mr-2"/>P.A.C.E.</TabsTrigger>
            <TabsTrigger value="pillars"><Sparkles className="h-4 w-4 mr-2"/>Four Pillars</TabsTrigger>
            <TabsTrigger value="personas"><Users className="h-4 w-4 mr-2"/>Personas → KBQs</TabsTrigger>
            <TabsTrigger value="catalog"><Database className="h-4 w-4 mr-2"/>KPI Catalog</TabsTrigger>
           <TabsTrigger value="gap-analysis"><TrendingUp className="h-4 w-4 mr-2"/>KPI Gap Analysis</TabsTrigger>
            <TabsTrigger value="dq-rules"><ShieldCheck className="h-4 w-4 mr-2"/>DQ Rules</TabsTrigger>
            <TabsTrigger value="ces"><Gauge className="h-4 w-4 mr-2"/>Engagement Scoring</TabsTrigger>
            <TabsTrigger value="dashboard"><BarChart3 className="h-4 w-4 mr-2"/>Demo Dashboard</TabsTrigger>
            <TabsTrigger value="new-dashboard"><BarChart3 className="h-4 w-4 mr-2"/>Experimental Dashboard</TabsTrigger>
            <TabsTrigger value="bench"><BookOpen className="h-4 w-4 mr-2"/>Benchmarks</TabsTrigger>
            <TabsTrigger value="govern"><ShieldCheck className="h-4 w-4 mr-2"/>Governance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
             <OverviewInfographic />
          </TabsContent>
          
          <TabsContent value="pace"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><PillarCard icon={Target} title="Purpose" desc="Decisions & objectives: strategy vs in‑flight optimization. MMM for long-term ROI; experiments for causality; MTA for allocation within digital."/><PillarCard icon={Database} title="Access" desc="Data granularity & identity: aggregate (MMM) vs. NPI‑level (test/control) vs. user‑level (MTA)."/><PillarCard icon={Calendar} title="Cadence" desc="Quarterly/semi-annual for MMM & outcomes; weekly for channel optimization; monthly for engagement scoring."/><PillarCard icon={ShieldCheck} title="Evidence" desc="Operational, Experimental (A/B, geo tests), or Modeled (MMM/MTA). Match rigor to decision stakes."/></div></TabsContent>
          <TabsContent value="pillars"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><PillarCard icon={Globe2} title="Experience" desc="Seamlessness & quality of the journey (viewability, ISI visibility, overlap, identity)."/><PillarCard icon={Gauge} title="Engagement" desc="Depth & frequency of interactions (content, RTEs, events, peer platforms)."/><PillarCard icon={LineChartIcon} title="Influence" desc="Movement & outcomes (journey completion, velocity, Rx lift, ROI)."/><PillarCard icon={ShieldCheck} title="Satisfaction" desc="Perception & loyalty (returning rate, NPS, persistence)."/></div></TabsContent>
          
          <TabsContent value="personas"><Section title="Persona → KBQ → KPI mapping" icon={Users}><PersonaMapping personaMap={personaMap} onFilterKpis={handleKpiFilter} /><p className="text-xs text-slate-500 mt-3">Tip: Click any KPI ID badge to filter the catalog to that KPI.</p></Section></TabsContent>
        <TabsContent value="dq-rules">
            <DQRules onRuleSelect={setSelectedDQRule} />
          </TabsContent>
          <TabsContent value="gap-analysis"><Section title="KPI Gap Analysis" ><KpiGapAnalysis onFilterKpis={handleKpinameFilter} /></Section></TabsContent>
          
      
          <TabsContent value="catalog" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <SearchBar query={query} setQuery={setQuery} />
              
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Channel Group" />
                  <ChevronDown className="h-4 w-4 opacity-50"/>
                </SelectTrigger>
                <SelectContent>
                  {channels.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={pillar} onValueChange={setPillar}>
                <SelectTrigger>
                  <SelectValue placeholder="Pillar" />
                  <ChevronDown className="h-4 w-4 opacity-50"/>
                </SelectTrigger>
                <SelectContent>
                  {pillars.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                  <ChevronDown className="h-4 w-4 opacity-50"/>
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Pass filtered data and receive loaded data */}
            <KpiCatalogTable 
              data={filtered} 
              onKpiSelect={setSelectedKpi}
              onDataLoaded={(loaded) => setKpiData(loaded)}
            />
            
            {/* Show count */}
            <p className="text-xs text-slate-500">
              Showing {filtered.length} of {kpiData.length} KPIs
            </p>
          </TabsContent>
          
          
          <TabsContent value="ces"><Section title="Unified Customer Engagement Scoring (CES)" icon={Gauge}><p className="text-sm text-slate-600 mb-2">Composite 0–100 score rolling up weighted, capped actions across channels (web, email, social/peer, events, field, EHR, paid). Designed to prioritize high-intent behavior and prevent gaming. Identity: NPI/hashed; refresh weekly; clip to [0,100].</p><CESandbox /></Section></TabsContent>
          <TabsContent value="dashboard"><DemoDashboard /></TabsContent>
          <TabsContent value="new-dashboard"><DashboardPage /></TabsContent>

          <TabsContent value="bench">
            <Card><CardHeader><CardTitle className="text-base text-[#003D7C]">Industry Benchmarks (orientation)</CardTitle></CardHeader>
              <CardContent className="overflow-auto">
                <table className="min-w-[700px] w-full text-sm">
                  <thead className="bg-slate-50"><tr className="text-left text-slate-600"><th className="px-3 py-2 font-semibold">Channel</th><th className="px-3 py-2 font-semibold">Metric</th><th className="px-3 py-2 font-semibold">Benchmark</th><th className="px-3 py-2 font-semibold">Notes</th></tr></thead>
                  <tbody className="bg-white">{BENCHMARKS.map((b,idx)=> (<tr key={idx} className="border-t border-slate-200"><td className="px-3 py-2">{b.channel}</td><td className="px-3 py-2">{b.metric}</td><td className="px-3 py-2">{b.benchmark}</td><td className="px-3 py-2 text-slate-600">{b.notes}</td></tr>))}</tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="govern">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="xl:col-span-2"><CardHeader><CardTitle className="text-base text-[#003D7C]">Data & Privacy Guardrails</CardTitle></CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <ul className="list-disc pl-5">
                    <li>Identity: prioritize NPI or hashed identifiers; segregate PHI/PII and enforce least‑privilege access.</li>
                    <li>Compliance monitoring: <b>Fair Balance</b>, <b>ISI visibility</b>, and <b>FDA‑2253 timeliness</b>.</li>
                    <li>Evidence: match rigor to decision—Operational (dashboards), Experimental (test/control), Modeled (MMM/MTA).</li>
                    <li>Cadence: weekly for leading indicators; monthly for scoring; quarterly for Rx/ROI.</li>
                    <li>Data quality KPIs: completeness, cross‑platform consistency, identity resolution rate.</li>
                  </ul>
                </CardContent>
              </Card>
              <Card><CardHeader><CardTitle className="text-base text-[#003D7C]">Quick Links</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={()=>downloadCSV("kpi_catalog_demo.csv", kpiData)}><Download className="mr-2 h-4 w-4"/>Export KPI Catalog (CSV)</Button>
                  <Button className="w-full justify-start"><Database className="mr-2 h-4 w-4"/>Open Full Workbook (v3)</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
<Dialog open={!!selectedKpi} onOpenChange={()=>setSelectedKpi(null)}>
  <DialogContent className="max-w-2xl">
    {selectedKpi && (
    <>
      <DialogHeader>
        <DialogTitle>{selectedKpi.kpi_name || 'Untitled KPI'}</DialogTitle>
        <DialogDescription className="text-xs">
          {selectedKpi.kpi_id} • {selectedKpi.channel_group} • {selectedKpi.kpi_category} • Pillar: {selectedKpi.pace_pillar}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 text-sm max-h-[70vh] overflow-y-auto pr-2">
        {/* Definition */}
        {selectedKpi.kpi_definition && (
          <div>
            <span className="font-semibold text-[#003D7C]">Definition:</span>{" "}
            <span className="text-slate-600">{selectedKpi.kpi_definition}</span>
          </div>
        )}

        {/* KPI Type */}
        {selectedKpi.kpi_type && (
          <div>
            <span className="font-semibold text-[#003D7C]">Type:</span>{" "}
            <span className="text-slate-600">{selectedKpi.kpi_type}</span>
          </div>
        )}

        {/* Channel Detail */}
        {selectedKpi.channel_detail && (
          <div>
            <span className="font-semibold text-[#003D7C]">Channel Detail:</span>{" "}
            <span className="text-slate-600">{selectedKpi.channel_detail}</span>
          </div>
        )}

        {/* SQL Macro */}
        {selectedKpi.kpi_sqlMacro && (
          <div>
            <p className="font-semibold text-[#003D7C] mb-1">SQL Macro</p>
            <pre className="bg-slate-100 p-3 rounded-md overflow-auto text-xs whitespace-pre-wrap text-slate-700">
              {selectedKpi.kpi_sqlMacro}
            </pre>
            <div className="mt-2 flex gap-2">
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={()=>{
                  navigator.clipboard.writeText(selectedKpi.kpi_sqlMacro); 
                  toast.success("SQL copied");
                }}
              >
                <Copy className="mr-2 h-4 w-4"/>Copy SQL
              </Button>
            </div>
          </div>
        )}

        {/* Sample Data */}
        {selectedKpi.kpi_sampleData?.labels && selectedKpi.kpi_sampleData.labels.length > 0 && (
          <div>
            <p className="font-semibold text-[#003D7C] mb-1">Sample Data</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {selectedKpi.kpi_sampleData.labels.map((lab, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between rounded border border-slate-200 px-2 py-1 bg-white"
                >
                  <span className="text-slate-600">{lab}</span>
                  <span className="font-semibold text-[#003D7C]">
                    {selectedKpi.kpi_sampleData.values[idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relevance Tags */}
        {selectedKpi.kpi_relevance && selectedKpi.kpi_relevance.length > 0 && (
          <div>
            <p className="font-semibold text-[#003D7C] mb-2">Relevance</p>
            <div className="flex flex-wrap gap-2">
              {selectedKpi.kpi_relevance.map((tag, i) => (
                <Badge key={i} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Show message if no additional details */}
        {!selectedKpi.kpi_definition && 
         !selectedKpi.kpi_sqlMacro && 
         (!selectedKpi.kpi_sampleData?.labels || selectedKpi.kpi_sampleData.labels.length === 0) &&
         (!selectedKpi.kpi_relevance || selectedKpi.kpi_relevance.length === 0) && (
          <p className="text-slate-500 text-center py-4">No additional details available</p>
        )}
      </div>
    </>
    )}
  </DialogContent>
</Dialog>
<Dialog open={!!selectedDQRule} onOpenChange={() => setSelectedDQRule(null)}>
  <DialogContent className="max-w-2xl">
    {selectedDQRule && (
      <>
        <DialogHeader>
          <DialogTitle>Data Quality Rule Details</DialogTitle>
          <DialogDescription className="text-xs">
            {selectedDQRule.dq_rule_type} • {selectedDQRule.attribute_name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <span className="font-semibold text-[#003D7C] block mb-2">Rule Type:</span>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {selectedDQRule.dq_rule_type}
            </Badge>
          </div>

          <div>
            <span className="font-semibold text-[#003D7C] block mb-2">Attribute Name:</span>
            <code className="text-slate-700 bg-slate-100 px-3 py-2 rounded block text-sm">
              {selectedDQRule.attribute_name}
            </code>
          </div>

          <div>
            <span className="font-semibold text-[#003D7C] block mb-2">Check Description:</span>
            <div className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 leading-relaxed">
              {selectedDQRule.check_description}
            </div>
          </div>

          {!selectedDQRule.check_description && (
            <p className="text-slate-500 text-center py-4">No description available</p>
          )}
        </div>
      </>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
}

export default App;
