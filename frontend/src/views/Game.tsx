import Table from "../components/Table";
import { GameProvider, useGame } from "../context/GameContext";
import OShape from "../assets/O.svg";
import XShape from "../assets/X.svg";
import GameOverModal from "../components/GameOverModal";

function GameContent() {
  const game = useGame();

  return (
    <div
      className={`min-h-screen w-full bg-white relative flex items-center justify-center overflow-hidden font-inter ${
        game.flash ? "animate-flash-red" : ""
      }`}
    >
      <div className="absolute -translate-x-1/4 -translate-y-1/3 left-[-8%] pointer-events-none transition-all duration-300">
        <img
          src={OShape}
          alt="O-shape"
          className={`w-[900px] transition-all duration-300 ${
            game.currentPlayer === "O"
              ? "grayscale-0 brightness-100 opacity-70"
              : "grayscale brightness-75 opacity-60"
          }`}
        />
      </div>

      <div className="absolute translate-x-[700px] translate-y-1/4 rotate-[30deg] pointer-events-none transition-all duration-300">
        <img
          src={XShape}
          alt="X-shape"
          className={`w-[900px] transition-all duration-300 ${
            game.currentPlayer === "X"
              ? "grayscale-0 brightness-100 opacity-70"
              : "grayscale brightness-75 opacity-60"
          }`}
        />
      </div>

      <div className="relative flex gap-10 items-start z-10 px-10 py-10">
        <Table />
      </div>

      <GameOverModal />
    </div>
  );
}

export default function Game() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
