import { useState, useMemo } from "react";
import {
  getPasswordChecks,
  validateRegisterForm,
  validateRegisterStep,
  type RegisterFormValues,
  type RegisterFormErrors,
} from "../rules/validation";
import { authApi } from "../api/auth";

export type RegisterStep = 1 | 2 | 3;

const initialValues: RegisterFormValues = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  country: "",
  termsAccepted: false,
  playTutorial: true,
  gender: 'M',
  avatar_config: undefined,
};

type TouchedState = Partial<Record<keyof RegisterFormValues, boolean>>;

const STEP_FIELDS: Record<RegisterStep, (keyof RegisterFormValues)[]> = {
  1: ["username", "email", "password"],
  2: ["firstName", "lastName", "phone", "termsAccepted", "gender"],
  3: ["playTutorial"],
};

const pruneStepErrors = (
  prev: RegisterFormErrors,
  s: RegisterStep
): RegisterFormErrors => {
  const clone: RegisterFormErrors = { ...prev };
  for (const key of STEP_FIELDS[s]) delete clone[key];
  return clone;
};

export function useRegister(onSuccess?: (playTutorial?: boolean) => void) {
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [touched, setTouched] = useState<TouchedState>({});
  const [step, setStep] = useState<RegisterStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecks = useMemo(
    () => getPasswordChecks(values.password),
    [values.password]
  );

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

  const markStepTouchedAndValidate = (s: RegisterStep) => {
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

  const goNext = async () => {
    const stepErrs = markStepTouchedAndValidate(step);
    const hasError = STEP_FIELDS[step].some((f) => stepErrs[f]);
    
    if (hasError) return;

    // Custom Async Validation for Step 1: Email and Username availability
    if (step === 1) {
        setIsSubmitting(true);
        try {
            const [emailResult, userResult] = await Promise.all([
                authApi.checkEmail(values.email),
                authApi.checkUsername(values.username)
            ]);

            let hasAsyncError = false;
            const newErrors: RegisterFormErrors = {};

            if (!emailResult.available) {
                newErrors.email = "This email address is already in use.";
                hasAsyncError = true;
            }
            if (!userResult.available) {
                newErrors.username = "This username is already taken.";
                hasAsyncError = true;
            }

            if (hasAsyncError) {
                setErrors(prev => ({ ...prev, ...newErrors }));
                return;
            }
        } catch (err) {
            console.error("Availability check failed", err);
            setErrors(prev => ({ ...prev, email: "Validation failed. Please try again." }));
            return;
        } finally {
            setIsSubmitting(false);
        }
    }

    if (step < 3) {
      setStep((s) => (s + 1) as RegisterStep);
    }
  };

  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as RegisterStep) : s));

  const register = async () => {
    // Validate all steps
    (Object.keys(STEP_FIELDS) as Array<unknown>).forEach((k) =>
      markStepTouchedAndValidate(Number(k) as RegisterStep)
    );
    const validationErrors = validateRegisterForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await authApi.register(values);
      // Auto login
      await authApi.login(values.username, values.password, false)
        .then(data => {
             if (data.access_token) {
                 localStorage.setItem("access_token", data.access_token);
             }
        });

      if (onSuccess) {
          onSuccess(values.playTutorial);
      }
    } catch (error) {
       console.error(error);
       alert("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
      values,
      errors,
      touched,
      step,
      passwordChecks,
      handleFieldChange,
      markTouched,
      goNext,
      goBack,
      register,
      isSubmitting
  };
}
