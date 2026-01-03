import { useRef, useEffect } from "react";

interface ResignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResignModal({
  isOpen,
  onClose,
  onConfirm,
}: ResignModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div 
        ref={modalRef}
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 transform transition-all animate-fadeScaleIn"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-deepblue">Resign Game?</h3>
          
          <p className="text-deepblue/60 font-medium">
            Are you sure you want to resign? This will be counted as a loss.
          </p>

          <div className="flex gap-3 w-full pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-deepblue/10 font-bold text-deepblue/70 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-red-500 font-bold text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition"
            >
              Resign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
