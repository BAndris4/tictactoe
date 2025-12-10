import { useMemo } from "react";
import { useGame } from "../context/GameContext";
import type { Move } from "../models/Move";
import { isFull, isMoveValid } from "../rules/gameRule";
import { toGlobalCoord } from "../utils";
import { getSmallTableWinner, getWinner } from "../rules/victoryWatcher";
import SmallTableWinningLine from "./SmallTableWinningLine";

export default function SmallTable({
  blockRow,
  blockCol,
}: {
  blockRow: number;
  blockCol: number;
}) {
  const game = useGame();

  const rows = useMemo(() => Array(3).fill(0), []);
  const cols = useMemo(() => Array(3).fill(0), []);

  const isActiveBlock = useMemo(() => {
    if (!game.previousMove || game.winner) return false;

    const prev = game.previousMove.cell;

    if (isFull(game.cells, prev)) return true;

    return prev.row === blockRow && prev.col === blockCol;
  }, [game.previousMove, game.cells, blockRow, blockCol, game.winner]);

  const handleCellClick = (row: number, col: number) => {
    if (game.winner) return;

    const global = toGlobalCoord(
      { row: blockRow, col: blockCol },
      { row, col }
    );

    const move: Move = {
      block: { row: blockRow, col: blockCol },
      cell: { row, col },
    };

    try {
      isMoveValid(game.cells, move, game.previousMove);
    } catch (err) {
      game.triggerFlash();
      game.triggerShake();
      return;
    }

    const newCells = game.cells.map((r) => [...r]);
    newCells[global.row][global.col] = game.currentPlayer;
    game.setCells(newCells);

    const smallWinner = getSmallTableWinner(newCells, move.block);
    if (smallWinner && !game.smallWinners[blockRow][blockCol]) {
      const newSmallWinners = game.smallWinners.map((r) => [...r]);
      newSmallWinners[blockRow][blockCol] = smallWinner;

      game.setSmallWinners(newSmallWinners);

      const bigWinner = getWinner(newSmallWinners);
      if (bigWinner) game.setWinner(bigWinner);
    }

    game.setPreviousMove(move);
    game.switchPlayer();
  };

  return (
    <div
      className={`relative ${isActiveBlock ? "animate-pulseHighlight" : ""}`}
    >
      <table className="border-collapse">
        <tbody>
          {rows.map((_, row) => (
            <tr key={row}>
              {cols.map((_, col) => {
                const global = toGlobalCoord(
                  { row: blockRow, col: blockCol },
                  { row, col }
                );

                const isPreviousMoveCell =
                  game.previousMove &&
                  game.previousMove.block.row === blockRow &&
                  game.previousMove.block.col === blockCol &&
                  game.previousMove.cell.row === row &&
                  game.previousMove.cell.col === col;

                const value = game.cells[global.row][global.col];

                return (
                  <td
                    key={col}
                    onClick={() => handleCellClick(row, col)}
                    className={`
                      relative
                      w-14 h-14 border border-slate-200 
                      text-center text-3xl font-bold cursor-pointer select-none
                      hover:bg-gray-50 active:bg-gray-100 transition-all duration-200
                      ${
                        isPreviousMoveCell
                          ? "ring-2 ring-mint/70 bg-mint/10"
                          : ""
                      }
                    `}
                  >
                    {value && (
                      <span className="relative z-10 animate-fadeScaleIn font-paytone">
                        {value === "X" ? (
                          <span className="text-coral">X</span>
                        ) : (
                          <span className="text-sunshine">O</span>
                        )}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <SmallTableWinningLine blockRow={blockRow} blockCol={blockCol} />
    </div>
  );
}
