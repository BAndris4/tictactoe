export default function StepHeader({ step }: { step: 1 | 2 | 3 }) {
  const stepLabel =
    step === 1
      ? "Step 1 / 3 · Create your account"
      : step === 2
      ? "Step 2 / 3 · Personal details"
      : "Step 3 / 3 · Tutorial";

  return (
    <>
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-3 py-1 text-[11px] font-medium text-[#4F46E5]">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" />
        <span>{stepLabel}</span>
      </div>

      <h1 className="mb-1 text-[24px] font-bold text-deepblue tracking-tight font-paytone">
        Create an Account
      </h1>
      <p className="mb-6 text-[13px] text-[#6B7280]">
        Sign up to start tracking your games and compete with friends.
      </p>
    </>
  );
}
