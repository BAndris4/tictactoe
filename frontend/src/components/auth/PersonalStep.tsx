import TextField from "./TextField";
import PhoneField from "./PhoneField";
import CheckboxField from "./CheckboxField";
import type { RegisterFormValues } from "../../rules/validation";
import type { CountryCodeOption } from "../../data/countryCodes";

type Props = {
  values: RegisterFormValues;
  onChange: <K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K]
  ) => void;
  onBlur: (field: keyof RegisterFormValues) => void;
  fieldError: (field: keyof RegisterFormValues) => string | undefined;
  countryOptions: CountryCodeOption[];
  disabled?: boolean;
};

export default function PersonalStep({
  values,
  onChange,
  onBlur,
  fieldError,
  countryOptions,
  disabled,
}: Props) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="First Name"
          name="given-name"
          autoComplete="given-name"
          value={values.firstName}
          onChange={(v) => onChange("firstName", v)}
          onBlur={() => onBlur("firstName")}
          error={fieldError("firstName")}
          disabled={disabled}
        />
        <TextField
          label="Last Name"
          name="family-name"
          autoComplete="family-name"
          value={values.lastName}
          onChange={(v) => onChange("lastName", v)}
          onBlur={() => onBlur("lastName")}
          error={fieldError("lastName")}
          disabled={disabled}
        />
      </div>

      <PhoneField
        label="Phone Number"
        value={values.phone}
        options={countryOptions}
        onChange={(v) => onChange("phone", v)}
        onBlur={() => onBlur("phone")}
        error={fieldError("phone")}
        disabled={disabled}
      />

      <CheckboxField
        checked={values.termsAccepted}
        onChange={(checked) => onChange("termsAccepted", checked)}
        error={fieldError("termsAccepted")}
        disabled={disabled}
        label={
          <span>
            I accept the{" "}
            <button
              type="button"
              className="font-semibold text-[#111827] underline-offset-2 hover:text-[#5570F1] hover:underline transition-colors"
            >
              Terms and Conditions
            </button>
          </span>
        }
      />
    </>
  );
}
