import type { FormEvent } from "react";
import { useState } from "react";
import TextField from "./TextField";
import PasswordField from "./PasswordField";
import CheckboxField from "./CheckboxField";
import { useNavigate } from "react-router-dom";

export default function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSigned, setKeepSigned] = useState(true);

  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log({ email, password, keepSigned });
  };

  return (
    <div
      className="
        w-full max-w-sm rounded-[24px] bg-white/95 px-9 py-10 
        shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-sm
        transform transition-all duration-500 
        hover:-translate-y-2 hover:scale-[1.02]
        hover:shadow-[0_28px_70px_rgba(15,23,42,0.30)]
        relative overflow-hidden
      "
    >
      {/* Dekoratív fények */}
      <div className="pointer-events-none absolute inset-x-[-40%] top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(85,112,241,0.28),_transparent_60%)] opacity-60" />
      <div className="pointer-events-none absolute -left-10 bottom-[-40px] h-32 w-32 rounded-full bg-[radial-gradient(circle,_rgba(248,113,113,0.25),_transparent_70%)]" />

      <div className="relative z-10">
        {/* Mini badge – RegisterCard-hoz igazítva */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-3 py-1 text-[11px] font-medium text-[#4F46E5]">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span>Welcome back</span>
        </div>

        <h1 className="mb-2 text-[24px] font-semibold text-[#111827] tracking-tight">
          Login
        </h1>
        <p className="mb-6 text-[13px] text-[#6B7280]">
          Sign in to continue your game sessions and track your progress.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Email"
            value={email}
            placeholder="john.smith@example.com"
            onChange={setEmail}
          />

          <div>
            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
              mode="login"
            />

            <div className="mt-1 flex justify-end">
              <button
                type="button"
                className="text-[12px] text-[#5570F1] hover:text-[#4356C4] underline-offset-2 hover:underline transition"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <CheckboxField
            checked={keepSigned}
            onChange={setKeepSigned}
            label={"Keep me signed in"}
          />

          <button
            type="submit"
            className="
              group relative mt-2 inline-flex h-11 w-full items-center justify-center
              overflow-hidden rounded-md bg-[#5570F1] text-sm font-medium text-white
              shadow-[0_10px_30px_rgba(85,112,241,0.45)]
              transition-all duration-300
              hover:bg-[#4356C4] hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(67,86,196,0.70)]
              active:translate-y-0 active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-[#5570F1] focus:ring-offset-2 focus:ring-offset-white
            "
          >
            <span
              className="
                pointer-events-none absolute inset-0 
                translate-x-[-120%] bg-[linear-gradient(120deg,rgba(255,255,255,0.6),rgba(255,255,255,0))]
                opacity-70 transition-transform duration-500
                group-hover:translate-x-[120%]
              "
            />
            <span className="relative z-10">Sign in</span>
          </button>

          <p className="mt-3 text-center text-[12px] text-[#6B7280]">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="text-[#5570F1] underline-offset-2 hover:underline hover:text-[#4356C4] transition"
              onClick={() => navigate("/register")}
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
