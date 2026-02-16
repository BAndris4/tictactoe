import { useAuth } from "../../hooks/useAuth";
import { useGame } from "../../context/GameContext";

interface Props {
  className?: string;
}

export default function EvaluationBar({ className = "" }: Props) {
  const { currentEvaluation, game, moves: history, currentHistoryIndex } = useGame();
  const { user } = useAuth();
  
  if (game?.status !== 'finished' || currentEvaluation === null) {
    return null;
  }

  // Determine perspective
  const isPlayerO = user && game && (
      (typeof game.player_o === 'string' && game.player_o === user.id) ||
      (typeof game.player_o === 'object' && game.player_o?.id === user.id) ||
      (game.player_o_name === user.username) 
  );

  // Normalize score to 0-100% (X perspective)
  const getPercentageX = (score: number) => {
    if (score > 90000) return 98; 
    if (score < -90000) return 2; 
    const sensitivity = 0.0012; 
    const p = 0.5 + Math.atan(score * sensitivity) / Math.PI;
    return Math.min(Math.max(p * 100, 5), 95);
  };

  const percentX = getPercentageX(currentEvaluation);
  
  // "My" percentage (Bottom Bar Height)
  const bottomHeight = isPlayerO ? (100 - percentX) : percentX;
  
  // Premium "iPhone-like" Glassy Design
  // Single color (White glow), heavily relying on backdrop blur and borders.

  // Score text logic
  // Check for Mate
  let scoreLabel = "";
  
  // Check if we are at the very last move of the history
  // currentHistoryIndex is null if we are "live" (at the end), or a number if reviewing.
  const isLastMove = history && history.length > 0 && (
      currentHistoryIndex === null || 
      currentHistoryIndex === history.length - 1
  );

  if (Math.abs(currentEvaluation) > 90000) {
      const absScore = Math.abs(currentEvaluation);
      const isMyMate = (currentEvaluation > 0 && !isPlayerO) || (currentEvaluation < 0 && isPlayerO);
      
      // Strict rule: "W" or "L" ONLY if it is explicitly the last move of a finished game.
      if (isLastMove) {
           scoreLabel = isMyMate ? "W" : "L";
      } else {
           // Forced mate sequence prediction (intermediate state)
           const remDepth = absScore - 100000;
           const usedDepth = 4 - remDepth;
           const mateIn = Math.floor(Math.max(0, usedDepth) / 2) + 1;
           scoreLabel = isMyMate ? `W${mateIn}` : `L${mateIn}`;
      }
  } else {
      const myScore = (isPlayerO ? -currentEvaluation : currentEvaluation) / 100;
      scoreLabel = Math.abs(myScore) < 0.1 ? "0.0" : (myScore > 0 ? "+" : "") + myScore.toFixed(1);
  }

  return (
    <div className={`w-10 sm:w-12 h-full rounded-full overflow-hidden flex flex-col-reverse relative bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl ${className}`}>
      
      {/* Fill (Your Equity) - Sleek White with Glow */}
      <div 
        className="w-full relative transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col justify-start items-center overflow-visible"
        style={{ 
            height: `${bottomHeight}%`,
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            boxShadow: '0 0 15px rgba(255,255,255,0.2)'
        }}
      >
        {/* Label INSIDE (Dark) - only if enough space */}
        {bottomHeight > 18 && (
            <span className="mt-2 text-[8px] font-bold font-inter tracking-tight text-slate-900 pointer-events-none">
                {scoreLabel}
            </span>
        )}

        {/* Label OUTSIDE (White) - floating above if not enough space */}
        {bottomHeight <= 18 && (
            <div className="absolute -top-5 left-0 w-full flex justify-center pointer-events-none">
                <span className="text-[8px] font-bold font-inter tracking-tight text-white drop-shadow-md">
                    {scoreLabel}
                </span>
            </div>
        )}
      </div>
      
       {/* Midline Indicator */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 z-20 pointer-events-none"></div>
    </div>
  );
}
