type Props = {
  step: 1 | 2 | 3;
  onBack: () => void;
  onNext: () => void;
};

export default function StepActions({ step, onBack, onNext }: Props) {
  return (
    <div className="mt-4 flex items-center gap-3">
      {step > 1 && (
        <button
          type="button"
          onClick={onBack}
          className="
            inline-flex h-12 flex-1 items-center justify-center rounded-xl
            border-2 border-slate-100 bg-white text-sm font-bold text-deepblue
            transition hover:bg-slate-50 hover:border-slate-200 active:translate-y-[1px]
            font-paytone
          "
        >
          Back
        </button>
      )}

      {step < 3 && (
        <button
          type="button"
          onClick={onNext}
          className="
            group relative inline-flex h-11 flex-1 items-center justify-center
            overflow-hidden rounded-md bg-[#5570F1] text-sm font-medium text-white
            shadow-[0_10px_30px_rgba(85,112,241,0.45)]
            transition-all duration-300
            hover:bg-[#4356C4] hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(67,86,196,0.70)]
            active:translate-y-0 active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-[#5570F1] focus:ring-offset-2 focus:ring-offset-white
            w-full
          "
        >
          <span className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-[linear-gradient(120deg,rgba(255,255,255,0.6),rgba(255,255,255,0))] opacity-70 transition-transform duration-500 group-hover:translate-x-[120%]" />
          <span className="relative z-10">Continue</span>
        </button>
      )}

      {step === 3 && (
        <button
          type="submit"
          className="
            group relative inline-flex h-11 flex-1 items-center justify-center
            overflow-hidden rounded-md bg-[#5570F1] text-sm font-medium text-white
            shadow-[0_10px_30px_rgba(85,112,241,0.45)]
            transition-all duration-300
            hover:bg-[#4356C4] hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(67,86,196,0.70)]
            active:translate-y-0 active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-[#5570F1] focus:ring-offset-2 focus:ring-offset-white
            w-full
          "
        >
          <span className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-[linear-gradient(120deg,rgba(255,255,255,0.6),rgba(255,255,255,0))] opacity-70 transition-transform duration-500 group-hover:translate-x-[120%]" />
          <span className="relative z-10">Create Account</span>
        </button>
      )}
    </div>
  );
}
