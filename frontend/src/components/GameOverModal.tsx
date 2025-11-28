import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";

function GameOverModal() {
  const game = useGame();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // késleltetett megjelenés a big-board vonal után
  useEffect(() => {
    if (game.winner) {
      const timeout = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timeout);
    }
    setVisible(false);
  }, [game.winner]);

  // belépő animációhoz
  useEffect(() => {
    if (visible) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
  }, [visible]);

  if (!game.winner || !visible) return null;

  const handleNewGame = () => window.location.reload();
  const isX = game.winner === "X";

  const accentColor = isX ? "text-coral" : "text-sunshine";
  const accentBorder = isX ? "border-coral/70" : "border-sunshine/70";
  const accentBgSoft = isX ? "bg-coral/10" : "bg-sunshine/10";

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center 
        bg-slate-900/40 backdrop-blur-sm
        transition-opacity duration-200 ease-out
        ${mounted ? "opacity-100" : "opacity-0"}
      `}
    >
      {/* gradient keret + belső kártya */}
      <div className="relative max-w-sm w-full px-3">
        {/* külső, nagyon enyhe gradient keret */}
        <div
          className={`
            absolute inset-0 rounded-3xl 
            bg-gradient-to-br from-deepblue/40 via-transparent to-deepblue/10
            opacity-70
          `}
        />

        <div
          className={`
            relative rounded-2xl bg-white/95 shadow-2xl border ${accentBorder}
            px-7 py-6
            transition-all duration-200 ease-out
            transform
            ${
              mounted
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-3 scale-95"
            }
          `}
        >
          {/* kis label felül */}
          <div className="flex items-center justify-center mb-4">
            <div
              className={`
                inline-flex items-center gap-2 px-3 py-1 rounded-full
                text-xs font-semibold uppercase tracking-[0.12em]
                bg-slate-100 text-slate-500
              `}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Game over</span>
            </div>
          </div>

          {/* fő tartalom */}
          <div className="flex flex-col items-center text-center gap-3">
            {/* winner badge */}
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
                {game.winner}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-slate-900 mt-1">
              <span className={accentColor}>{game.winner}</span> megnyerte a
              játékot!
            </h2>

            <p className="text-sm text-slate-600 max-w-xs">
              Kezdj egy új kört, és próbáld meg visszahódítani a táblát.
            </p>
          </div>

          {/* action gomb */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleNewGame}
              className="
                inline-flex items-center justify-center
                px-5 py-2.5 rounded-xl
                bg-deepblue text-white font-semibold text-sm
                shadow-md
                transition-all duration-200
                hover:bg-deepblue/90
                hover:-translate-y-0.5 hover:shadow-lg
                active:translate-y-0 active:shadow-md
                focus:outline-none focus:ring-2 focus:ring-deepblue/60 focus:ring-offset-2
              "
            >
              Új játék
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameOverModal;
