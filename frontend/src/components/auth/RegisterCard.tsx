import { FormEvent, useState } from "react";
import TextField from "./TextField";
import PhoneField from "./PhoneField";
import PasswordField from "./PasswordField";
import CheckboxField from "./CheckboxField";
import {
  getPasswordChecks,
  validateRegisterForm,
  type RegisterFormValues,
  type RegisterFormErrors,
} from "../../rules/validation";
import { COUNTRY_CODES } from "../../data/countryCodes";

const initialValues: RegisterFormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
  termsAccepted: false,
};

type TouchedState = Partial<Record<keyof RegisterFormValues, boolean>>;

export default function RegisterCard() {
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [touched, setTouched] = useState<TouchedState>({});

  const passwordChecks = getPasswordChecks(values.password);

  const handleFieldChange = <K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K]
  ) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      if (touched[field]) {
        setErrors(validateRegisterForm(next));
      }
      return next;
    });
  };

  const markTouched = (field: keyof RegisterFormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      ...validateRegisterForm(values),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const allTouched: TouchedState = {
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      password: true,
      termsAccepted: true,
    };
    setTouched(allTouched);

    const validationErrors = validateRegisterForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // TODO: API call
      console.log("Register form submit", values);
      alert("Form is valid – submit to backend here.");
    }
  };

  const fieldError = (field: keyof RegisterFormValues) =>
    touched[field] ? errors[field] : undefined;

  return (
    <div
      className="
        w-full max-w-md rounded-[24px] bg-white/95 px-9 py-10 
        shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-sm
        transform transition-all duration-500 
        hover:-translate-y-2 hover:scale-[1.02]
        hover:shadow-[0_28px_70px_rgba(15,23,42,0.30)]
        relative overflow-hidden
      "
    >
      <div className="pointer-events-none absolute inset-x-[-40%] top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(85,112,241,0.28),_transparent_60%)] opacity-60" />
      <div className="pointer-events-none absolute -left-10 bottom-[-40px] h-32 w-32 rounded-full bg-[radial-gradient(circle,_rgba(248,113,113,0.25),_transparent_70%)]" />

      <div className="relative z-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-3 py-1 text-[11px] font-medium text-[#4F46E5]">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span>Step 1 / 3 · Create your account</span>
        </div>

        <h1 className="mb-1 text-[24px] font-semibold text-[#111827] tracking-tight">
          Create an Account
        </h1>
        <p className="mb-6 text-[13px] text-[#6B7280]">
          Sign up to start tracking your games and compete with friends.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="First Name"
              value={values.firstName}
              placeholder="John"
              onChange={(v) => handleFieldChange("firstName", v)}
              onBlur={() => markTouched("firstName")}
              error={fieldError("firstName")}
            />

            <TextField
              label="Last Name"
              value={values.lastName}
              placeholder="Smith"
              onChange={(v) => handleFieldChange("lastName", v)}
              onBlur={() => markTouched("lastName")}
              error={fieldError("lastName")}
            />
          </div>

          <PhoneField
            label="Phone Number"
            value={values.phone}
            options={COUNTRY_CODES}
            onChange={(v) => handleFieldChange("phone", v)}
            onBlur={() => markTouched("phone")}
            error={fieldError("phone")}
          />

          <TextField
            label="Email"
            type="email"
            value={values.email}
            placeholder="john.smith@example.com"
            onChange={(v) => handleFieldChange("email", v)}
            onBlur={() => markTouched("email")}
            error={fieldError("email")}
          />

          <PasswordField
            label="Password"
            value={values.password}
            onChange={(v) => handleFieldChange("password", v)}
            onBlur={() => markTouched("password")}
            error={fieldError("password")}
            checks={passwordChecks}
          />

          <CheckboxField
            checked={values.termsAccepted}
            onChange={(checked) => handleFieldChange("termsAccepted", checked)}
            error={fieldError("termsAccepted")}
          />

          <button
            type="submit"
            className="
              group relative mt-4 inline-flex h-11 w-full items-center justify-center
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
            <span className="relative z-10">Sign Up</span>
          </button>

          <p className="mt-3 text-center text-[12px] text-[#6B7280]">
            Already have an account?{" "}
            <button
              type="button"
              className="text-[#5570F1] underline-offset-2 hover:underline hover:text-[#4356C4] transition-colors"
            >
              Log in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
