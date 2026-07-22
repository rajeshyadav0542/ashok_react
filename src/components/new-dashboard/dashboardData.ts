export interface ClaimsChartPoint {
  category: string;
  prePeriod: number;
  utcPeriod: number;
}

export interface LiftChartPoint {
  segment: string;
  incrementalClaims: number;
  liftPercent: number;
}

export interface SegmentRow {
  segment: string;
  test: number;
  control: number;
  unknown: number;
}

export interface DashboardWorkbookData {
  claimsChartData: ClaimsChartPoint[];
  liftChartData: LiftChartPoint[];
  segmentRows: SegmentRow[];
}

const toNumber = (value: any): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const loadDashboardWorkbookData =
  async (): Promise<DashboardWorkbookData> => {

    const response = await fetch(
      "http://localhost:8000/avg-claim-control"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    const result = await response.json();

    const row = result.data;

    const testAvgPre = toNumber(row.Test_Avg_Pre_Sales);
    const testAvgPost = toNumber(row.Test_Avg_Post_Sales);
    const ctrlAvgPre = toNumber(row.Ctrl_Avg_Pre_Sales);
    const ctrlAvgPost = toNumber(row.Ctrl_Avg_Post_Sales);
    const testDelta = toNumber(row.Test_Delta);
    const ctrlDelta = toNumber(row.Ctrl_Delta);
    const doubleDelta = toNumber(row.Double_Delta);
    const liftPct = toNumber(row.Lift_Pct);

    return {
      claimsChartData: [
        {
          category: "Test",
          prePeriod: testAvgPre,
          utcPeriod: testAvgPost,
        },
        {
          category: "Control",
          prePeriod: ctrlAvgPre,
          utcPeriod: ctrlAvgPost,
        },
      ],

      liftChartData: [
        {
          segment: "Test",
          incrementalClaims: testDelta,
          liftPercent: liftPct,
        },
        {
          segment: "Double Delta",
          incrementalClaims: doubleDelta,
          liftPercent: liftPct,
        },
      ],

      segmentRows: [
        {
          segment: "Pre Period",
          test: testAvgPre,
          control: ctrlAvgPre,
          unknown: 0,
        },
        {
          segment: "Measurement Period",
          test: testAvgPost,
          control: ctrlAvgPost,
          unknown: 0,
        },
        {
          segment: "Test Delta",
          test: testDelta,
          control: 0,
          unknown: 0,
        },
        {
          segment: "Control Delta",
          test: 0,
          control: ctrlDelta,
          unknown: 0,
        },
        {
          segment: "Double Delta",
          test: 0,
          control: 0,
          unknown: doubleDelta,
        },
      ],
    };
  };
