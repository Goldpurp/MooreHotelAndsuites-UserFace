import React from "react";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  htmlFor?: string;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  error,
  hint,
  htmlFor,
  className = "",
}) => {
  const feedback = error ? (
    <span className="mt-2 block text-sm text-red-400" role="alert">{error}</span>
  ) : hint ? (
    <span className="mt-2 block text-sm text-gray-500">{hint}</span>
  ) : null;

  if (htmlFor) {
    return (
      <div className={className}>
        <label htmlFor={htmlFor} className="ui-label">{label}</label>
        {children}
        {feedback}
      </div>
    );
  }

  return (
    <label className={className}>
      <span className="ui-label">{label}</span>
      {children}
      {feedback}
    </label>
  );
};

export default FormField;
