import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

const data = [
  { segment: "Dormant", incrementalClaims: 0.1, liftPercent: 7 },
  { segment: "Dabbler", incrementalClaims: 0.11, liftPercent: 24 },
  { segment: "Driver", incrementalClaims: 0.15, liftPercent: 27 },
  { segment: "Unknown", incrementalClaims: 0.27, liftPercent: 11 },
];

const LiftBySegmentChart: React.FC = () => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="text-base text-[#003D7C]">Incremental Lift (Test vs. Control) by Behavioral Segments</CardTitle>
    </CardHeader>
    <CardContent className="h-[360px] px-2 py-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 24, right: 40, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="segment" tick={{ fill: "#334155", fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fill: "#334155", fontSize: 12 }} label={{ value: "Claims", angle: -90, position: "insideLeft", fill: "#334155", fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: "#334155", fontSize: 12 }} domain={[0, 35]} tickFormatter={(value) => `${value}%`} label={{ value: "Lift %", angle: 90, position: "insideRight", fill: "#334155", fontSize: 12 }} />
          <Tooltip formatter={(value: number, name: string) => name === "liftPercent" ? `${value}%` : value.toFixed(2)} />
          <Legend verticalAlign="top" height={32} />
          <Bar yAxisId="left" dataKey="incrementalClaims" name="Incremental Claims" fill="#0f172a" barSize={26}>
            <LabelList dataKey="incrementalClaims" position="top" formatter={(label) => {
              const value = Number(label as any);
              return Number.isNaN(value) ? label : value.toFixed(2);
            }} />
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="liftPercent" name="Incremental Lift %" stroke="#fb7185" strokeWidth={3} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default LiftBySegmentChart;
