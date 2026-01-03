import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameResults } from "../../hooks/useGameResults";

function GameOverModal() {
  const game = useGameResults();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (game.status !== "finished") {
      setIsDismissed(false);
    }
    
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
  
  const isX = game.winnerSymbol === "X";
  const isDraw = game.winnerSymbol === "D";

  const accentColor = isDraw ? "text-slate-500" : isX ? "text-coral" : "text-sunshine";
  const accentBorder = isDraw ? "border-slate-300" : isX ? "border-coral/70" : "border-sunshine/70";
  const accentBgSoft = isDraw ? "bg-slate-50" : isX ? "bg-coral/10" : "bg-sunshine/10";

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center 
        bg-slate-900/40 backdrop-blur-sm
        transition-opacity duration-200 ease-out
        ${mounted ? "opacity-100" : "opacity-0"}
      `}
    >
      <div className="relative max-w-sm w-full px-3">
        <div
          className={`
            absolute inset-0 rounded-3xl 
            bg-gradient-to-br from-deepblue/40 via-transparent to-deepblue/10
            opacity-70
          `}
        />

        <div
          className={`
            relative rounded-[2rem] bg-white border border-white
            shadow-2xl shadow-deepblue/10
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
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-deepblue/40 hover:text-deepblue/60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center justify-center mb-4">
            <div
              className={`
                inline-flex items-center gap-2 px-3 py-1 rounded-full
                text-xs font-semibold uppercase tracking-[0.12em]
                bg-slate-100 text-slate-500
              `}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-paytone tracking-wider">Game over</span>
            </div>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <div
              className={`
                inline-flex items-center justify-center
                w-14 h-14 rounded-2xl border-2 ${accentBorder}
                ${accentBgSoft}
                shadow-md
              `}
            >
              <span
                className={`
                  text-3xl font-paytone ${accentColor}
                `}
              >
                {game.winnerSymbol}
              </span>
            </div>

            <h2 className="text-xl font-bold text-deepblue mt-1 font-paytone">
              {isDraw ? (
                <>It's a <span className="text-slate-500">Draw</span>!</>
              ) : game.winnerName ? (
                <><span className={accentColor}>{game.winnerName}</span> has won the game!</>
              ) : (
                <>Game has ended!</>
              )}
            </h2>

            <p className="text-sm text-slate-600 max-w-xs">
              {isDraw 
                ? "Neither side could claim the board. A perfectly balanced match!"
                : "Start a new round and try to conquer the board."
              }
            </p>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleExit}
              className="
                inline-flex items-center justify-center
                px-8 py-3 rounded-xl
                bg-deepblue text-white font-bold text-sm
                shadow-lg shadow-deepblue/20
                transition-all duration-200
                hover:bg-deepblue/90
                hover:-translate-y-0.5 hover:shadow-xl
                active:translate-y-0 active:shadow-md
                focus:outline-none focus:ring-2 focus:ring-deepblue/60 focus:ring-offset-2
                font-paytone tracking-wide
              "
            >
              Exit to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameOverModal;
