type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  label: string | React.ReactNode;
};

export default function CheckboxField({
  checked,
  onChange,
  error,
  label,
}: Props) {
  const hasError = !!error;

  return (
    <div className="mt-3">
      <label className="flex cursor-pointer items-start gap-2 text-xs text-[#4B4B5C] select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />

        <span
          className={`
            flex h-4 w-4 items-center justify-center rounded-[5px] border text-[10px] 
            transition-all duration-150
            ${
              checked
                ? "border-[#5570F1] bg-[#5570F1]"
                : "border-[#C4C6D0] bg-white"
            }
            hover:scale-[1.07] active:scale-[0.95]
            peer-focus-visible:ring-2 peer-focus-visible:ring-[#5570F1] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white
          `}
        >
          {checked && (
            <svg viewBox="0 0 16 16" className="h-3 w-3 text-white">
              <path
                d="M6.5 10.5L3.5 7.5L4.56 6.44L6.5 8.38L11.44 3.44L12.5 4.5L6.5 10.5Z"
                fill="currentColor"
              />
            </svg>
          )}
        </span>

        <span className="leading-snug">{label}</span>
      </label>

      {hasError && <p className="mt-1 text-[11px] text-[#F16063]">{error}</p>}
    </div>
  );
}
