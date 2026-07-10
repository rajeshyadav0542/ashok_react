import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components";

const rows = [
  { segment: "Dormant", test: 10.663, control: 2.825, unknown: 1.547 },
  { segment: "Dabbler", test: 3.836, control: 2.762, unknown: 0.447 },
  { segment: "Driver", test: 4.163, control: 1.241, unknown: 0.000 },
];

const formatValue = (value: number) => value.toFixed(3);

const SegmentTable: React.FC = () => (
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

export default SegmentTable;
