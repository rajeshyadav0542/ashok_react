import React from "react";

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

const ToggleGroupField: React.FC<ToggleGroupFieldProps> = ({
  label,
  options,
  description,
}) => {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-sm font-semibold text-slate-800">{label}</div>

      {options.length === 0 ? (
        <p className="text-sm text-slate-500">No data available</p>
      ) : (
        options.map((option) => (
          <label
            key={option.key}
            className="flex items-center gap-2 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              checked={option.checked}
              onChange={option.onChange}
            />
            <span>{option.label}</span>
          </label>
        ))
      )}

      {description && (
        <p className="text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
};

export default ToggleGroupField;
