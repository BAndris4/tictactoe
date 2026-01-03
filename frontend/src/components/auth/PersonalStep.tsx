import { useMemo } from "react";
import TextField from "./TextField";
import PhoneField from "./PhoneField";
import SearchableSelect from "./SearchableSelect";
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
  const memoOptions = useMemo(() => countryOptions.map(c => ({ 
    label: c.name, 
    value: c.code,
    sublabel: c.dialCode
  })), [countryOptions]);

  const handleCountryChange = (countryCode: string) => {
    onChange("country", countryCode);
    
    // Auto-fill dial code if phone is empty or only has a dial code
    const country = countryOptions.find(c => c.code === countryCode);
    if (country) {
      const currentPhone = values.phone || "";
      const isJustDialCode = countryOptions.some(c => currentPhone === c.dialCode);
      if (!currentPhone || isJustDialCode) {
        onChange("phone", country.dialCode);
      }
    }
  };

  const handlePhoneChange = (phone: string) => {
    onChange("phone", phone);

    // Auto-select country if dial code matches
    const country = countryOptions
      .filter(c => phone.startsWith(c.dialCode))
      .sort((a, b) => b.dialCode.length - a.dialCode.length)[0];

    if (country && country.code !== values.country) {
      onChange("country", country.code);
    }
  };

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

      <SearchableSelect
        label="Country"
        value={values.country}
        options={memoOptions}
        onChange={handleCountryChange}
        onBlur={() => onBlur("country")}
        error={fieldError("country")}
        disabled={disabled}
      />

      <PhoneField
        label="Phone Number"
        value={values.phone}
        options={countryOptions}
        onChange={handlePhoneChange}
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
