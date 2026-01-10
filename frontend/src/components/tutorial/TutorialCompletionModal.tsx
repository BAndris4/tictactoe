import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  visible: boolean;
}

export default function TutorialCompletionModal({ visible }: Props) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        mounted ? "bg-slate-900/50 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 transform transition-all duration-300 ${
          mounted ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 font-paytone text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Tutorial Complete
          </div>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <span className="text-4xl">🎓</span>
          </div>
        </div>

        {/* Winner name style */}
        <h2 className="text-2xl font-paytone font-black text-slate-800 text-center mb-3">
          Training Complete!
        </h2>

        {/* Description */}
        <p className="text-slate-500 font-inter text-center font-medium leading-relaxed mb-8">
          You're now ready for battle. Time to put your skills to the test!
        </p>

        {/* Single button */}
        <button
          onClick={() => navigate("/")}
          className="w-full py-4 font-paytone rounded-xl bg-slate-800 font-bold text-white hover:bg-slate-900 transition-colors shadow-lg"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
