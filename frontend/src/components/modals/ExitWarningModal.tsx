import { useRef, useEffect } from "react";

interface ExitWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ExitWarningModal({
  isOpen,
  onClose,
  onConfirm,
}: ExitWarningModalProps) {
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
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-deepblue">Exit Game?</h3>
          
          <p className="text-deepblue/60 font-medium">
            Warning: If you exit now, the game will be forfeited and counted as a loss.
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
              className="flex-1 py-3 rounded-xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition"
            >
              Exit & Forfeit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
