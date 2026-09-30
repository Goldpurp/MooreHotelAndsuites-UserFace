import React, { useState } from "react";

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  inputClassName?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ inputClassName = "", ...props }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative min-w-0">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`ui-input pr-14 ${inputClassName}`.trim()}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-1 grid w-12 place-items-center text-gray-500 transition-colors hover:text-white"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          {visible ? "visibility_off" : "visibility"}
        </span>
      </button>
    </div>
  );
};

export default PasswordInput;
