type Props = {
  value: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
};

export default function TutorialStep({ value, onChange, disabled }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="mb-3 text-sm text-slate-700 font-medium">
        Do you want to play the tutorial after sign up?
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          disabled={disabled}
          className={`h-10 rounded-md border text-sm font-medium transition
            ${
              value
                ? "bg-[#5570F1] text-white border-transparent shadow"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            } disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          Yes, show tutorial
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          disabled={disabled}
          className={`h-10 rounded-md border text-sm font-medium transition
            ${
              !value
                ? "bg-[#5570F1] text-white border-transparent shadow"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            } disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          No, skip it
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        The tutorial quickly explains the rules and lets you practice before
        real games.
      </p>
    </div>
  );
}
