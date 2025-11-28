import { useMemo } from "react";
import type { Coord } from "../models/Coord";
import { useGame } from "../context/GameContext";
import type { Move } from "../models/Move";
import { isFull, isMoveValid } from "../rules/gameRule";
import { formatMove, toGlobalCoord } from "../utils";
import { getSmallTableWinner, getWinner } from "../rules/victoryWatcher";

function SmallTable({
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

    if (isFull(game.cells, prev)) return false;

    return prev.row === blockRow && prev.col === blockCol;
  }, [game.previousMove, blockRow, blockCol, game.cells, game.winner]);

  const handleCellClick = (row: number, col: number) => {
    if (game.winner) return console.log("Game Over");

    const { row: globalRow, col: globalCol } = toGlobalCoord(
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
      console.error(err);
      return;
    }

    console.info(
      `Valid Move: ${formatMove(move)}. Previous Move: ${formatMove(
        game.previousMove
      )}`
    );

    const newCells = game.cells.map((r) => [...r]);
    newCells[globalRow][globalCol] = game.currentPlayer;
    game.setCells(newCells);

    const smallWinner = getSmallTableWinner(newCells, move.block);
    if (smallWinner) {
      const newSmallWinners = game.smallWinners.map((r) => [...r]);

      if (!newSmallWinners[blockRow][blockCol]) {
        newSmallWinners[blockRow][blockCol] = smallWinner;
        game.setSmallWinners(newSmallWinners);

        const bigWinner = getWinner(newSmallWinners);
        if (bigWinner) {
          console.info(`Winner: ${bigWinner}`);
          game.setWinner(bigWinner);
        }
      }
    }

    game.setPreviousMove(move);
    game.switchPlayer();
  };

  return (
    <div className="relative">
      <table
        className={`border-collapse ${isActiveBlock ? "bg-green-100" : ""}`}
      >
        <tbody>
          {rows.map((_, row) => (
            <tr key={row}>
              {cols.map((_, col) => {
                const { row: globalRow, col: globalCol } = toGlobalCoord(
                  { row: blockRow, col: blockCol },
                  { row, col }
                );

                return (
                  <td
                    key={col}
                    onClick={() => handleCellClick(row, col)}
                    className="
                      w-14 h-14 border border-slate-300 
                      text-center text-2xl font-bold cursor-pointer select-none
                      hover:bg-blue-50 active:bg-blue-100
                    "
                  >
                    {game.cells[globalRow][globalCol]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="absolute inset-0 pointer-events-none">
        {game.smallWinners[blockRow][blockCol] === "X" && (
          <>
            <div className="absolute w-[12.5rem] h-[0.5rem] -left-4 top-20 bg-red-200 rotate-45 origin-center opacity-50"></div>
            <div className="absolute w-[12.5rem] h-[0.5rem] -left-4 top-20 bg-red-200 -rotate-45 origin-center opacity-50"></div>
          </>
        )}

        {game.smallWinners[blockRow][blockCol] === "O" && (
          <div className="w-[10.5rem] h-[10.5rem] rounded-full border-8 opacity-50 border-blue-200 mx-auto my-auto"></div>
        )}
      </div>
    </div>
  );
}

export default SmallTable;
