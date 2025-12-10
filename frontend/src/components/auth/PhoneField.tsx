
import { useEffect, useRef } from "react";
import type { CountryCodeOption } from "../../data/countryCodes";

type Props = {
  label: string;
  value: string;
  options: CountryCodeOption[];
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

export default function PhoneField({
  label,
  value,
  options,
  error,
  onChange,
  onBlur,
}: Props) {
  const hasError = !!error;
  const isFilled = value && value.length > 0;

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

  const ref = useRef<HTMLInputElement | null>(null);

  const normalize = (raw: string | undefined | null): string => {
    if (!raw) return "";

    let cleaned = raw.normalize("NFKC").replace(/[^\d+]/g, "");

    if (cleaned.startsWith("00")) cleaned = "+" + cleaned.slice(2);

    if (cleaned.length > 0 && !cleaned.startsWith("+")) {
      cleaned = "+" + cleaned;
    }

    const match = options.find((o) => cleaned.startsWith(o.dialCode));
    if (match) {
      const rest = cleaned.slice(match.dialCode.length);
      return `${match.dialCode}${rest ? " " + rest : ""}`;
    }
    return cleaned;
  };

  const handleInput = (raw: string) => {
    onChange(normalize(raw));
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      const autofill = el.value;
      if (autofill && autofill !== value) onChange(normalize(autofill));
    };
    const t1 = setTimeout(sync, 120);
    const t2 = setTimeout(sync, 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="flex flex-col">
      <div
        className={`
          group rounded-[8px] px-5 pt-2 pb-2 transition-all
          ${bgClass} border ${borderClass} ${shadowClass}
          focus-within:bg-[#E9ECF8]
          focus-within:shadow-[0_14px_35px_rgba(15,23,42,0.18)]
        `}
      >
        <div
          className={`
            text-xs font-medium transition 
            ${textClass}
            group-focus-within:text-[#5570F1]
          `}
        >
          {label}
        </div>

        <input
          ref={ref}
          name="tel"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={value ?? ""}
          onChange={(e) => handleInput(e.target.value)}
          onBlur={onBlur}
          className="mt-1 w-full border-none bg-transparent 
            text-[15px] text-[#4B5563] outline-none 
            placeholder:text-[#B3B6C5]"
        />
      </div>

      {hasError && <p className="mt-1 text-[11px] text-[#F16063]">{error}</p>}
    </div>
  );
}
