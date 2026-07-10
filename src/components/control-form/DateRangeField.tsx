import React from "react";
import { Input } from "../../../components";

interface DateRangeFieldProps {
  title: React.ReactNode;
  startLabel: string;
  endLabel: string;
  startValue: string;
  endValue: string;
  startError?: string;
  endError?: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
}

const DateRangeField: React.FC<DateRangeFieldProps> = ({
  title,
  startLabel,
  endLabel,
  startValue,
  endValue,
  startError,
  endError,
  onStartChange,
  onEndChange,
}) => (
  <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">{title}</div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">{startLabel}</label>
        <Input type="date" value={startValue} onChange={(event) => onStartChange(event.target.value)} />
        {startError ? <p className="text-sm text-[#E0007A]">{startError}</p> : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">{endLabel}</label>
        <Input type="date" value={endValue} onChange={(event) => onEndChange(event.target.value)} />
        {endError ? <p className="text-sm text-[#E0007A]">{endError}</p> : null}
      </div>
    </div>
  </div>
);

export default DateRangeField;
