import TextField from "./TextField";
import PasswordField from "./PasswordField";
import type {
  RegisterFormValues,
  PasswordChecks,
} from "../../rules/validation";

type Props = {
  values: RegisterFormValues;
  onChange: <K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K]
  ) => void;
  onBlur: (field: keyof RegisterFormValues) => void;
  fieldError: (field: keyof RegisterFormValues) => string | undefined;
  passwordChecks: PasswordChecks;
  disabled?: boolean;
};

export default function AccountStep({
  values,
  onChange,
  onBlur,
  fieldError,
  passwordChecks,
  disabled,
}: Props) {
  return (
    <>
      <TextField
        label="Username"
        name="username"
        autoComplete="username"
        value={values.username}
        onChange={(v) => onChange("username", v)}
        onBlur={() => onBlur("username")}
        error={fieldError("username")}
        disabled={disabled}
        required
      />

      <TextField
        label="Email"
        name="email"
        autoComplete="email"
        type="email"
        value={values.email}
        onChange={(v) => onChange("email", v)}
        onBlur={() => onBlur("email")}
        error={fieldError("email")}
        disabled={disabled}
        required
      />

      <PasswordField
        label="Password"
        name="new-password"
        autoComplete="new-password"
        value={values.password}
        onChange={(v) => onChange("password", v)}
        onBlur={() => onBlur("password")}
        error={fieldError("password")}
        checks={passwordChecks}
        mode="register"
        disabled={disabled}
        required
      />
    </>
  );
}
