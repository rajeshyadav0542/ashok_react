import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

const data = [
  { category: "Test", prePeriod: 8.33, utcPeriod: 8.64 },
  { category: "Control", prePeriod: 8.36, utcPeriod: 8.52 },
];

const ClaimsBarChart: React.FC = () => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="text-base text-[#003D7C]">Avg Claims - Test vs. Control</CardTitle>
    </CardHeader>
    <CardContent className="h-[360px] px-2 py-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 24, right: 32, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" tick={{ fill: "#334155", fontSize: 12 }} />
          <YAxis tick={{ fill: "#334155", fontSize: 12 }} />
          <Tooltip formatter={(value: number) => value.toFixed(2)} />
          <Legend verticalAlign="top" height={32} />
          <Bar dataKey="prePeriod" name="Pre period" fill="#0f172a" barSize={28}>
            <LabelList dataKey="prePeriod" position="top" formatter={(label) => {
              const value = Number(label as any);
              return Number.isNaN(value) ? label : value.toFixed(2);
            }} />
          </Bar>
          <Bar dataKey="utcPeriod" name="UTC period" fill="#0ea5e9" barSize={28}>
            <LabelList dataKey="utcPeriod" position="top" formatter={(label) => {
              const value = Number(label as any);
              return Number.isNaN(value) ? label : value.toFixed(2);
            }} />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default ClaimsBarChart;
