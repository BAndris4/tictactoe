import { useMemo } from "react";
import type { CSSProperties } from "react";
import { useGame } from "../context/GameContext";
import {
  getWinningLineInBlock,
  type WinningLine,
} from "../rules/lineHighlight";

function getLineStyle(info: WinningLine): CSSProperties {
  const thickness = 4;
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
        width: "125%",
        height: `${thickness}px`,
      };
    }
    case "diag-anti": {
      return {
        top: "50%",
        left: "50%",
        width: "125%",
        height: `${thickness}px`,
      };
    }
  }
}

export default function SmallTableWinningLine({
  blockRow,
  blockCol,
}: {
  blockRow: number;
  blockCol: number;
}) {
  const game = useGame();

  const smallWinner = game.smallWinners[blockRow][blockCol];

  const winningLine = useMemo(
    () => getWinningLineInBlock(game.cells, blockRow, blockCol, smallWinner),
    [game.cells, blockRow, blockCol, smallWinner]
  );

  const lineAnimationClass =
    winningLine?.type === "row"
      ? "animate-strike-row"
      : winningLine?.type === "col"
      ? "animate-strike-col"
      : winningLine?.type === "diag-main"
      ? "animate-strike-diag-main"
      : winningLine?.type === "diag-anti"
      ? "animate-strike-diag-anti"
      : "";

  if (!smallWinner || !winningLine) return null;

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className={`
          absolute rounded-full shadow-md
          ${smallWinner === "X" ? "bg-coral" : "bg-sunshine"}
          ${lineAnimationClass}
        `}
        style={getLineStyle(winningLine)}
      />
    </div>
  );
}
