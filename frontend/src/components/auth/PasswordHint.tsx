import type { PasswordChecks } from "../../rules/validation";

type Props = {
  checks: PasswordChecks;
};

export default function PasswordHint({ checks }: Props) {
  const baseChip =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border transition-colors";

  const okChip = "border-[#16A34A]/40 bg-[#ECFDF3] text-[#166534]";
  const badChip = "border-[#D1D5DB] bg-[#F9FAFB] text-[#9CA3AF]";

  return (
    <div className="mt-2 space-y-1 text-[11px] text-[#6B7280]">
      <div>Password must contain:</div>

      <div className="flex flex-wrap gap-1.5">
        <span
          className={`
            ${baseChip}
            ${checks.hasMinLength ? okChip : badChip}
          `}
        >
          <span className="text-[9px]">●</span> 8+ characters
        </span>

        <span
          className={`
            ${baseChip}
            ${checks.hasUppercase ? okChip : badChip}
          `}
        >
          <span className="text-[9px]">●</span> Capital letter
        </span>

        <span
          className={`
            ${baseChip}
            ${checks.hasNumber ? okChip : badChip}
          `}
        >
          <span className="text-[9px]">●</span> Number
        </span>

        <span
          className={`
            ${baseChip}
            ${checks.hasSpecial ? okChip : badChip}
          `}
        >
          <span className="text-[9px]">●</span> Special character
        </span>
      </div>
    </div>
  );
}
