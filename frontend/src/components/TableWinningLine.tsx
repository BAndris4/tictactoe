import { useMemo } from "react";
import type { CSSProperties } from "react";
import { useGame } from "../context/GameContext";
import {
  getWinningLineInBigBoard,
  type WinningLine,
} from "../rules/lineHighlight";

function getLineStyle(info: WinningLine): CSSProperties {
  const thickness = 6;
  const third = 100 / 3;

  switch (info.type) {
    case "row": {
      const centerY = (info.index + 0.5) * third;
      return {
        top: `${centerY}%`,
        left: "5%",
        width: "90%",
        height: `${thickness}px`,
      };
    }
    case "col": {
      const centerX = (info.index + 0.5) * third;
      return {
        left: `${centerX}%`,
        top: "5%",
        height: "90%",
        width: `${thickness}px`,
      };
    }
    case "diag-main": {
      return {
        top: "50%",
        left: "50%",
        width: "130%",
        height: `${thickness}px`,
      };
    }
    case "diag-anti": {
      return {
        top: "50%",
        left: "50%",
        width: "130%",
        height: `${thickness}px`,
      };
    }
  }
}

export default function TableWinningLine() {
  const game = useGame();

  const winningLine = useMemo(
    () => getWinningLineInBigBoard(game.smallWinners, game.winner),
    [game.smallWinners, game.winner]
  );

  if (!game.winner || !winningLine) return null;

  const lineAnimationClass =
    winningLine.type === "row"
      ? "animate-strike-row"
      : winningLine.type === "col"
      ? "animate-strike-col"
      : winningLine.type === "diag-main"
      ? "animate-strike-diag-main"
      : "animate-strike-diag-anti";

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className={`
          absolute rounded-full shadow-md
          ${game.winner === "X" ? "bg-coral" : "bg-sunshine"}
          ${lineAnimationClass}
        `}
        style={getLineStyle(winningLine)}
      />
    </div>
  );
}
