import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Table from "../components/game/board/Table";
import { GameProvider, useGame } from "../context/GameContext";
import GameOverModal from "../components/modals/GameOverModal";
import InviteModal from "../components/modals/InviteModal";
import BackgroundShapes from "../components/BackgroundShapes";
import { useAuth } from "../hooks/useAuth";
import PlayerCard from "../components/game/PlayerCard";
import { useGameAutoJoin } from "../hooks/useGameAutoJoin";
import GameSidebar from "../components/game/GameSidebar";

function GameContent() {
  const game = useGame();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // 1. Auth Guard
  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [loading, user, navigate]);

  // 2. Auto-join logic
  useGameAutoJoin();

  const isLocalGame = !game.gameId || game.mode === 'local';
  
  const { me, opponent } = useMemo(() => {
    if (!user || !game.players.x) return { me: null, opponent: null };
    const isX = String(game.players.x) === String(user.id);
    
    return {
      me: isX ? { name: game.players.xName || user.username, symbol: 'X' as const } : { name: game.players.oName || user.username, symbol: 'O' as const },
      opponent: isX 
        ? { name: game.players.oName || (isLocalGame ? user.username : null), symbol: 'O' as const } 
        : { name: game.players.xName || user.username, symbol: 'X' as const }
    };
  }, [user, game.players, isLocalGame]);

  // Show loading or nothing while checking auth to prevent flash/errors
  if (loading || !user) {
      return (
          <div className="h-screen w-full bg-[#F3F4FF] flex items-center justify-center font-inter text-deepblue/50 font-bold animate-pulse">
              Loading...
          </div>
      );
  }

  return (
    <div
      className={`h-screen w-full bg-[#F3F4FF] relative flex items-center justify-center overflow-hidden font-inter ${
        game.flash ? "animate-flash-red" : ""
      }`}
    >
      <BackgroundShapes activePlayer={game.currentPlayer} />

      <div className="relative flex flex-col md:flex-row gap-6 items-stretch justify-center z-10 p-4 md:p-8 w-full max-w-7xl h-full max-h-[900px]">
        
        {/* Main Game Area */}
        <div className="flex flex-col items-center justify-center gap-8 flex-[1.5] py-4">
          {/* Opponent Info */}
          <div className="flex-shrink-0">
            <PlayerCard player={opponent} isLocalGame={isLocalGame} />
          </div>

          {/* Board Container - scales to fit available space */}
          <div className="flex-shrink-0">
            <div className="p-2 sm:p-3 bg-white/30 backdrop-blur-xl rounded-[32px] sm:rounded-[40px] shadow-2xl border border-white/40 transform origin-center scale-90 sm:scale-100 transition-transform">
              <Table />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-shrink-0">
            <PlayerCard player={me} isMe isLocalGame={isLocalGame} />
          </div>
        </div>

        {/* Sidebar */}
        <GameSidebar />

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
