import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
  Badge,
} from "../../components";
import * as XLSX from "xlsx";
import { Building2, TrendingUp, AlertCircle } from "lucide-react";

interface GapAnalysisRow {
  kbq: string;
  kpis: string[];
}

interface GapAnalysisMap {
  [key: string]: GapAnalysisRow[];
}

const KpiGapAnalysis: React.FC<{ onFilterKpis?: (kpi: string) => void }> = ({ onFilterKpis }) => {
  const [data, setData] = useState<any[]>([]);
  const [gapMap, setGapMap] = useState<GapAnalysisMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExcelData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/KPI-Gap-Analysis.xlsx");
        
        if (!response.ok) {
          throw new Error(`Failed to fetch Excel file: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Received HTML instead of Excel file. File does not exist in /public folder.');
        }

        const buffer = await response.arrayBuffer();
        
        if (buffer.byteLength < 100) {
          throw new Error('File too small to be valid Excel file');
        }

        const workbook = XLSX.read(buffer, { type: "array" });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Excel file has no sheets');
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: '',
          raw: false
        });
        
        if (jsonData.length === 0) {
          throw new Error('Excel file has no data rows');
        }
        
        setData(jsonData);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    loadExcelData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const map: GapAnalysisMap = {};

      data.forEach((row: any) => {
        const bu = (row["BU"] || row["bu"] || "").toString().trim();
        const brand = (row["Brand"] || row["brand"] || "").toString().trim();
        const kbq = (row["KBQ"] || row["kbq"] || row["Key Business Question"] || "").toString().trim();
        const kpisString = (row["KPIs"] || row["kpis"] || "").toString().trim();
        
        const kpis: string[] = kpisString
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);

        const key = `${bu} - ${brand}`;

        if (!map[key]) {
          map[key] = [];
        }
        
        if (kbq) {
          map[key].push({ kbq, kpis });
        }
      });
      
      setGapMap(map);
    }
  }, [data]);

 
 
         
 
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#003D7C]" />
          <h2 className="text-xl font-semibold text-[#003D7C]">KPI Gap Analysis by Business Unit & Brand</h2>
        </div>
        <div className="text-xs text-slate-500">
          {Object.keys(gapMap).length} business unit{Object.keys(gapMap).length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.entries(gapMap).map(([buBrand, rows]: [string, GapAnalysisRow[]]) => (
          <Card key={buBrand} className="h-full flex flex-col shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-[#003D7C] to-[#00AEEF] text-white">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <CardTitle className="text-base font-semibold">{buBrand}</CardTitle>
              </div>
              <p className="text-xs text-white/80 mt-1">
                Top {rows.length} Key Business {rows.length === 1 ? 'Question' : 'Questions'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 flex-grow p-4">
              {rows.map((r: GapAnalysisRow, idx: number) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 p-3 bg-slate-50/70"
                >
                  <div className="text-sm font-medium text-slate-700 mb-2 leading-relaxed">
                    {r.kbq}
                  </div>
                  {Array.isArray(r.kpis) && r.kpis.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {r.kpis.map((kpi: string, kpiIdx: number) => (
                        <Badge
                          key={`${idx}-${kpiIdx}`}
                          variant="secondary"
                          className="text-xs"
                        >
                          {kpi}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {(!Array.isArray(r.kpis) || r.kpis.length === 0) && (
                    <p className="text-xs text-slate-400 italic mt-2">No KPIs specified</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 

export default KpiGapAnalysis;