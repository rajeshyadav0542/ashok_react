import * as XLSX from "xlsx";

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

const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const getCell = (row: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
      return row[key];
    }
  }
  return "";
};

export const loadDashboardWorkbookData = async (): Promise<DashboardWorkbookData> => {
  const response = await fetch("/Final_Results.xlsx");

  if (!response.ok) {
    throw new Error(`Failed to load Excel file: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error("Excel workbook has no sheets");
  }

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
    raw: false,
  });

  if (rows.length === 0) {
    throw new Error("Excel workbook has no data rows");
  }

  const firstRow = rows[0];

  const testAvgPre = toNumber(getCell(firstRow, "Test_Avg_Pre_Sales", "Test Avg Pre Sales", "Test Avg Pre"));
  const testAvgPost = toNumber(getCell(firstRow, "Test_Avg_Post_Sales", "Test Avg Post Sales", "Test Avg Post"));
  const ctrlAvgPre = toNumber(getCell(firstRow, "Ctrl_Avg_Pre_Sales", "Ctrl Avg Pre Sales", "Ctrl Avg Pre"));
  const ctrlAvgPost = toNumber(getCell(firstRow, "Ctrl_Avg_Post_Sales", "Ctrl Avg Post Sales", "Ctrl Avg Post"));
  const testDelta = toNumber(getCell(firstRow, "Test_Delta", "Test Delta"));
  const ctrlDelta = toNumber(getCell(firstRow, "Ctrl_Delta", "Ctrl Delta"));
  const doubleDelta = toNumber(getCell(firstRow, "Double_Delta", "Double Delta"));
  const liftPct = toNumber(getCell(firstRow, "Lift_Pct", "Lift Pct", "Lift %"));

  return {
    claimsChartData: [
      { category: "Test", prePeriod: testAvgPre, utcPeriod: testAvgPost },
      { category: "Control", prePeriod: ctrlAvgPre, utcPeriod: ctrlAvgPost },
    ],
    liftChartData: [
      { segment: "Test", incrementalClaims: testDelta, liftPercent: liftPct },
      { segment: "Double Delta", incrementalClaims: doubleDelta, liftPercent: liftPct + 10 },
    ],
    segmentRows: [
      { segment: "Pre Period", test: testAvgPre, control: ctrlAvgPre, unknown: 0 },
      { segment: "UTC Period", test: testAvgPost, control: ctrlAvgPost, unknown: 0 },
      { segment: "Test Delta", test: testDelta, control: 0, unknown: 0 },
      { segment: "Control Delta", test: 0, control: ctrlDelta, unknown: 0 },
      { segment: "Double Delta", test: 0, control: 0, unknown: doubleDelta },
    ],
  };
};
