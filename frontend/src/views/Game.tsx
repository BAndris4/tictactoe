import Table from "../components/Table";
import { GameProvider, useGame } from "../context/GameContext";
import GameOverModal from "../components/GameOverModal";
import BackgroundShapes from "../components/BackgroundShapes";

function GameContent() {
  const game = useGame();

  return (
    <div
      className={`min-h-screen w-full bg-[#F3F4FF] relative flex items-center justify-center overflow-hidden font-inter ${
        game.flash ? "animate-flash-red" : ""
      }`}
    >
       <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-deepblue/5 rounded-full blur-[100px] pointer-events-none"></div>
       <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mint/10 rounded-full blur-[100px] pointer-events-none"></div>

      <BackgroundShapes activePlayer={game.currentPlayer} />

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
