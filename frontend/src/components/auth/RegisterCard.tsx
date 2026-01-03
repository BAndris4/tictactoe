import type { FormEvent } from "react";
import { COUNTRY_CODES } from "../../data/countryCodes";
import { useNavigate } from "react-router-dom";

import StepHeader from "./StepHeader";
import AccountStep from "./AccountStep";
import PersonalStep from "./PersonalStep";
import TutorialStep from "./TutorialStep";
import StepActions from "./StepActions";
import { useRegister } from "../../hooks/useRegister";

interface RegisterCardProps {
  onSuccess?: (playTutorial?: boolean) => void;
}

export default function RegisterCard({ onSuccess }: RegisterCardProps) {
  const navigate = useNavigate();
  const {
      values,
      // errors, // Using fieldError helper instead
      touched,
      step,
      passwordChecks,
      handleFieldChange,
      markTouched,
      goNext,
      goBack,
      register,
      isSubmitting,
      errors
  } = useRegister(onSuccess);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await register();
  };

  const fieldError = (field: keyof typeof values) =>
    touched[field] ? errors[field] : undefined;

  return (
    <div
      className="
        w-full max-w-md bg-white px-9 py-10 
        rounded-[2rem] border border-white
        shadow-lg shadow-deepblue/5
        transform transition-all duration-300 
        hover:-translate-y-1 hover:shadow-xl
        relative
      "
    >
      <div className="pointer-events-none absolute inset-x-[-40%] top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(79,173,192,0.15),_transparent_60%)] opacity-60" />
      <div className="pointer-events-none absolute -left-10 bottom-[-40px] h-32 w-32 rounded-full bg-[radial-gradient(circle,_rgba(255,112,112,0.15),_transparent_70%)]" />

      <div className="relative z-10">
        <StepHeader step={step} />

        <form onSubmit={handleSubmit} className="space-y-3">
          {step === 1 && (
            <AccountStep
              values={values}
              onChange={handleFieldChange}
              onBlur={markTouched}
              fieldError={fieldError}
              passwordChecks={passwordChecks}
              disabled={isSubmitting} 
            />
          )}

          {step === 2 && (
            <PersonalStep
              values={values}
              onChange={handleFieldChange}
              onBlur={markTouched}
              fieldError={fieldError}
              countryOptions={COUNTRY_CODES}
              disabled={isSubmitting}
            />
          )}

          {step === 3 && (
            <TutorialStep
              value={values.playTutorial}
              onChange={(val) => handleFieldChange("playTutorial", val)}
              disabled={isSubmitting}
            />
          )}

          <StepActions step={step} onBack={goBack} onNext={goNext} disabled={isSubmitting} />

          {step === 1 && (
            <p className="mt-3 text-center text-[12px] text-[#6B7280]">
              Already have an account?{" "}
              <button
                type="button"
                className="text-[#5570F1] underline-offset-2 hover:underline hover:text-[#4356C4] transition-colors"
                onClick={() => {
                  const search = window.location.search;
                  navigate(`/login${search}`);
                }}
              >
                Log in
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
