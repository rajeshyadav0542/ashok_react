import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../../components";

interface SegmentData {
  Job_ID: string;
  Test_Avg_Pre_Sales: number;
  Test_Avg_Post_Sales: number;
  Ctrl_Avg_Pre_Sales: number;
  Ctrl_Avg_Post_Sales: number;
  Test_Delta: number;
  Ctrl_Delta: number;
  Double_Delta: number;
  Lift_Pct: number | null;
  P_Value: number | null;
  Significance: string;
}


const SegmentTable: React.FC = () => {
  const [data, setData] = useState<SegmentData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("http://localhost:8000/avg-claim-control");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const result = await response.json();
        console.log(result);
        console.log(result.data);
        setData(result.data);
      } catch (error) {
        console.error("Unable to load dashboard data", error);
      }
    };

    loadData();
  }, []);

  if (!data) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">Loading... </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
      <div>
        <Card className="h-44 flex flex-col items-center justify-center text-center shadow-md rounded-xl">
          <h4 className="text-2xl font-bold text-blue-700">
            {data.Lift_Pct !== null ? `${data.Lift_Pct}%` : "N/A"}
          </h4>
          <p className="mt-2 text-sm text-gray-600">Lift for Test vs Control</p>
          <p className="mt-3 font-semibold text-green-600">
             Statistically Significant
          </p>
        </Card>
      </div>

      <div>
        <Card className="h-44 flex flex-col items-center justify-center text-center shadow-md rounded-xl">
          <h4 className="text-lg font-semibold">Test Delta</h4>
          <p className="mt-2 text-sm text-gray-600">For campaign vs Pre Period</p>
          <p className="mt-4 text-2xl font-bold text-slate-700">
            {data?.Test_Delta}
            <span className="mt-2 text-sm text-gray-600"> avg claims / HCP</span>
          </p>
        </Card>
      </div>

      <div>
        <Card className="h-44 flex flex-col items-center justify-center text-center shadow-md rounded-xl">
          <h4 className="text-lg font-semibold">Control Delta</h4>
          <p className="mt-2 text-sm text-gray-600">For campaign vs Pre Period</p>
          <p className="mt-4 text-2xl font-bold text-slate-700">
            {data.Ctrl_Delta}
            <span className="mt-2 text-sm text-gray-600"> avg claims / HCP</span>
          </p>
        </Card>
      </div>

      <div>
        <Card className="h-44 flex flex-col items-center justify-center text-center shadow-md rounded-xl">
          <h4 className="text-lg font-semibold">Double Delta</h4>
          <p className="mt-2 text-sm text-gray-600">Difference b/w Test and Control Delta</p>
          <p className="mt-4 text-2xl font-bold text-slate-700">
            {data.Double_Delta}
            <span className="mt-2 text-sm text-gray-600"> avg claims / HCP</span>
          </p>
        </Card>
      </div>

      <div>
        <Card className="h-44 flex flex-col items-center justify-center text-center shadow-md rounded-xl">
          <h4 className="text-lg font-semibold">P Value</h4>
          <p className="mt-4 text-2xl font-bold text-slate-700">
            {data.P_Value ?? "N/A"}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default SegmentTable;
