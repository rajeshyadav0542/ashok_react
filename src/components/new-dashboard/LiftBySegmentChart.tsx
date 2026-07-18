import React, { useEffect, useState } from "react";
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
import { LiftChartPoint, loadDashboardWorkbookData } from "./dashboardData";

const LiftBySegmentChart: React.FC = () => {
  const [data, setData] = useState<LiftChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const liftAxisDomain: [number, number] = data.length
    ? [Math.min(...data.map((item) => item.liftPercent)) - 5, Math.max(...data.map((item) => item.liftPercent)) + 5]
    : [0, 35];

  useEffect(() => {
    const loadData = async () => {
      try {
        const workbookData = await loadDashboardWorkbookData();
        setData(workbookData.liftChartData);
      } catch (error) {
        console.error("Unable to load dashboard Excel data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base text-[#003D7C]">Incremental Lift (Test vs. Control) by Behavioral Segments</CardTitle>
      </CardHeader>
      <CardContent className="h-[360px] px-2 py-4">
        {isLoading || data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-500">Loading chart...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={360}>
            <ComposedChart data={data} margin={{ top: 24, right: 40, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="segment" tick={{ fill: "#334155", fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fill: "#334155", fontSize: 12 }} label={{ value: "Claims", angle: -90, position: "insideLeft", fill: "#334155", fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#334155", fontSize: 12 }} domain={liftAxisDomain} tickFormatter={(value) => `${value}%`} label={{ value: "Lift %", angle: 90, position: "insideRight", fill: "#334155", fontSize: 12 }} />
              <Tooltip formatter={(value: number, name: string) => (name === "liftPercent" ? `${value}%` : value.toFixed(2))} />
              <Legend verticalAlign="top" height={32} />
              <Bar yAxisId="left" dataKey="incrementalClaims" name="Incremental Claims" fill="#0f172a" barSize={26}>
                <LabelList dataKey="incrementalClaims" position="top" formatter={(label) => {
                  const value = Number(label as any);
                  return Number.isNaN(value) ? label : value.toFixed(2);
                }} />
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="liftPercent" name="Incremental Lift %" stroke="#fb7185" strokeWidth={3} dot={{ r: 6, stroke: "#fb7185", strokeWidth: 2, fill: "#ffffff" }} activeDot={{ r: 8, stroke: "#fb7185", strokeWidth: 2, fill: "#ffffff" }}>
                <LabelList dataKey="liftPercent" position="top" formatter={(label) => {
                  const value = Number(label as any);
                  return Number.isNaN(value) ? label : `${value.toFixed(2)}%`;
                }} />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default LiftBySegmentChart;
