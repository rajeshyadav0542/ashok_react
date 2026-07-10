import React from "react";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  description?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, required, description, error, className = "", children }) => (
  <div className={`space-y-2 ${className}`}>
    <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700">
      {label}
      {required && <span className="ml-1 text-[#E0007A]">*</span>}
    </label>
    {children}
    {description ? <p className="text-sm text-slate-500">{description}</p> : null}
    {error ? <p className="text-sm text-[#E0007A]">{error}</p> : null}
  </div>
);

export default FormField;
