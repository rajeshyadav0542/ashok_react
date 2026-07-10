import React, { useMemo, useState } from "react";

type ToggleGroupFieldOption = {
  key: string;
  label: string;
  checked: boolean;
  onChange: () => void;
};

interface ToggleGroupFieldProps {
  label: React.ReactNode;
  options: ToggleGroupFieldOption[];
  description?: string;
}

const ToggleGroupField: React.FC<ToggleGroupFieldProps> = ({ label, options, description }) => {
  const [dummyState, setDummyState] = useState<Record<string, boolean>>({
    dummy_segment_1: false,
    dummy_segment_2: false,
    dummy_segment_3: false,
  });

  const dummyOptions: ToggleGroupFieldOption[] = useMemo(
    () => [
      {
        key: "dummy_segment_1",
        label: "Dummy Segment A",
        checked: dummyState.dummy_segment_1,
        onChange: () => setDummyState((prev) => ({ ...prev, dummy_segment_1: !prev.dummy_segment_1 })),
      },
      {
        key: "dummy_segment_2",
        label: "Dummy Segment B",
        checked: dummyState.dummy_segment_2,
        onChange: () => setDummyState((prev) => ({ ...prev, dummy_segment_2: !prev.dummy_segment_2 })),
      },
      {
        key: "dummy_segment_3",
        label: "Dummy Segment C",
        checked: dummyState.dummy_segment_3,
        onChange: () => setDummyState((prev) => ({ ...prev, dummy_segment_3: !prev.dummy_segment_3 })),
      },
    ],
    [dummyState]
  );

  const displayedOptions = options.length > 0 ? options : dummyOptions;

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-sm font-semibold text-slate-800">{label}</div>
      {displayedOptions.map((option) => (
        <label key={option.key} className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={option.checked} onChange={option.onChange} />
          <span>{option.label}</span>
        </label>
      ))}
      {description ? <p className="text-sm text-slate-500">{description}</p> : null}
    </div>
  );
};

export default ToggleGroupField;
