import React, { useRef, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../../../components";
import { FileDown, Sparkles, TrendingUp } from "lucide-react";
import ClaimsBarChart from "./ClaimsBarChart";
import LiftBySegmentChart from "./LiftBySegmentChart";
import SegmentTable from "./SegmentTable";
import ControlForm from "../control-form";

const DashboardPage: React.FC = () => {
  const controlFormRef = useRef<HTMLDivElement | null>(null);
  const [isControlFormOpen, setIsControlFormOpen] = useState(false);
  const [showOnlyControlForm, setShowOnlyControlForm] = useState(false);

  const handleOpenControlForm = () => {
    setIsControlFormOpen(true);
    window.requestAnimationFrame(() => {
      controlFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleOpenControlFormFull = () => {
    setShowOnlyControlForm(true);
  };

  if (showOnlyControlForm) {
    return (
      <div className="space-y-6">
        <ControlForm onClose={() => setShowOnlyControlForm(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Claims Performance Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Test vs Control Claims and Lift</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Visualize average claims, incremental lift and segment-level performance for the treatment and control cohorts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <Sparkles className="h-4 w-4 text-[#003D7C]" />
              <span>Based on behavioral segment outcomes</span>
            </div>
            <Button onClick={handleOpenControlFormFull} variant="outline" size="sm" className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Test & Control Setup
            </Button>
          </div>
        </div>
      </div>

      {isControlFormOpen && (
        <div ref={controlFormRef} className="space-y-6">
          <ControlForm onClose={() => setIsControlFormOpen(false)} />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <ClaimsBarChart />
        <LiftBySegmentChart />
      </div>

      <div className="space-y-6">
        <SegmentTable />
      </div>
    </div>
  );
};

export default DashboardPage;
