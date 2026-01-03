import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import {
  getPasswordChecks,
  validateRegisterForm,
  validateRegisterStep,
  type RegisterFormValues,
  type RegisterFormErrors,
} from "../../rules/validation";
import { COUNTRY_CODES } from "../../data/countryCodes";
import { useNavigate } from "react-router-dom";

import StepHeader from "./StepHeader";
import AccountStep from "./AccountStep";
import PersonalStep from "./PersonalStep";
import TutorialStep from "./TutorialStep";
import StepActions from "./StepActions";
import { serializePhone } from "../../utils";

const initialValues: RegisterFormValues = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  termsAccepted: false,
  playTutorial: true,
};

type TouchedState = Partial<Record<keyof RegisterFormValues, boolean>>;

const STEP_FIELDS: Record<1 | 2 | 3, (keyof RegisterFormValues)[]> = {
  1: ["username", "email", "password"],
  2: ["firstName", "lastName", "phone", "termsAccepted"],
  3: ["playTutorial"],
};

const pruneStepErrors = (
  prev: RegisterFormErrors,
  s: 1 | 2 | 3
): RegisterFormErrors => {
  const clone: RegisterFormErrors = { ...prev };
  for (const key of STEP_FIELDS[s]) delete clone[key];
  return clone;
};

interface RegisterCardProps {
  onSuccess?: (playTutorial?: boolean) => void;
}

export default function RegisterCard({ onSuccess }: RegisterCardProps) {
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [touched, setTouched] = useState<TouchedState>({});
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const passwordChecks = useMemo(
    () => getPasswordChecks(values.password),
    [values.password]
  );
  const navigate = useNavigate();

  const handleFieldChange = <K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K]
  ) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      if (touched[field]) {
        const stepErrs = validateRegisterStep(step, next);
        setErrors((prevErr) => ({
          ...pruneStepErrors(prevErr, step),
          ...stepErrs,
        }));
      }
      return next;
    });
  };

  const markTouched = (field: keyof RegisterFormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const stepErrs = validateRegisterStep(step, values);
    setErrors((prevErr) => ({
      ...pruneStepErrors(prevErr, step),
      ...stepErrs,
    }));
  };

  const markStepTouchedAndValidate = (s: 1 | 2 | 3) => {
    const fields = STEP_FIELDS[s];
    setTouched((prev) => {
      const next = { ...prev };
      fields.forEach((f) => (next[f] = true));
      return next;
    });
    const stepErrs = validateRegisterStep(s, values);
    setErrors((prevErr) => ({ ...pruneStepErrors(prevErr, s), ...stepErrs }));
    return stepErrs;
  };

  const goNext = () => {
    const stepErrs = markStepTouchedAndValidate(step);
    const hasError = STEP_FIELDS[step].some((f) => stepErrs[f]);
    if (!hasError && step < 3) {
      requestAnimationFrame(() => setStep((s) => (s + 1) as 2 | 3));
    }
  };

  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2) : s));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    (Object.keys(STEP_FIELDS) as Array<unknown>).forEach((k) =>
      markStepTouchedAndValidate(Number(k) as 1 | 2 | 3)
    );
    const validationErrors = validateRegisterForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      fetch("http://localhost:8000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
          first_name: values.firstName,
          last_name: values.lastName,
          phone_number: serializePhone(values.phone),
          play_tutorial: values.playTutorial,
        }),
        credentials: "include",
      }).then((res) => {
        console.log(values);
        if (res.ok) {
          fetch("http://localhost:8000/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              username: values.username,
              password: values.password,
              stay_logged_in: false,
            }),
          }).then((loginRes) => {
            if (loginRes.ok) {
               if (onSuccess) {
                   onSuccess(values.playTutorial);
               }
            } else {
              alert("Automatic login failed after registration.");
            }
          });
        }
      });
    }
  };

  const fieldError = (field: keyof RegisterFormValues) =>
    touched[field] ? errors[field] : undefined;

  return (
    <div
      className="
        w-full max-w-md bg-white px-9 py-10 
        rounded-[2rem] border border-white
        shadow-lg shadow-deepblue/5
        transform transition-all duration-300 
        hover:-translate-y-1 hover:shadow-xl
        relative overflow-hidden
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
            />
          )}

          {step === 2 && (
            <PersonalStep
              values={values}
              onChange={handleFieldChange}
              onBlur={markTouched}
              fieldError={fieldError}
              countryOptions={COUNTRY_CODES}
            />
          )}

          {step === 3 && (
            <TutorialStep
              value={values.playTutorial}
              onChange={(val) => handleFieldChange("playTutorial", val)}
            />
          )}

          <StepActions step={step} onBack={goBack} onNext={goNext} />

          {step === 1 && (
            <p className="mt-3 text-center text-[12px] text-[#6B7280]">
              Already have an account?{" "}
              <button
                type="button"
                className="text-[#5570F1] underline-offset-2 hover:underline hover:text-[#4356C4] transition-colors"
                onClick={() => navigate("/login")}
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
