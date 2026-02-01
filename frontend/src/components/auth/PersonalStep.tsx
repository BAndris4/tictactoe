import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import TextField from "./TextField";
import PhoneField from "./PhoneField";
import SearchableSelect from "./SearchableSelect";
import CheckboxField from "./CheckboxField";
import Avatar from "avataaars";
import AvatarEditor from "../profile/AvatarEditor";
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
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [tempAvatarConfig, setTempAvatarConfig] = useState(values.avatar_config || {});

  const memoOptions = useMemo(() => countryOptions.map(c => ({ 
    label: c.name, 
    value: c.code,
    sublabel: c.dialCode
  })), [countryOptions]);

  // ... (handlers same)
  const handleCountryChange = (countryCode: string) => {
    onChange("country", countryCode);
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
    const country = countryOptions
      .filter(c => phone.startsWith(c.dialCode))
      .sort((a, b) => b.dialCode.length - a.dialCode.length)[0];

    if (country && country.code !== values.country) {
      onChange("country", country.code);
    }
  };

  const handleAvatarSave = () => {
    onChange("avatar_config", tempAvatarConfig);
    setShowAvatarEditor(false);
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
          label="Gender"
          value={values.gender}
          options={[
              { label: 'Male', value: 'M', sublabel: '👨' },
              { label: 'Female', value: 'F', sublabel: '👩' }
          ]}
          onChange={(val) => {
              onChange("gender", val as 'M' | 'F');
          }}
          placeholder="Select gender..."
          disabled={disabled}
      />

      {/* Avatar Customization Trigger */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-slate-100">
         <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden border-2 border-slate-200 shrink-0">
             {values.avatar_config ? (
                  <Avatar
                    style={{ width: '100%', height: '100%' }}
                    avatarStyle="Transparent"
                    {...values.avatar_config}
                 />
             ) : (
                 <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">
                    {values.gender === 'M' ? '👨' : '👩'}
                 </div>
             )}
         </div>
         <div className="flex-1">
             <div className="text-xs font-black uppercase tracking-widest text-deepblue/30 mb-1">Avatar</div>
             <button
                type="button"
                onClick={() => {
                    setTempAvatarConfig(values.avatar_config || {
                        topType: values.gender === 'F' ? 'LongHairBigHair' : 'ShortHairShortFlat',
                        accessoriesType: 'Blank',
                        hairColor: 'BrownDark',
                        facialHairType: 'Blank',
                        clotheType: 'BlazerShirt',
                        eyeType: 'Default',
                        eyebrowType: 'Default',
                        mouthType: 'Default',
                        skinColor: 'Light'
                    });
                    setShowAvatarEditor(true);
                }}
                className="text-sm font-bold text-deepblue hover:text-deepblue/80 underline decoration-2 underline-offset-2"
                disabled={disabled}
             >
                 {values.avatar_config ? "Edit Appearance" : "Customize Appearance"}
             </button>
         </div>
      </div>

      <SearchableSelect
        label="Country"
        // ... (rest same)
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

       {/* Avatar Editor Modal - Full Screen Portal */}
       {showAvatarEditor && createPortal(
            <div className="fixed inset-0 z-[9999] bg-[#F3F4FF] animate-fadeIn flex flex-col cursor-auto font-inter">
                 {/* Header */}
                 <div className="bg-white px-6 py-4 shadow-sm border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-deepblue/5 rounded-xl text-deepblue">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                         </div>
                        <div>
                            <h3 className="text-xl font-paytone text-deepblue leading-tight">Customize Avatar</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Design your player</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowAvatarEditor(false)}
                        className="p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-deepblue"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-white p-6 md:p-8">
                        <AvatarEditor 
                            config={tempAvatarConfig} 
                            gender={values.gender}
                            onChange={setTempAvatarConfig} 
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-white p-4 md:px-8 md:py-6 border-t border-slate-100 flex justify-end gap-4 shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowAvatarEditor(false)}
                        className="px-6 py-3 rounded-xl font-bold text-deepblue/60 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleAvatarSave}
                        className="px-8 py-3 rounded-xl bg-deepblue text-white font-bold hover:bg-deepblue/90 shadow-lg shadow-deepblue/20 transition-all transform active:scale-95"
                    >
                        Save Appearance
                    </button>
                </div>
            </div>,
            document.body
       )}
    </>
  );
}
