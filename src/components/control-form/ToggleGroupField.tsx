import React, { useEffect, useMemo, useState } from "react";

type ToggleGroupFieldOption = {
  key: string;
  label: string;
  checked: boolean;
  onChange: () => void;
};

interface ToggleGroupFieldProps {
  label: React.ReactNode;
  options?: ToggleGroupFieldOption[];
  description?: string;
}

const ToggleGroupField: React.FC<ToggleGroupFieldProps> = ({
  label,
  options = [],
  description,
}) => {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [apiOptions, setApiOptions] = useState<ToggleGroupFieldOption[]>([]);

  useEffect(() => {
    const fetchMetaParameters = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/user-meta-parameters"
        );

        const result = await response.json();

        if (result.status === "success" && result.data.length > 0) {
          const row = result.data[0];

          // Matching_Segments may already be an array,
          // or may be stored as a JSON string.
          const segments =
            typeof row.Matching_Segments === "string"
              ? JSON.parse(row.Matching_Segments)
              : row.Matching_Segments;

          const generatedOptions: ToggleGroupFieldOption[] = segments.map(
            (segment: string) => ({
              key: segment,
              label: segment,
              checked: selected[segment] || false,
              onChange: () =>
                setSelected((prev) => ({
                  ...prev,
                  [segment]: !prev[segment],
                })),
            })
          );

          setApiOptions(generatedOptions);
        }
      } catch (err) {
        console.error("Failed to fetch meta parameters:", err);
      }
    };

    fetchMetaParameters();
  }, [selected]);

  const displayedOptions = useMemo(() => {
    return options.length > 0 ? options : apiOptions;
  }, [options, apiOptions]);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-sm font-semibold text-slate-800">{label}</div>

      {displayedOptions.map((option) => (
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
      ))}

      {description && (
        <p className="text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
};

export default ToggleGroupField;
