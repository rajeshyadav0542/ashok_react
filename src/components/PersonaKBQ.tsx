
import React, {useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Badge,
} from "../../components";
import * as XLSX from "xlsx";
import { Users } from "lucide-react";


const PersonaMapping: React.FC<{ onFilterKpis: (id: string) => void }> = ({ onFilterKpis }) => {
  const [data, setData] = useState<any[]>([]);
  const [personaMap, setPersonaMap] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    fetch("/personas-kbq.xlsx")
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setData(jsonData);
      });
  }, []);
  console.log(data,)

  useEffect(() => {
    if (data.length > 0) {
      const map: Record<string, any[]> = {};

      data.forEach((row: any) => {
        const persona = row["Persona"];
        const kbq = row["Key Business Question"];
        const kpiIds = (row["Associated KPI IDs"] || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);

        if (!map[persona]) map[persona] = [];
        map[persona].push({ kbq, kpi_ids: kpiIds });
      });

      setPersonaMap(map);
    }
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {Object.entries(personaMap).map(([persona, rows]) => (
        <Card key={persona} className="h-full flex flex-col shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-base text-[#003D7C]">{persona}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 flex-grow">
            {rows.map((r, idx) => (
              <div
                key={idx}
                className="rounded-md border border-slate-200 p-3 bg-slate-50/70"
              >
                <div className="text-sm font-medium text-slate-700 mb-2">
                  {r.kbq}
                </div>
                <div className="flex flex-wrap gap-1">
                  {r.kpi_ids.map((id: string) => (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-slate-300"
                      onClick={() => onFilterKpis(id)}
                    >
                      {id}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PersonaMapping