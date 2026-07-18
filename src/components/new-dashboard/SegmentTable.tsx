import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components";
import { SegmentRow, loadDashboardWorkbookData } from "./dashboardData";

const formatValue = (value: number) => value.toFixed(3);

const SegmentTable: React.FC = () => {
  const [rows, setRows] = useState<SegmentRow[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const workbookData = await loadDashboardWorkbookData();
        setRows(workbookData.segmentRows);
      } catch (error) {
        console.error("Unable to load dashboard Excel data", error);
      }
    };

    loadData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-[#003D7C]">Claims Performance by Segment</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-3 text-left font-semibold">Segment</th>
              <th className="px-3 py-3 text-right font-semibold">TEST</th>
              <th className="px-3 py-3 text-right font-semibold">CTRL</th>
              <th className="px-3 py-3 text-right font-semibold">Unknown</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {rows.map((row) => (
              <tr key={row.segment} className="hover:bg-slate-50">
                <td className="px-3 py-3 text-slate-700">{row.segment}</td>
                <td className="px-3 py-3 text-right font-semibold text-slate-800">{formatValue(row.test)}</td>
                <td className="px-3 py-3 text-right text-slate-700">{formatValue(row.control)}</td>
                <td className="px-3 py-3 text-right text-slate-700">{formatValue(row.unknown)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default SegmentTable;
