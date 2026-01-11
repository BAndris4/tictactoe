import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameResults } from "../../hooks/useGameResults";
import { useAuth } from "../../hooks/useAuth";
import ProgressBar from "../common/ProgressBar";

function GameOverModal() {
  const game = useGameResults();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (game.status !== "finished") {
      setIsDismissed(false);
    }
    
    // Slight delay to ensure XP results might have arrived if they are coming separately
    // (though they usually come in the same message or very close)
    if (game.status === "finished" || game.winner) {
      const timeout = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timeout);
    } else {
      setVisible(false);
    }
  }, [game.status, game.winner]);

  useEffect(() => {
    if (visible && !isDismissed) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
  }, [visible, isDismissed]);

  if ((!game.winner && game.status !== "finished") || !visible || isDismissed) return null;

  const handleExit = () => navigate("/");
  const handleClose = () => setIsDismissed(true);
  
  // Determine Outcome
  const isMe = user && (
      (game.winnerSymbol === 'X' && String(game.players.x) === String(user.id)) || 
      (game.winnerSymbol === 'O' && String(game.players.o) === String(user.id))
  );
  
  const isDraw = game.winnerSymbol === "D";
  const isLoss = !isMe && !isDraw && user; // Only show loss if logged in and not winner/draw

  // XP Result lookup
  const myXpResult = user && game.xpResults ? game.xpResults[user.id] : null;

  // Styling
  let accentColor = "text-slate-500";
  let titleText = "Game Over";
  let subText = "Game has ended!";

  if (isDraw) {
      titleText = "It's a Draw!";
      subText = "Well played by both sides.";
      accentColor = "text-slate-500";
  } else if (isMe) {
      titleText = "You Win!";
      subText = "Victory is yours!";
      accentColor = "text-sunshine";
  } else if (isLoss) {
      titleText = "You Lost";
      subText = "Better luck next time.";
      accentColor = "text-coral";
  } else {
      // Spectator or anonymous
      titleText = "Game Over";
      if (game.winnerName) {
           subText = `${game.winnerName} won!`;
      }
      accentColor = "text-deepblue";
  }

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center 
        bg-slate-900/60 backdrop-blur-sm
        transition-opacity duration-200 ease-out
        ${mounted ? "opacity-100" : "opacity-0"}
      `}
    >
      <div className="relative max-w-sm w-full px-3">
        <div
          className={`
            absolute inset-0 rounded-3xl 
            bg-gradient-to-br from-deepblue/80 via-deepblue/60 to-deepblue/40
            opacity-90 blur-xl transform scale-105
          `}
        />

        <div
          className={`
            relative rounded-[2rem] bg-white border-4 border-white
            shadow-2xl shadow-deepblue/20
            px-7 py-8
            transition-all duration-300 ease-out
            transform
            ${
              mounted
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-3 scale-95"
            }
          `}
        >
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col items-center text-center gap-1 mb-6">
             <div className={`text-4xl font-paytone mb-2 ${accentColor} drop-shadow-sm`}>
                 {titleText}
             </div>
             <p className="text-slate-500 font-medium">{subText}</p>
          </div>

          {myXpResult && (
              <div className="mb-6 space-y-3">
                  {game.mode === 'ranked' && myXpResult && myXpResult.lp_change !== undefined && (
                    <div className="bg-mint/5 rounded-2xl p-4 border border-mint/10 flex items-center justify-between animate-fadeInUp opacity-0 [animation-fill-mode:forwards] [animation-delay:400ms]">
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-extrabold text-mint uppercase tracking-widest font-inter">Rank Points</span>
                            <span className="text-sm font-black text-deepblue font-paytone">Match Efficiency</span>
                        </div>
                        <div className={`text-3xl font-black font-paytone drop-shadow-sm ${
                            (myXpResult.lp_change ?? 0) > 0 ? 'text-mint' : 
                            (myXpResult.lp_change ?? 0) < 0 ? 'text-coral' : 'text-deepblue/40'
                        }`}>
                            {(myXpResult.lp_change ?? 0) > 0 ? `+${myXpResult.lp_change}` : myXpResult.lp_change} LP
                        </div>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <ProgressBar 
                        currentXp={myXpResult.current_xp} 
                        nextLevelXp={myXpResult.next_level_xp} 
                        xpGained={myXpResult.xp_gained}
                        level={myXpResult.new_level}
                        leveledUp={myXpResult.leveled_up}
                      />
                  </div>
              </div>
          )}
          
          {/* 
            History View Mode 
            If no xpResult is present, it implies we are viewing a historic game. 
            In this case, we suppress the XP section entirely.
          */}

          <div className="flex justify-center w-full">
            <button
              onClick={handleExit}
              className="
                w-full
                inline-flex items-center justify-center
                px-8 py-4 rounded-xl
                bg-deepblue text-white font-bold text-lg
                shadow-lg shadow-deepblue/20
                transition-all duration-200
                hover:bg-deepblue/90
                hover:-translate-y-0.5 hover:shadow-xl
                active:translate-y-0 active:shadow-md
                focus:outline-none focus:ring-2 focus:ring-deepblue/60 focus:ring-offset-2
                font-paytone tracking-wider
              "
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameOverModal;
