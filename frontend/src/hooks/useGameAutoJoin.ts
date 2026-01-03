import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { useGame } from "../context/GameContext";

export function useGameAutoJoin() {
  const game = useGame();
  const { user, loading } = useAuth();
  
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
}
