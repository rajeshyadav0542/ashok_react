import React, { useState, useEffect } from "react";
import { Button, Badge } from "../../components";
import { Database } from "lucide-react";
import * as XLSX from "xlsx";
import { Kpi } from "../../types";

interface CatalogTableProps {
  data: Kpi[];
  onKpiSelect: (kpi: Kpi) => void;
  onDataLoaded?: (loaded: Kpi[]) => void;
}




const KpiCatalogTable: React.FC<CatalogTableProps> = ({ data, onKpiSelect, onDataLoaded }) => {
  const [excelData, setExcelData] = useState<Kpi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const loadExcelData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/Kpi-catalog.xlsx");

        if (!response.ok) {
          throw new Error(`Failed to fetch Excel file: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          throw new Error("Received HTML instead of Excel file.");
        }

        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Helper function to parse sample data
        const parseSampleData = (data: any) => {
          if (!data) return { labels: [], values: [] };
          if (typeof data === 'object' && data.labels && data.values) return data;
          if (typeof data === 'string') {
            try {
              return JSON.parse(data);
            } catch {
              return { labels: [], values: [] };
            }
          }
          return { labels: [], values: [] };
        };

        // Helper function to parse relevance array
        const parseRelevance = (data: any) => {
          if (!data) return [];
          if (Array.isArray(data)) return data;
          if (typeof data === 'string') {
            return data.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
          return [];
        };

        // Transform the data to match Kpi interface
        const transformedData: Kpi[] = jsonData.map((row: any, index: number) => ({
          kpi_id: row["KPI ID"] || row["kpi_id"] || `KPI-${index + 1}`,
          kpi_name: row["KPI Name"] || row["kpi_name"] || "",
          kpi_type: row["KPI Type"] || row["kpi_type"] || row["Type"] || "Metric",
          kpi_category: row["dashboard_category"] || row["kpi_category"] || row["Category"] || "",
          pace_pillar: row["Pillar"] || row["pace_pillar"] || row["PACE Pillar"] || "",
          channel_group: row["Channel Group"] || row["channel_group"] || row["Channel"] || "",
          channel_detail: row["Channel Detail"] || row["channel_detail"] || "",
          kpi_definition: row["Definition"] || row["kpi_definition"] || row["KPI Definition"] || "",
          kpi_sqlMacro: row["SQL Macro"] || row["kpi_sqlMacro"] || row["SQL"] || "",
          kpi_sampleData: parseSampleData(row["Sample Data"] || row["kpi_sampleData"]),
          kpi_relevance: parseRelevance(row["Relevance"] || row["kpi_relevance"]),
        }));

        setExcelData(transformedData);
        
        // Notify parent component of loaded data
        if (onDataLoaded) {
          onDataLoaded(transformedData);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsLoading(false);
      }
    };

    loadExcelData();
  }, []);

  // Use Excel data if available, otherwise fallback to props

const [displayData, setDisplayData] = useState<Kpi[]>([]);
const [sortConfig, setSortConfig] = useState<{ key: keyof Kpi | null; direction: "asc" | "desc"; }>({
  key: null,
  direction: "asc",
});
const handleSort = (key: keyof Kpi) => {
  setSortConfig(prev => ({
    key,
    direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
  }));
};

// Effect to compute displayData
useEffect(() => {
  // Start with parent filtered data if exists, otherwise full excelData
 // Use parent `data` if defined (even if empty), otherwise fallback to excelData
let source = data !== undefined ? [...data] : [...excelData];


  // Apply sorting if a sort key exists
  if (sortConfig.key) {
    const key = sortConfig.key;
    const dir = sortConfig.direction;
    source.sort((a, b) => {
      const aVal = String(a[key] ?? "").toLowerCase();
      const bVal = String(b[key] ?? "").toLowerCase();
      return dir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }

  setDisplayData(source);
}, [data, excelData, sortConfig]);



  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 rounded-xl border border-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003D7C] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading KPI catalog from Excel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h3 className="font-semibold text-red-800 mb-2">Error Loading Excel File</h3>
        <p className="text-red-700 text-sm mb-3">{error}</p>
        {data.length > 0 && (
          <p className="text-red-600 text-sm mt-3 pt-3 border-t border-red-200">
            Showing fallback data ({data.length} items)
          </p>
        )}
      </div>
    );
  }

if (displayData.length === 0) {
  return (
    <div className="rounded-xl border border-slate-200 p-12 text-center">
      <Database className="h-12 w-12 mx-auto mb-4 text-slate-300" />
      <h3 className="text-lg font-semibold text-slate-700 mb-2">No results found</h3>
      <p className="text-sm text-slate-500">Try a different search term or clear filters.</p>
    </div>
  );
}

  return (
    <div className="overflow-auto rounded-xl border border-slate-200">
      <table className="min-w-[900px] w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="text-left text-slate-600">
          <th className="px-1.5 py-2 font-semibold cursor-pointer" onClick={() => handleSort("kpi_id")}>
  KPI ID {sortConfig.key === "kpi_id" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "⬍"}
</th>


    <th
      className="px-3 py-2 font-semibold cursor-pointer"
      onClick={() => handleSort("kpi_name")}
    >
      KPI Name {sortConfig.key === "kpi_name" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "⬍"}
    </th>

    <th
      className="px-3 py-2 font-semibold cursor-pointer"
      onClick={() => handleSort("kpi_category")}
    >
      KPI Category{" "}
      {sortConfig.key === "kpi_category" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "⬍"}
    </th>

    <th
      className="px-2 py-2 font-semibold cursor-pointer"
      onClick={() => handleSort("pace_pillar")}
    >
      PACE Pillar{" "}
      {sortConfig.key === "pace_pillar" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "⬍"}
    </th>

    <th
      className="px-3 py-2 font-semibold cursor-pointer"
      onClick={() => handleSort("channel_group")}
    >
      Channel Group{" "}
      {sortConfig.key === "channel_group" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "⬍"}
    </th>

    <th
      className="px-3 py-2 font-semibold cursor-pointer"
      onClick={() => handleSort("channel_detail")}
    >
      Sample{" "}
      {sortConfig.key === "channel_detail" ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "⬍"}
    </th>
  
  
  <th className="px-3 py-2 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {displayData.map((k, index) => (
            <tr key={k.kpi_id || index} className="border-t border-slate-200 hover:bg-slate-50/50">
              <td className="px-3 py-2 font-mono text-xs text-slate-700">{k.kpi_id}</td>
              <td className="px-3 py-2 text-[#003D7C]">{k.kpi_name}</td>
              <td className="px-3 py-2">
                <Badge variant="secondary">{k.kpi_category}</Badge>
              </td>
              <td className="px-3 py-2 text-slate-600">{k.pace_pillar}</td>
              <td className="px-3 py-2 text-slate-600">{k.channel_group}</td>
              <td className="px-3 py-2 text-slate-600">
                {k.kpi_sampleData?.labels?.[0] ? (
                  <>
                    {k.kpi_sampleData.labels[0]}:{" "}
                    <span className="font-semibold text-[#003D7C]">
                      {k.kpi_sampleData.values?.[0]}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400">No sample</span>
                )}
              </td>
              <td className="px-3 py-2">
                <Button size="sm" variant="outline" onClick={() => onKpiSelect(k)}>
                  Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KpiCatalogTable;