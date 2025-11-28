import { useState } from "react";
import type { PasswordChecks } from "../../rules/validation";
import PasswordHint from "./PasswordHint";

import EyeOn from "../../assets/eye_on.svg";
import EyeOff from "../../assets/eye_off.svg";
import CheckIcon from "../../assets/check.svg";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  checks: PasswordChecks;
};

export default function PasswordField({
  label,
  value,
  onChange,
  onBlur,
  error,
  checks,
}: Props) {
  const [show, setShow] = useState(false);

  const passwordIsValid =
    checks.hasMinLength &&
    checks.hasUppercase &&
    checks.hasNumber &&
    checks.hasSpecial;

  const hasError = !!error;
  const isFilled = value.length > 0;

  const bgClass = hasError
    ? "bg-[rgba(231,98,104,0.15)]"
    : passwordIsValid && value
    ? "bg-[rgba(56,222,136,0.10)]"
    : "bg-[rgba(239,241,249,0.6)]";

  const labelClass = hasError
    ? "text-[#E76268]"
    : passwordIsValid && value
    ? "text-[#16A34A]"
    : "text-[#5E6366]";

  const borderClass = hasError
    ? "border-[#F16063]"
    : passwordIsValid && value
    ? "border-[#16A34A]/70"
    : isFilled
    ? "border-[#5570F1]/60"
    : "border-transparent";

  const shadowClass = hasError
    ? "shadow-[0_0_0_1px_rgba(241,96,99,0.45)]"
    : passwordIsValid && value
    ? "shadow-[0_12px_30px_rgba(22,163,74,0.25)]"
    : isFilled
    ? "shadow-[0_10px_25px_rgba(15,23,42,0.12)]"
    : "shadow-none";

  return (
    <div className="flex flex-col">
      <div
        className={`
          group rounded-[8px] px-5 pt-2 pb-2 transition-all
          ${bgClass} border ${borderClass} ${shadowClass}
          focus-within:bg-[#E9ECF8]
          focus-within:shadow-[0_16px_38px_rgba(15,23,42,0.22)]
        `}
      >
        <div
          className={`
            text-xs font-medium transition 
            ${labelClass}
            group-focus-within:text-[#5570F1]
          `}
        >
          {label}
        </div>

        <div className="mt-1 flex items-center gap-2">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder="••••••••"
            className="flex-1 border-none bg-transparent 
              text-[15px] text-[#111827] outline-none 
              placeholder:text-[#B3B6C5]"
          />

          {passwordIsValid && value && !hasError && (
            <img
              src={CheckIcon}
              alt="valid"
              className="h-6 w-6 mr-1 animate-[pop_180ms_ease-out]"
            />
          )}

          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-transparent outline-none hover:bg-white/40 transition"
          >
            <img
              src={show ? EyeOff : EyeOn}
              alt={show ? "Hide password" : "Show password"}
              className="h-5 w-5 opacity-80"
            />
          </button>
        </div>
      </div>

      {hasError && <p className="mt-1 text-[11px] text-[#F16063]">{error}</p>}

      <PasswordHint checks={checks} />
    </div>
  );
}
