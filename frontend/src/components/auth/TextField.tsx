
import type { InputHTMLAttributes } from "react";

type Props = {
  label: string;
  error?: string;
  containerClassName?: string;
  onChange: (value: string) => void;
  // Optional props
  type?: string;
  autoComplete?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "onChange">;

export default function TextField({
  label,
  error,
  containerClassName,
  onChange,
  onBlur,
  value,
  placeholder,
  type = "text",
  autoComplete,
  name,
  disabled,
  required,
  ...rest
}: Props) {
  const hasError = Boolean(error);
  const isFilled = typeof value === "string" && value.length > 0;

  const bgClass = hasError
    ? "bg-[rgba(231,98,104,0.15)]"
    : "bg-[rgba(239,241,249,0.6)]";
  const textClass = hasError ? "text-[#E76268]" : "text-[#5E6366]";
  const borderClass = hasError
    ? "border-[#F16063]"
    : isFilled
    ? "border-[#5570F1]/60"
    : "border-transparent";
  const shadowClass = hasError
    ? "shadow-[0_0_0_1px_rgba(241,96,99,0.45)]"
    : isFilled
    ? "shadow-[0_10px_25px_rgba(15,23,42,0.12)]"
    : "shadow-none";

  return (
    <div className={containerClassName}>
      <div
        className={`
          group rounded-[8px] px-5 pt-2 pb-2 transition-all
          ${bgClass} border ${borderClass} ${shadowClass}
          focus-within:bg-[#E9ECF8]
          focus-within:shadow-[0_14px_35px_rgba(15,23,42,0.18)]
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        <div
          className={`
            text-xs font-medium transition 
            ${textClass}
            group-focus-within:text-[#5570F1]
          `}
        >
          {label}{required && <span className="text-[#E76268] ml-0.5">*</span>}
        </div>

        <input
          aria-label={label}
          {...rest}
          name={name}
          autoComplete={autoComplete}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoCorrect="off"
          autoCapitalize="none"
          disabled={disabled}
          className={`mt-1 w-full border-none bg-transparent text-[15px] text-[#4B5563] outline-none placeholder:text-[#B3B6C5] disabled:cursor-not-allowed`}
        />
      </div>

      {hasError && <p className="mt-1 text-[11px] text-[#F16063]">{error}</p>}
    </div>
  );
}
