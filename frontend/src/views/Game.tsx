import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Table from "../components/Table";
import { GameProvider, useGame } from "../context/GameContext";
import GameOverModal from "../components/GameOverModal";
import InviteModal from "../components/InviteModal";
import BackgroundShapes from "../components/BackgroundShapes";
import { useAuth } from "../hooks/useAuth";
import PlayerCard from "../components/game/PlayerCard";
import MoveHistory from "../components/game/MoveHistory";

function GameContent() {
  const game = useGame();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // 1. Auth Guard
  useEffect(() => {
    console.log("Game.tsx v3 - Auth Check", { loading, user });
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  // 2. Auto-join logic (only runs if authenticated)
  useEffect(() => {
    const checkAndJoin = async () => {
      if (loading || !user) return; // Skip if not ready

      if (
        game.gameId &&
        game.status === "waiting" &&
        game.players.x
      ) {
        const isPlayerX = String(game.players.x) === String(user.id);
        const hasPlayerO = !!game.players.o;
        
        if (!isPlayerX && !hasPlayerO) {
          console.log("Auto-joining game as Player O");
          try {
             await game.joinGame();
          } catch(e) {
              console.error("Auto-join failed", e);
          }
        }
      }
    };
    checkAndJoin();
  }, [game.gameId, game.status, user, loading, game.players, game.joinGame]);

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
        <div className="w-full md:w-80 flex flex-col gap-4 py-2 min-h-0">
          {/* Controls */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-deepblue px-6 py-4 rounded-2xl font-bold shadow-sm transition-all hover:scale-[1.01] active:scale-95 border border-white flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 1.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H7a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Exit Game
          </button>

          {/* Move History */}
          <MoveHistory />
        </div>

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
