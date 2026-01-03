import { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import { getGame, type Game } from "../api/game";

export function useGameResults() {
  const game = useGame();
  const [fullGameData, setFullGameData] = useState<Game | null>(null);

  useEffect(() => {
    if (game.gameId && game.status === "finished") {
      getGame(game.gameId)
        .then(setFullGameData)
        .catch(console.error);
    }
  }, [game.gameId, game.status]);

  const winnerSymbol = fullGameData?.winner || game.winner;
  let winnerName = null;

  if (winnerSymbol) {
    if (winnerSymbol === "X") {
      winnerName = fullGameData?.player_x_name || (typeof game.players.xName === 'string' ? game.players.xName : "Player X");
    } else if (winnerSymbol === "O") {
      winnerName = fullGameData?.player_o_name || (typeof game.players.oName === 'string' ? game.players.oName : "Player O");
    } else if (winnerSymbol === "D") {
      winnerName = "Draw";
    }
  }

  return {
    ...game,
    winnerSymbol,
    winnerName,
  };
}
