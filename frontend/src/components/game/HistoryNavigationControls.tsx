import { useGame } from "../../context/GameContext";
import { useEffect } from "react";

export default function HistoryNavigationControls() {
  const { 
    moves, 
    currentHistoryIndex, 
    isReviewingHistory,
    stepBackward,
    stepForward,
    goToStart,
    goToLive
  } = useGame();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (moves.length === 0) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          stepBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
        case 'Home':
          e.preventDefault();
          goToStart();
          break;
        case 'End':
          e.preventDefault();
          goToLive();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moves.length, stepBackward, stepForward, goToStart, goToLive]);

  if (moves.length === 0) {
    return null;
  }

  const positionText = isReviewingHistory
    ? (currentHistoryIndex === -1 || currentHistoryIndex === null)
      ? "Start"
      : `${(currentHistoryIndex ?? 0) + 1}/${moves.length}`
    : "Live";

  const canGoBack = currentHistoryIndex === null 
    ? moves.length > 0 
    : currentHistoryIndex > -1;

  const canGoForward = currentHistoryIndex !== null && currentHistoryIndex < moves.length - 1;

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-4 border border-white/50 shadow-inner flex-shrink-0">
      {/* Position Indicator */}
      <div className="flex items-center justify-center mb-3">
        <span className={`text-sm font-black px-3 py-1.5 rounded-full ${
          isReviewingHistory 
            ? 'bg-sunshine/20 text-deepblue' 
            : 'bg-mint/20 text-mint border border-mint/30'
        }`}>
          {positionText}
          {!isReviewingHistory && <span className="ml-1.5">●</span>}
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={goToStart}
          disabled={currentHistoryIndex === -1}
          className="p-3 rounded-xl bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/80 hover:shadow-md active:scale-95 disabled:hover:scale-100"
          title="Start (Home)"
        >
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={stepBackward}
          disabled={!canGoBack}
          className="p-3 rounded-xl bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/80 hover:shadow-md active:scale-95 disabled:hover:scale-100"
          title="Previous (←)"
        >
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={stepForward}
          disabled={!canGoForward}
          className="p-3 rounded-xl bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/80 hover:shadow-md active:scale-95 disabled:hover:scale-100"
          title="Next (→)"
        >
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <button
          onClick={goToLive}
          disabled={!isReviewingHistory}
          className="p-3 rounded-xl bg-mint/10 hover:bg-mint/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-mint/40 hover:shadow-md active:scale-95 disabled:hover:scale-100"
          title="Live (End)"
        >
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Review Mode Banner */}
      {isReviewingHistory && (
        <div className="mt-3 p-2 bg-sunshine/20 rounded-lg border border-sunshine/30">
          <p className="text-xs font-bold text-deepblue text-center">
            Reviewing - moves disabled
          </p>
        </div>
      )}
    </div>
  );
}
