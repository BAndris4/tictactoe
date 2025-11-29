export type CountryCodeOption = {
  name: string;
  dialCode: string;
  code: string;
};

export const COUNTRY_CODES: CountryCodeOption[] = [
  { name: "Hungary", dialCode: "+36", code: "HU" },
  { name: "United States", dialCode: "+1", code: "US" },
  { name: "United Kingdom", dialCode: "+44", code: "GB" },
  { name: "Germany", dialCode: "+49", code: "DE" },
  // TODO
];
