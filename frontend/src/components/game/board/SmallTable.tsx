import { useMemo } from "react";
import { useGame } from "../../../context/GameContext";
import type { Move } from "../../../models/Move";
import { isFull } from "../../../rules/gameRule";
import { toGlobalCoord } from "../../../utils/gameStateUtils";
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

    // Check if target board is won
    const isTargetWon = game.smallWinners && game.smallWinners[prev.row][prev.col];

    if (isFull(game.cells, prev) || isTargetWon) return true;

    return prev.row === blockRow && prev.col === blockCol;
  }, [game.previousMove, game.cells, game.smallWinners, blockRow, blockCol, game.winner]);

  const handleCellClick = (row: number, col: number) => {

    
    if (game.winner) return;

    const move: Move = {
      block: { row: blockRow, col: blockCol },
      cell: { row, col },
    };

    game.makeMove(move);
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
