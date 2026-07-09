import React, { useState, useEffect } from "react";
import { Button, Badge } from "../../components";
import { ShieldCheck, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

interface DQRule {
  dq_rule_type: string;
  attribute_name: string;
  check_description: string;
}

interface DQRulesProps {
  onRuleSelect?: (rule: DQRule) => void;
}

const DQRules: React.FC<DQRulesProps> = ({ onRuleSelect }) => {
  const [rulesData, setRulesData] = useState<DQRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExcelData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/Digital Data DQ Repository.xlsx");

        if (!response.ok) {
          throw new Error(`Failed to fetch Excel file: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          throw new Error("Received HTML instead of Excel file. File does not exist in /public folder.");
        }

        const buffer = await response.arrayBuffer();

        if (buffer.byteLength < 100) {
          throw new Error("File too small to be valid Excel file");
        }

        const workbook = XLSX.read(buffer, { type: "array" });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error("Excel file has no sheets");
        }

        const sheetName = workbook.SheetNames[1];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
          raw: false,
        });

        if (jsonData.length === 0) {
          throw new Error("Excel file has no data rows");
        }

        const transformedData: DQRule[] = jsonData.map((row: any) => ({
          dq_rule_type: (row["Dq Rule type"] || row["DQ Rule Type"] || row["dq_rule_type"] || "").toString().trim(),
          attribute_name: (row["Attribute name"] || row["Attribute Name"] || row["attribute_name"] || "").toString().trim(),
          check_description: (row["CHECK DESC"] || row["Check Description"] || row["check_description"] || "").toString().trim(),
        }));

        setRulesData(transformedData);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsLoading(false);
      }
    };

    loadExcelData()


    
  }, []);
  

  const getRuleTypeColor = (ruleType: string) => {
    const type = ruleType.toLowerCase();
    if (type.includes("mandatory") || type.includes("required")) return "bg-red-100 text-red-800 border-red-200";
    if (type.includes("format") || type.includes("validation")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (type.includes("completeness")) return "bg-purple-100 text-purple-800 border-purple-200";
    if (type.includes("accuracy")) return "bg-green-100 text-green-800 border-green-200";
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 rounded-xl border border-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003D7C] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Data Quality Rules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 mb-2">Error Loading DQ Rules</h3>
            <p className="text-red-700 text-sm mb-3">{error}</p>

            <div className="bg-white rounded border border-red-200 p-3 mb-3">
              <p className="text-xs font-mono text-slate-700 mb-2">
                <strong>Expected file location:</strong>
              </p>
              <p className="text-xs font-mono text-slate-600">
                {window.location.origin}/Digital Data DQ Repository.xlsx
              </p>
           
            </div>

            <div className="text-xs text-red-600 space-y-1">
              <p>
                <strong>Troubleshooting:</strong>
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>
                  File is named: <code className="bg-red-100 px-1 rounded">Digital Data DQ Repository.xlsx</code>
                </li>
                <li>
                  File is in: <code className="bg-red-100 px-1 rounded">public/</code> folder
                </li>
                <li>File is .xlsx format (not .xls or .csv)</li>
                <li>Restart dev server after adding the file</li>
                <li>Verify columns: Dq Rule type, Attribute name, chcek description</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (rulesData.length === 0) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-8 text-center">
        <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
        <p className="text-slate-700 font-medium mb-2">No DQ Rules data found</p>
        <p className="text-sm text-slate-600">The file loaded but contains no valid data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#003D7C]" />
          <h2 className="text-xl font-semibold text-[#003D7C]">Digital Data Quality Repository</h2>
        </div>
        <div className="text-xs text-slate-500">
          {rulesData.length} rule{rulesData.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="overflow-auto rounded-xl border border-slate-200">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-600">
              <th className="px-4 py-3 font-semibold w-16">#</th>
              <th className="px-4 py-3 font-semibold">DQ Rule Type</th>
              <th className="px-4 py-3 font-semibold">Attribute Name</th>
              <th className="px-4 py-3 font-semibold">Check Description</th>
              <th className="px-4 py-3 font-semibold w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {rulesData.map((rule, index) => (
              <tr key={index} className="border-t border-slate-200 hover:bg-slate-50/50">
                <td className="px-4 py-3 text-slate-500 text-xs">{index + 1}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getRuleTypeColor(
                      rule.dq_rule_type
                    )}`}
                  >
                    {rule.dq_rule_type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <code className="text-[#003D7C] bg-slate-100 px-2 py-1 rounded text-xs font-medium">
                    {rule.attribute_name}
                  </code>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  <div className="line-clamp-2">{rule.check_description}</div>
                </td>
                <td className="px-4 py-3">
                  {onRuleSelect && (
                    <Button size="sm" variant="outline" onClick={() => onRuleSelect(rule)}>
                      View
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DQRules;