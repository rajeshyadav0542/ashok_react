import React, { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle, Input, Button } from "../../../components";
import { CalendarDays, FileSpreadsheet, Settings2, Sparkles, Upload, X } from "lucide-react";
import FormField from "./FormField";
import DateRangeField from "./DateRangeField";
import ToggleGroupField from "./ToggleGroupField";

type MetaOption = {
  key: string;
  label: string;
};

type FormState = {
  approach: string;
  dataPrepFileName: string;
  metaFileName: string;
  mmxFileName: string;
  campaign_start: string;
  campaign_end: string;
  pre_start: string;
  pre_end: string;
  balancingVariables: string[];
  salesMetrics: string[];
  activityTolerances: Record<string, string>;
  outlierMethod: string;
  ctrl_ratio: number;
  sales_metric: string;
  SEGMENT_CATEGORICAL_1: string;
  SEGMENT_CATEGORICAL_2: string;
  SEGMENT_CATEGORICAL_3: string;
  SEGMENT_CATEGORICAL_4: string;
  SEGMENT_NUMERICAL_1: string;
  SEGMENT_NUMERICAL_2: string;
  SEGMENT_NUMERICAL_3: string;
};

type ParsedMetaConfig = {
  segments: MetaOption[];
  sales: MetaOption[];
  activities: MetaOption[];
};

const initialFormState: FormState = {
  approach: "",
  dataPrepFileName: "",
  metaFileName: "",
  mmxFileName: "",
  campaign_start: "",
  campaign_end: "",
  pre_start: "",
  pre_end: "",
  balancingVariables: [],
  salesMetrics: [],
  activityTolerances: {},
  outlierMethod: "2*SD",
  ctrl_ratio: 0.2,
  sales_metric: "SALES_1",
  SEGMENT_CATEGORICAL_1: "null",
  SEGMENT_CATEGORICAL_2: "null",
  SEGMENT_CATEGORICAL_3: "null",
  SEGMENT_CATEGORICAL_4: "null",
  SEGMENT_NUMERICAL_1: "null",
  SEGMENT_NUMERICAL_2: "null",
  SEGMENT_NUMERICAL_3: "null",
};

const normalizeCellValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  return String(value).trim();
};

const parseMetaMappingFile = (workbook: XLSX.WorkBook): ParsedMetaConfig => {
  const segments: MetaOption[] = [];
  const sales: MetaOption[] = [];
  const activities: MetaOption[] = [];
  const seen = new Set<string>();

  const addEntry = (collection: MetaOption[], key: string, label: string) => {
    const normalizedKey = key.trim();
    const normalizedLabel = label.trim();
    if (!normalizedKey || !normalizedLabel) return;
    const uniqueKey = `${collection === segments ? "segment" : collection === sales ? "sales" : "activity"}:${normalizedKey}`;
    if (seen.has(uniqueKey)) return;
    seen.add(uniqueKey);
    collection.push({ key: normalizedKey, label: normalizedLabel });
  };

  const inferBusinessName = (row: string[], index: number): string => {
    const currentValue = row[index] || "";
    const candidateIndexes = [index + 1, index - 1, index + 2, index - 2, index + 3, index - 3];

    for (const candidateIndex of candidateIndexes) {
      if (candidateIndex < 0 || candidateIndex >= row.length) continue;
      const candidateValue = normalizeCellValue(row[candidateIndex]);
      if (!candidateValue) continue;
      if (/^(segment|sales|activity)_(\d+)$/i.test(candidateValue)) continue;
      if (candidateValue.toLowerCase().includes("segment") || candidateValue.toLowerCase().includes("sales") || candidateValue.toLowerCase().includes("activity")) continue;
      return candidateValue;
    }

    return currentValue;
  };

  const sheetNames = workbook.SheetNames || [];

  sheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) return;

    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as unknown[][];

    rows.forEach((row) => {
      const values = row.map((cell) => normalizeCellValue(cell));
      values.forEach((value, index) => {
        const genericMatch = value.match(/^(segment|sales|activity)_(\d+)$/i);
        if (!genericMatch) return;

        const label = inferBusinessName(values, index);
        const normalizedLabel = label || value;
        const key = `${genericMatch[1].toLowerCase()}_${genericMatch[2]}`;

        if (/^segment_/i.test(value)) {
          addEntry(segments, key, normalizedLabel);
        } else if (/^sales_/i.test(value)) {
          addEntry(sales, key, normalizedLabel);
        } else if (/^activity_/i.test(value)) {
          addEntry(activities, key, normalizedLabel);
        }
      });
    });
  });

  return { segments, sales, activities };
};

