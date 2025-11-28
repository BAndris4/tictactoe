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
  setSmallWinners: React.Dispatch<
    React.SetStateAction<(string | undefined)[][]>
  >;
  winner: string | undefined;
  setWinner: React.Dispatch<React.SetStateAction<string | undefined>>;

  flash: boolean;
  shake: boolean;
  triggerFlash: () => void;
  triggerShake: () => void;
}

export const GameContext = createContext<GameContextType | undefined>(
  undefined
);

export function GameProvider({ children }: { children: ReactNode }) {
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [cells, setCells] = useState<(string | null)[][]>(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(null))
  );

  const [previousMove, setPreviousMove] = useState<Move | undefined>(undefined);

  const [smallWinners, setSmallWinners] = useState<(string | undefined)[][]>(
    Array(3)
      .fill(undefined)
      .map(() => Array(3).fill(undefined))
  );

  const [winner, setWinner] = useState<string | undefined>(undefined);

  const [flash, setFlash] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };

  const switchPlayer = () => {
    setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
  };

  return (
    <GameContext.Provider
      value={{
        currentPlayer,
        switchPlayer,
        cells,
        setCells,
        previousMove,
        setPreviousMove,
        smallWinners,
        setSmallWinners,
        winner,
        setWinner,

        flash,
        shake,
        triggerFlash,
        triggerShake,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
}
