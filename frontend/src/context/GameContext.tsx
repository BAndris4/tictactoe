import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Player = "X" | "O";

interface GameContextType {
  currentPlayer: Player;
  switchPlayer: () => void;
  cells: (string | null)[][];
  setCells: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [cells, setCells] = useState<(string | null)[][]>(
    Array(9).fill(null).map(() => Array(9).fill(null))
  );

  const switchPlayer = () => {
    setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
  };

  return (
    <GameContext.Provider value={{ currentPlayer, switchPlayer, cells, setCells }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
}