interface ControlFormProps {
  onClose?: () => void;
}

const ControlForm: React.FC<ControlFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [metaConfig, setMetaConfig] = useState<ParsedMetaConfig>({ segments: [], sales: [], activities: [] });
  const [metaStatus, setMetaStatus] = useState<string>("");
  const [submissionSummary, setSubmissionSummary] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dataPrepInputRef = useRef<HTMLInputElement | null>(null);
  const metaInputRef = useRef<HTMLInputElement | null>(null);
  const mmxInputRef = useRef<HTMLInputElement | null>(null);

  const canPopulateDynamicInputs = metaConfig.segments.length > 0 || metaConfig.sales.length > 0 || metaConfig.activities.length > 0;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, target: "dataPrep" | "meta" | "mmx") => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (target === "meta") {
      const extension = file.name.split(".").pop()?.toLowerCase();
      try {
        let workbook: XLSX.WorkBook;

        if (extension === "csv") {
          const text = await file.text();
          workbook = XLSX.read(text, { type: "string" });
        } else {
          const buffer = await file.arrayBuffer();
          workbook = XLSX.read(buffer, { type: "array" });
        }

        const parsedConfig = parseMetaMappingFile(workbook);
        setMetaConfig(parsedConfig);
        setMetaStatus(`Meta file loaded successfully. ${parsedConfig.segments.length} segments, ${parsedConfig.sales.length} sales metrics and ${parsedConfig.activities.length} activities detected.`);
        setFormData((prev) => ({ ...prev, metaFileName: file.name }));
        setErrors((prev) => ({ ...prev, metaFileName: "" }));
      } catch (error) {
        setMetaStatus(`Unable to read the selected file. ${error instanceof Error ? error.message : "Please try another workbook."}`);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        dataPrepFileName: target === "dataPrep" ? file.name : prev.dataPrepFileName,
        mmxFileName: target === "mmx" ? file.name : prev.mmxFileName,
      }));
      setErrors((prev) => ({ ...prev, [target === "dataPrep" ? "dataPrepFileName" : "mmxFileName"]: "" }));
    }
  };

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleToggleSelection = (field: "balancingVariables" | "salesMetrics", optionKey: string) => {
    setFormData((prev) => {
      const currentValues = prev[field];
      return {
        ...prev,
        [field]: currentValues.includes(optionKey)
          ? currentValues.filter((item) => item !== optionKey)
          : [...currentValues, optionKey],
      };
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleActivityToleranceChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      activityTolerances: {
        ...prev.activityTolerances,
        [key]: value,
      },
    }));
    setErrors((prev) => ({ ...prev, activityTolerances: "" }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.approach) {
      nextErrors.approach = "Select an approach.";
    }

    if (!formData.dataPrepFileName) {
      nextErrors.dataPrepFileName = "Upload the data prep file.";
    }

    if (!formData.metaFileName) {
      nextErrors.metaFileName = "Upload the meta mapping file.";
    }

    if (formData.approach === "Synthetic" && !formData.mmxFileName) {
      nextErrors.mmxFileName = "Synthetic approach requires an MMX file.";
    }

    if (!formData.campaign_start) {
      nextErrors.campaign_start = "Campaign start date is required.";
    }

    if (!formData.campaign_end) {
      nextErrors.campaign_end = "Campaign end date is required.";
    }

    if (formData.campaign_start && formData.campaign_end && formData.campaign_start > formData.campaign_end) {
      nextErrors.campaign_end = "Campaign end date must be on or after the start date.";
    }

    if ((formData.pre_start && !formData.pre_end) || (!formData.pre_start && formData.pre_end)) {
      nextErrors.preCampaignPeriod = "Complete both pre-campaign dates or clear them.";
    }

    if (formData.pre_start && formData.pre_end && formData.pre_start > formData.pre_end) {
      nextErrors.pre_end = "Pre-campaign end date must be on or after the start date.";
    }

    if (metaConfig.segments.length > 0 && formData.balancingVariables.length === 0) {
      nextErrors.balancingVariables = "Select at least one balancing variable.";
    }

    if (metaConfig.sales.length > 0 && formData.salesMetrics.length === 0) {
      nextErrors.salesMetrics = "Select at least one sales metric.";
    }

    if (activityEntries.length > 0 && activityEntries.some((activity) => !formData.activityTolerances[activity.key]?.trim())) {
      nextErrors.activityTolerances = "Provide tolerance values for all activities.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
    setMetaConfig({ segments: [], sales: [], activities: [] });
    setMetaStatus("");
    if (dataPrepInputRef.current) dataPrepInputRef.current.value = "";
    if (metaInputRef.current) metaInputRef.current.value = "";
    if (mmxInputRef.current) mmxInputRef.current.value = "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      setSubmissionSummary("Please fix the highlighted errors and submit again.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionSummary("Saving campaign control configuration...");

    try {
      const response = await fetch("http://localhost:8000/api/campaign-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || "Unable to save form data.");
      }

      const selectedSegments = formData.balancingVariables
        .map((key) => metaConfig.segments.find((option) => option.key === key)?.label || key)
        .join(", ");
      const selectedSales = formData.salesMetrics
        .map((key) => metaConfig.sales.find((option) => option.key === key)?.label || key)
        .join(", ");

      const successMessage = `Control configuration submitted for ${formData.approach}. Campaign ${formData.campaign_start || "-"} to ${formData.campaign_end || "-"}. Balancing variables: ${selectedSegments || "None"}. Sales metrics: ${selectedSales || "None"}.`;
      setSubmissionSummary(successMessage);
      setShowSuccessPopup(true);
      resetForm();
    } catch (error) {
      setSubmissionSummary(`Unable to save control configuration. ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activityEntries = useMemo(() => metaConfig.activities, [metaConfig.activities]);

  return (
    <>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#00AEEF]">
                <Sparkles className="h-4 w-4" />
                Control Setup
              </div>
              <CardTitle className="mt-2 text-2xl text-slate-900">Campaign Control Form</CardTitle>
            </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Meta-driven inputs for control and balancing configuration
            </div>
            {onClose && (
              <button
                type="button"
                aria-label="Close control form"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="approach">
                Approach <span className="text-[#E0007A]">*</span>
              </label>
              <select
                id="approach"
                required
                value={formData.approach}
                onChange={(event) => handleFieldChange("approach", event.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
              >
                <option value="">Select approach</option>
                <option value="Stratification">Stratification</option>
                <option value="Traditional">Traditional</option>
                <option value="Synthetic">Synthetic</option>
              </select>
              {errors.approach ? <p className="text-sm text-[#E0007A]">{errors.approach}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Data / Files upload</label>
              <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <Upload className="h-4 w-4 text-[#003D7C]" />
                  Data prep file
                  <input ref={dataPrepInputRef} type="file" accept=".xlsx,.xls,.csv" className="ml-auto text-sm" onChange={(event) => handleFileUpload(event, "dataPrep")} />
                </label>
                {errors.dataPrepFileName ? <p className="text-sm text-[#E0007A]">{errors.dataPrepFileName}</p> : null}
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <FileSpreadsheet className="h-4 w-4 text-[#003D7C]" />
                  Meta mapping file
                  <input ref={metaInputRef} type="file" accept=".xlsx,.xls,.csv" className="ml-auto text-sm" onChange={(event) => handleFileUpload(event, "meta")} />
                </label>
                {errors.metaFileName ? <p className="text-sm text-[#E0007A]">{errors.metaFileName}</p> : null}
                {formData.approach === "Synthetic" && (
                  <>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <Settings2 className="h-4 w-4 text-[#003D7C]" />
                      MMX file
                      <input ref={mmxInputRef} type="file" accept=".xlsx,.xls,.csv" className="ml-auto text-sm" onChange={(event) => handleFileUpload(event, "mmx")} />
                    </label>
                    {errors.mmxFileName ? <p className="text-sm text-[#E0007A]">{errors.mmxFileName}</p> : null}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DateRangeField
              title={
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <CalendarDays className="h-4 w-4 text-[#003D7C]" />
                  Campaign Period
                </div>
              }
              startLabel="Campaign period start date"
              endLabel="Campaign period end date"
              startValue={formData.campaign_start}
              endValue={formData.campaign_end}
              startError={errors.campaign_start}
              endError={errors.campaign_end}
              onStartChange={(value) => handleFieldChange("campaign_start", value)}
              onEndChange={(value) => handleFieldChange("campaign_end", value)}
            />
            <DateRangeField
              title={
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <CalendarDays className="h-4 w-4 text-[#003D7C]" />
                  Pre-campaign Period
                </div>
              }
              startLabel="Pre-campaign start date"
              endLabel="Pre-campaign end date"
              startValue={formData.pre_start}
              endValue={formData.pre_end}
              startError={errors.pre_start}
              endError={errors.pre_end || errors.preCampaignPeriod}
              onStartChange={(value) => handleFieldChange("pre_start", value)}
              onEndChange={(value) => handleFieldChange("pre_end", value)}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
              <ToggleGroupField
                label={<div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Settings2 className="h-4 w-4 text-[#003D7C]" />Balancing configuration</div>}
                description="These values are auto-fetched from the meta file and show the actual mapped segment names."
                options={canPopulateDynamicInputs && metaConfig.segments.length > 0 ? metaConfig.segments.map((option) => ({
                  key: option.key,
                  label: option.label,
                  checked: formData.balancingVariables.includes(option.key),
                  onChange: () => handleToggleSelection("balancingVariables", option.key),
                })) : []}
              />
              {!canPopulateDynamicInputs || metaConfig.segments.length === 0 ? (
                <p className="text-sm text-slate-500">Upload the meta mapping file to enable segment-based balancing selections.</p>
              ) : null}
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
              <ToggleGroupField
                label={<div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Settings2 className="h-4 w-4 text-[#003D7C]" />Sales metrics</div>}
                description="Select one or more sales metrics from the mapped business columns."
                options={canPopulateDynamicInputs && metaConfig.sales.length > 0 ? metaConfig.sales.map((option) => ({
                  key: option.key,
                  label: option.label,
                  checked: formData.salesMetrics.includes(option.key),
                  onChange: () => handleToggleSelection("salesMetrics", option.key),
                })) : []}
              />
              {!canPopulateDynamicInputs || metaConfig.sales.length === 0 ? (
                <p className="text-sm text-slate-500">Upload the meta mapping file to enable sales metric selection.</p>
              ) : null}
            </div>
            
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Settings2 className="h-4 w-4 text-[#003D7C]" />
              Tolerance configuration
            </div>
            <p className="text-sm text-slate-600">Activity-level tolerances are generated directly from the meta file and displayed using the actual activity names.</p>
            <div className="space-y-3">
              {activityEntries.length > 0 ? (
                activityEntries.map((activity) => (
                  <div key={activity.key} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
                    <label className="text-sm font-medium text-slate-700">{activity.label}</label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00%"
                      value={formData.activityTolerances[activity.key] || ""}
                      onChange={(event) => handleActivityToleranceChange(activity.key, event.target.value)}
                      className="max-w-[140px]"
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Upload the meta mapping file to generate activity-level tolerance fields.</p>
              )}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Outlier removal method</label>
              <select
                value={formData.outlierMethod}
                onChange={(event) => handleFieldChange("outlierMethod", event.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
              >
                <option value="3*SD">3*SD</option>
                <option value="2*SD">2*SD</option>
                <option value="1*SD">1*SD</option>
              </select>
            </div>
            <div className="flex items-start">
              <Button type="submit" className="" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>

          {submissionSummary && (
            <div className="rounded-2xl border border-[#00AEEF]/20 bg-[#F3FBFF] p-4 text-sm text-slate-700">
              {submissionSummary}
            </div>
          )}
        </form>
      </CardContent>
    </Card>

    {showSuccessPopup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00AEEF]">Success</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Configuration submitted</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 text-sm text-slate-700">{submissionSummary || "Your configuration has been successfully submitted."}</p>
          <div className="mt-6 flex justify-end">
            <Button type="button" onClick={() => setShowSuccessPopup(false)}>
              Close
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ControlForm;
