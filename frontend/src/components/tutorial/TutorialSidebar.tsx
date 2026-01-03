import { useNavigate } from "react-router-dom";
import type { TutorialStep } from "../../data/tutorialSteps";

type Expression = "neutral" | "happy" | "sad" | "excited";

export default function TutorialSidebar({
  step,
  totalSteps,
  currentStepIndex,
  expression,
  onNext,
}: {
  step: TutorialStep;
  totalSteps: number;
  currentStepIndex: number;
  expression: Expression;
  onNext: () => void;
}) {
  const navigate = useNavigate();
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  const isSad = expression === "sad";
  const isHappy = expression === "happy" || expression === "excited";

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-sunshine/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-coral/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Header */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-sunshine rounded-full blur-md opacity-50 animate-pulse" />
              <div className="relative w-3 h-3 rounded-full bg-gradient-to-br from-sunshine to-amber-500 shadow-lg" />
            </div>
            <h3 className="text-xl font-black font-paytone text-slate-800">
              Tutorial Mode
            </h3>
          </div>
          <div className="px-3 py-1 rounded-full bg-white shadow-md border border-slate-200">
            <span className="text-xs font-bold text-slate-600">
              {currentStepIndex + 1}/{totalSteps}
            </span>
          </div>
        </div>

        {/* Progress Bar with Glow */}
        <div className="relative">
          <div className="h-2 bg-slate-200/80 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-sunshine to-amber-500 transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Guide Avatar with SVG Robot */}
      <div className="mb-6 flex justify-center relative z-10">
        <div
          className={`relative transition-all duration-500 ${
            isHappy ? "scale-110" : ""
          } ${isSad ? "shake" : ""}`}
        >
          {/* Outer Glow Ring */}
          <div
            className={`absolute inset-0 rounded-3xl blur-2xl opacity-40 transition-all duration-500 ${
              isSad ? "bg-coral" : isHappy ? "bg-sunshine" : "bg-slate-400"
            } ${isHappy ? "animate-pulse" : ""}`}
          />

          {/* Avatar Container */}
          <div
            className={`relative w-36 h-36 rounded-3xl shadow-2xl flex items-center justify-center transition-all duration-500 ${
              isSad
                ? "bg-gradient-to-br from-coral/20 to-coral/10"
                : isHappy
                ? "bg-gradient-to-br from-sunshine/20 to-amber-500/10"
                : "bg-gradient-to-br from-slate-100 to-slate-50"
            } border-2 ${
              isSad
                ? "border-coral/30"
                : isHappy
                ? "border-sunshine/30"
                : "border-slate-200"
            }`}
          >
            {/* SVG Robot "Kai" */}
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              {/* Body */}
              <rect
                x="25"
                y="45"
                width="50"
                height="40"
                rx="8"
                fill="#1e293b"
                className="transition-all duration-300"
              />

              {/* Screen/Face */}
              <rect
                x="30"
                y="50"
                width="40"
                height="30"
                rx="6"
                fill={isSad ? "#fb7185" : isHappy ? "#fbbf24" : "#38bdf8"}
                className="transition-colors duration-500"
              />

              {/* Eyes */}
              <circle
                cx="42"
                cy="62"
                r="3"
                fill="#1e293b"
                className={isHappy ? "animate-pulse" : ""}
              />
              <circle
                cx="58"
                cy="62"
                r="3"
                fill="#1e293b"
                className={isHappy ? "animate-pulse" : ""}
              />

              {/* Mouth */}
              {isHappy ? (
                <path
                  d="M 42 70 Q 50 75 58 70"
                  stroke="#1e293b"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              ) : isSad ? (
                <path
                  d="M 42 73 Q 50 68 58 73"
                  stroke="#1e293b"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              ) : (
                <line
                  x1="42"
                  y1="72"
                  x2="58"
                  y2="72"
                  stroke="#1e293b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Antenna */}
              <line
                x1="50"
                y1="45"
                x2="50"
                y2="35"
                stroke="#1e293b"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle
                cx="50"
                cy="32"
                r="4"
                fill={isSad ? "#fb7185" : isHappy ? "#fbbf24" : "#94a3b8"}
                className={isHappy ? "animate-ping" : ""}
              />
              <circle
                cx="50"
                cy="32"
                r="4"
                fill={isSad ? "#fb7185" : isHappy ? "#fbbf24" : "#94a3b8"}
              />

              {/* Arms */}
              <rect x="15" y="55" width="8" height="20" rx="4" fill="#475569" />
              <rect x="77" y="55" width="8" height="20" rx="4" fill="#475569" />

              {/* Hands */}
              <circle cx="19" cy="77" r="4" fill="#64748b" />
              <circle cx="81" cy="77" r="4" fill="#64748b" />

              {/* Body Details */}
              <circle cx="40" cy="60" r="2" fill="#fbbf24" />
              <circle cx="50" cy="60" r="2" fill="#fb7185" />
              <circle cx="60" cy="60" r="2" fill="#38bdf8" />
            </svg>
          </div>

          {/* Name Badge */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-white shadow-xl border-2 border-sunshine/30">
            <span className="text-sm font-paytone font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Kai
            </span>
          </div>
        </div>
      </div>

      {/* Message Card */}
      <div className="flex-1 flex flex-col justify-center mb-6 relative z-10">
        <div className="relative group">
          {/* Glow Border Effect */}
          <div
            className={`absolute -inset-0.5 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500 ${
              isSad
                ? "bg-gradient-to-r from-coral to-rose-400"
                : "bg-gradient-to-r from-sunshine to-amber-400"
            }`}
          />

          {/* Card Content */}
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                  isSad
                    ? "bg-gradient-to-br from-coral to-rose-500"
                    : "bg-gradient-to-br from-sunshine to-amber-500"
                }`}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isSad ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
              </div>
              <div className="flex-1">
                <h4
                  className={`text-lg font-black font-inter mb-2 ${
                    isSad ? "text-coral" : "text-slate-800"
                  }`}
                >
                  {isSad ? "Oops!" : step.title}
                </h4>
                <p className="text-slate-600 leading-relaxed font-inter text-sm">
                  {isSad
                    ? "That move isn't allowed. Please try again!"
                    : step.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 relative z-10">
        {step.targetMove === null && step.id !== 8 && (
          <button
            onClick={onNext}
            className="group w-full py-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold shadow-lg hover:shadow-2xl hover:shadow-slate-400/50 transition-all active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative font-paytone">Next Step</span>
            <svg
              className="relative w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        )}

        <button
          onClick={() => navigate("/")}
          className="w-full py-4 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-700 font-bold hover:bg-white hover:border-slate-300 hover:shadow-lg transition-all font-paytone"
        >
          Exit Tutorial
        </button>
      </div>

      <style>{`
        .shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-3px); }
          40%, 60% { transform: translateX(3px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
