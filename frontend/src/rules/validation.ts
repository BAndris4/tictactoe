export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  termsAccepted: boolean;
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

export const validateRegisterForm = (
  values: RegisterFormValues
): RegisterFormErrors => {
  const errors: RegisterFormErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  // --- PHONE VALIDATION (ÚJ – 1 inputos) ---
  const fullPhone = values.phone.trim();
  const numeric = fullPhone.replace(/[^\d]/g, ""); // csak számok

  if (!fullPhone) {
    errors.phone = "Phone number is required";
  } else if (!fullPhone.startsWith("+")) {
    errors.phone = "Phone number must include country code (+36 ...)";
  } else if (numeric.length < 7) {
    errors.phone = "Please enter a valid phone number";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Invalid email address, please check and try again";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (!isPasswordValid(values.password)) {
    errors.password = "Password does not meet all requirements";
  }

  if (!values.termsAccepted) {
    errors.termsAccepted = "You must accept the terms and conditions";
  }

  return errors;
};
