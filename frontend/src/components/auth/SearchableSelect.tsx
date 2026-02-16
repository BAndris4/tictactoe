
import { useState, useRef, useEffect, useMemo } from "react";

export type SearchableSelectOption = {
  label: string;
  value: string;
  sublabel?: string; // e.g. dial code
};

type Props = {
  label: string;
  value: string;
  options: SearchableSelectOption[];
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  disableSearch?: boolean;
};

export default function SearchableSelect({
  label,
  value,
  options,
  error,
  onChange,
  onBlur,
  disabled,
  placeholder = "Search...",
  required,
  disableSearch = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [value, options]
  );

  const filteredOptions = useMemo(() => {
    const trimmed = searchTerm.trim().toLowerCase();
    if (!trimmed) return options;
    
    // Support multi-word search
    const words = trimmed.split(/\s+/).filter(Boolean);
    
    return options.filter((o) => {
      const target = `${o.label} ${o.sublabel || ""}`.toLowerCase();
      return words.every(word => target.includes(word));
    });
  }, [searchTerm, options]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isOpen) {
          setIsOpen(false);
          onBlur?.();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onBlur]);

  const hasError = Boolean(error);
  const isFilled = (value || "").length > 0;

  const bgClass = hasError
    ? "bg-[rgba(231,98,104,0.15)]"
    : "bg-[rgba(239,241,249,0.6)]";
  const textClass = hasError ? "text-[#E76268]" : "text-[#5E6366]";
  const borderClass = hasError
    ? "border-[#F16063]"
    : isFilled
    ? "border-[#5570F1]/60"
    : "border-transparent";
  const shadowClass = hasError
    ? "shadow-[0_0_0_1px_rgba(241,96,99,0.45)]"
    : isFilled
    ? "shadow-[0_10px_25px_rgba(15,23,42,0.12)]"
    : "shadow-none";

  return (
    <div className="relative flex flex-col w-full" ref={containerRef}>
      <div
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen(!isOpen);
            e.preventDefault();
          } else if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
        className={`
          group rounded-[8px] px-5 pt-2 pb-2 transition-all cursor-pointer outline-none
          ${bgClass} border ${borderClass} ${shadowClass}
          ${isOpen ? "bg-[#E9ECF8] shadow-[0_14px_35px_rgba(15,23,42,0.18)] border-[#5570F1]/70" : ""}
          ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-[#5570F1]/40"}
        `}
        aria-label={label}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div
          className={`
            text-xs font-medium transition 
            ${textClass}
            ${isOpen ? "text-[#5570F1]" : ""}
            group-hover:text-[#5570F1]/80
          `}
        >
          {label}{required && <span className="text-[#E76268] ml-0.5">*</span>}
        </div>

        <div className="mt-1 flex items-center justify-between h-[24px]">
          <span className={`text-[15px] truncate font-medium ${selectedOption ? "text-[#374151]" : "text-[#9CA3AF]"}`}>
            {selectedOption ? selectedOption.label : "Select country..."}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""} text-[#9CA3AF]`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {hasError && <p className="mt-1.5 text-[11px] font-medium text-[#F16063] pl-1">{error}</p>}

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-[100] bg-white rounded-[1.25rem] border border-[#5570F1]/20 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.3)] p-3 animate-in fade-in zoom-in duration-200 overflow-hidden max-h-[350px] flex flex-col">
          {!disableSearch && (
            <div className="relative mb-3">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5570F1]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                autoFocus
                type="text"
                placeholder={placeholder}
                className="w-full bg-[#F8FAFF] rounded-[0.75rem] py-3 pl-11 pr-4 text-[15px] font-medium outline-none border-2 border-transparent focus:border-[#5570F1]/30 transition-all placeholder:text-[#9CA3AF] text-[#374151]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="overflow-y-auto flex-1 custom-scrollbar pr-1 -mr-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div
                  key={`${opt.value}-${opt.label}-${idx}`}
                  className={`
                    flex items-center justify-between px-4 py-3.5 rounded-[0.75rem] cursor-pointer transition-all duration-200 mb-1 last:mb-0
                    ${value === opt.value 
                      ? "bg-[#5570F1] text-white shadow-lg shadow-[#5570F1]/30 translate-x-1" 
                      : "hover:bg-[#F3F6FF] text-[#4B5563] hover:translate-x-1"}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                    onBlur?.();
                  }}
                >
                  <div className="flex flex-col">
                    <span className="text-[15px] font-semibold">{opt.label}</span>
                  </div>
                  {opt.sublabel && (
                    <span className={`text-[12px] font-bold px-2 py-1 rounded-md ${value === opt.value ? "bg-white/25 text-white" : "bg-deepblue/5 text-[#6B7280]"}`}>
                      {opt.sublabel}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-[#F8FAFF] rounded-full flex items-center justify-center">
                   <svg className="w-6 h-6 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[#374151] font-semibold text-sm">No results found</span>
                  <span className="text-[#9CA3AF] text-xs mt-0.5">"{searchTerm}" returned no countries</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
