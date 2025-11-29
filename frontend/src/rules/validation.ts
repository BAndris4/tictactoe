export type RegisterFormValues = {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  termsAccepted: boolean;
  playTutorial: boolean;
};

export type RegisterFormErrors = Partial<
  Record<keyof RegisterFormValues, string>
>;

export type PasswordChecks = {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
};

export const getPasswordChecks = (password: string): PasswordChecks => ({
  hasMinLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecial: /[^A-Za-z0-9]/.test(password),
});

export const isPasswordValid = (password: string): boolean => {
  const c = getPasswordChecks(password);
  return c.hasMinLength && c.hasUppercase && c.hasNumber && c.hasSpecial;
};

const norm = (s: string) => s.normalize("NFKC").trim();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,20}$/;
const MIN_PHONE_DIGITS = 7;

export const validateRegisterStep = (
  step: 1 | 2 | 3,
  values: RegisterFormValues
): RegisterFormErrors => {
  const errors: RegisterFormErrors = {};

  if (step === 1) {
    const username = norm(values.username);
    if (!username) {
      errors.username = "Username is required";
    } else if (!USERNAME_RE.test(username)) {
      errors.username =
        "Username must be 3–20 characters (letters, numbers, _, ., -)";
    }

    const email = norm(values.email).toLowerCase();
    if (!email) {
      errors.email = "Email is required";
    } else if (!EMAIL_RE.test(email)) {
      errors.email = "Invalid email address, please check and try again";
    }

    const password = values.password;
    if (!password) {
      errors.password = "Password is required";
    } else if (!isPasswordValid(password)) {
      errors.password = "Password does not meet all requirements";
    }
  }

  if (step === 2) {
    const firstName = norm(values.firstName);
    const lastName = norm(values.lastName);
    if (!firstName) errors.firstName = "First name is required";
    if (!lastName) errors.lastName = "Last name is required";

    const fullPhoneRaw = values.phone ?? "";
    const fullPhone = norm(fullPhoneRaw).replace(/\s+/g, " ");
    const digits = fullPhone.replace(/[^\d]/g, "");

    if (!fullPhone) {
      errors.phone = "Phone number is required";
    } else if (digits.length < MIN_PHONE_DIGITS) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!values.termsAccepted) {
      errors.termsAccepted = "You must accept the terms and conditions";
    }
  }

  return errors;
};

export const validateRegisterForm = (
  values: RegisterFormValues
): RegisterFormErrors => {
  return {
    ...validateRegisterStep(1, values),
    ...validateRegisterStep(2, values),
  };
};
