import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Table from "../components/Table";
import { GameProvider, useGame } from "../context/GameContext";
import GameOverModal from "../components/GameOverModal";
import InviteModal from "../components/InviteModal";
import BackgroundShapes from "../components/BackgroundShapes";
import { useAuth } from "../hooks/useAuth";
import { joinGame } from "../api/game";

function GameContent() {
  const game = useGame();
  const { user } = useAuth();

  useEffect(() => {
    const checkAndJoin = async () => {
      if (
        game.gameId &&
        game.status === "waiting" &&
        user &&
        game.players.x
      ) {
        // If I am NOT X and there is no O, join automatically
        if (String(game.players.x) !== String(user.id) && !game.players.o) {
          try {
             await joinGame(game.gameId);
             // WS will handle status update
          } catch(e) {
              console.error("Auto-join failed", e);
          }
        }
      }
    };
    checkAndJoin();
  }, [game.gameId, game.status, user, game.players]);

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
      <InviteModal />
    </div>
  );
}

export default function Game() {
  const { id } = useParams<{ id: string }>();
  return (
    <GameProvider gameId={id}>
      <GameContent />
    </GameProvider>
  );
}
