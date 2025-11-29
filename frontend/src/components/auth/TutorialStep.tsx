type Props = {
  value: boolean;
  onChange: (val: boolean) => void;
};

export default function TutorialStep({ value, onChange }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="mb-3 text-sm text-slate-700 font-medium">
        Do you want to play the tutorial after sign up?
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`h-10 rounded-md border text-sm font-medium transition
            ${
              value
                ? "bg-[#5570F1] text-white border-transparent shadow"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }
          `}
        >
          Yes, show tutorial
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`h-10 rounded-md border text-sm font-medium transition
            ${
              !value
                ? "bg-[#5570F1] text-white border-transparent shadow"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }
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
