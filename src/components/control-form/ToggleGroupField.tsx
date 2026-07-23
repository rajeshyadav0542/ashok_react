import React from "react";

export type ToggleGroupFieldOption = {
  key: string;
  label: string;
  checked: boolean;
  onChange: () => void;
};

interface ToggleGroup {
  title: string;
  options: ToggleGroupFieldOption[];
}

interface ToggleGroupFieldProps {
  label: React.ReactNode;
  groups?: ToggleGroup[];
  description?: string;
}

const ToggleGroupField: React.FC<ToggleGroupFieldProps> = ({
  label,
  groups = [],
  description,
}) => {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">

      <div className="text-sm font-semibold text-slate-800">
        {label}
      </div>


      {groups.map((group) => (
        <div
          key={group.title}
          className="space-y-2"
        >

          <div className="font-medium text-slate-700">
            {group.title}
          </div>


          {group.options.map((option) => (
            <label
              key={option.key}
              className="flex items-center gap-2 pl-4 text-sm text-slate-700"
            >

              <input
                type="checkbox"
                checked={option.checked}
                onChange={option.onChange}
              />

              <span>
                {option.label}
              </span>

            </label>
          ))}

        </div>
      ))}


      {description && (
        <p className="text-sm text-slate-500">
          {description}
        </p>
      )}

    </div>
  );
};


export default ToggleGroupField;
