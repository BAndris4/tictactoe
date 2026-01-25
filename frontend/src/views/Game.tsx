import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Table from "../components/game/board/Table";
import { GameProvider, useGame } from "../context/GameContext";
import GameOverModal from "../components/modals/GameOverModal";
import InviteModal from "../components/modals/InviteModal";
import BackgroundShapes from "../components/BackgroundShapes";
import ResignModal from "../components/modals/ResignModal";
import ExitWarningModal from "../components/modals/ExitWarningModal";
import { forfeitGame } from "../api/game";
import { useAuth } from "../hooks/useAuth";
import PlayerCard from "../components/game/PlayerCard";
import { useGameAutoJoin } from "../hooks/useGameAutoJoin";
import { getAuthToken } from "../hooks/useAuth";
import GameSidebar from "../components/game/GameSidebar";

function GameContent() {
  const game = useGame();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showResignModal, setShowResignModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

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
  
  // Ref to track game status for unmount cleanup
  const gameStatusRef = useRef(game.status);
  const gameIdRef = useRef(game.gameId);
  const isLocalRef = useRef(isLocalGame);
  
  // Update refs when they change
  useEffect(() => {
      gameStatusRef.current = game.status;
      gameIdRef.current = game.gameId;
      isLocalRef.current = isLocalGame;
  }, [game.status, game.gameId, isLocalGame]);

  // 3. Auto-forfeit on tab switch (10s) and Status Updates
  useEffect(() => {
    if (!game.gameId || game.status !== 'active' || isLocalGame) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Tab hidden. Starting auto-forfeit timer (10s)...");
        game.updatePlayerStatus('away'); 
        
        timeoutId = setTimeout(() => {
          console.log("Auto-forfeiting due to inactivity...");
          forfeitGame(game.gameId!).catch(console.error);
        }, 10000);
      } else {
        console.log("Tab visible. Clearing auto-forfeit timer.");
        game.updatePlayerStatus('active'); 
        clearTimeout(timeoutId);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(timeoutId);
    };
  }, [game.gameId, game.status, isLocalGame]);

  // 4. Handle "Back Button" / Unmount Forfeit
  useEffect(() => {
    return () => {
        // This runs on component unmount
        if (isLocalRef.current) return;
        
        // If game is technically active when we leave
        if (gameStatusRef.current === 'active' && gameIdRef.current) {
            console.log("Unmounting active game - triggering forfeit with keepalive");
            
            const token = getAuthToken();
            const gameId = gameIdRef.current;
            
            // Use fetch with keepalive which outlives the page context
            fetch(`http://localhost:8000/api/games/${gameId}/forfeit/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                keepalive: true
            }).catch(err => console.error("Unmount forfeit failed", err));
        }
    };
  }, []);

  const { me, opponent } = useMemo(() => {
    if (!user) return { me: null, opponent: null };
    
    // Safely check player assignment
    const isX = game.players.x && String(game.players.x) === String(user.id);
    const isO = game.players.o && String(game.players.o) === String(user.id);
    
    if (isX) {
        return {
            me: { name: game.players.xName || user.username, symbol: 'X' as const },
            opponent: { name: game.players.oName || (isLocalGame ? user.username : "Opponent"), symbol: 'O' as const }
        };
    }
    
    if (isO) {
        return {
            me: { name: game.players.oName || user.username, symbol: 'O' as const },
            opponent: { name: game.players.xName || "Opponent", symbol: 'X' as const }
        };
    }
    
    return { me: null, opponent: null };
  }, [user, game.players, isLocalGame]);

  const handleResignClick = () => {
    setShowResignModal(true);
  };

  const handleExitClick = () => {
    if (isLocalGame || game.status === 'waiting' || game.status === 'finished') {
      if ((game.status === 'waiting' || (isLocalGame && game.status === 'active')) && game.gameId) {
        // For local games or waiting games, notify server and exit immediately
        forfeitGame(game.gameId).catch(console.error);
      }
      navigate("/");
    } else {
      setShowExitModal(true);
    }
  };

  const handleConfirmForfeit = async () => {
    if (!game.gameId) return;
    try {
      await forfeitGame(game.gameId);
      setShowResignModal(false);
    } catch (e) {
      console.error("Failed to forfeit", e);
    }
  };

  const handleConfirmExit = async () => {
    if (!game.gameId) return;
    try {
      await forfeitGame(game.gameId);
      navigate("/");
    } catch (e) {
      console.error("Failed to forfeit", e);
      navigate("/");
    }
  };

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
          
           {/* Opponent Away Warning */}
           {game.opponentStatus === 'away' && game.status === 'active' && !isLocalGame && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500/90 text-white px-4 py-2 rounded-full shadow-lg z-50 animate-pulse font-bold flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  Opponent is away! Auto-win in 10s...
              </div>
           )}
        </div>

        {/* Sidebar */}
        <GameSidebar 
          onExit={handleExitClick}
          onResign={game.status !== 'finished' ? handleResignClick : undefined}
          isLocalGame={isLocalGame}
        />

      </div>

      <GameOverModal />
      <InviteModal />

      <ResignModal 
        isOpen={showResignModal}
        onClose={() => setShowResignModal(false)}
        onConfirm={handleConfirmForfeit}
      />
      
      <ExitWarningModal 
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
      />
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
