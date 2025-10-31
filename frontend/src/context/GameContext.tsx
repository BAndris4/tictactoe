import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Move } from "../models/Move";

type Player = "X" | "O";

interface GameContextType {
  currentPlayer: Player;
  switchPlayer: () => void;
  cells: (string | null)[][];
  setCells: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
  previousMove: Move | undefined;
  setPreviousMove: React.Dispatch<React.SetStateAction<Move | undefined>>;
  smallWinners: (string | undefined)[][];
  setSmallWinners: React.Dispatch<React.SetStateAction<(string | undefined)[][]>>;
  winner: string | undefined;
  setWinner: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [cells, setCells] = useState<(string | null)[][]>(
    Array(9).fill(null).map(() => Array(9).fill(null))
  );
  const [previousMove, setPreviousMove] = useState<Move | undefined>(undefined);
  const [smallWinners, setSmallWinners] = useState<(string | undefined)[][]>(Array(3).fill(undefined).map(() => Array(3).fill(undefined)));
  const [winner, setWinner] = useState<string | undefined>(undefined);

  const switchPlayer = () => {
    setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
  };

  return (
    <GameContext.Provider value={{ currentPlayer, switchPlayer, cells, setCells, previousMove, setPreviousMove, smallWinners, setSmallWinners, winner, setWinner }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
}
