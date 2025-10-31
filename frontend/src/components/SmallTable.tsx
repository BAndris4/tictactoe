import type { Coord } from "../models/Coord";
import { useGame } from "../context/GameContext";
import type { Move } from "../models/Move";
import { isFull, isMoveValid } from "../rules/gameRule";
import { formatMove, toGlobalCoord } from "../utils";
import { getSmallTableWinner, getWinner } from "../rules/victoryWatcher";

function SmallTable({ blockRow, blockCol }: { blockRow: number; blockCol: number }) {

  const game = useGame();

  const handleCellClick = (row: number, col: number) => {
    
    if (game.winner) {
      console.log("Game Over");
      return;
    }
    
    const { row: globalRow, col: globalCol } = toGlobalCoord({row: blockRow, col: blockCol}, {row, col});

    const move: Move = {
      block: { row: blockRow, col: blockCol } as Coord,
      cell: { row, col } as Coord
    }

    try {
        isMoveValid(game.cells, move, game.previousMove);
    } catch (err) {
        console.error(err);
        return;
    }

    console.info(`Valid Move: ${formatMove(move)}. Previous Move: ${formatMove(game.previousMove)}`);

    const newCells = game.cells.map((r) => [...r]);
    newCells[globalRow][globalCol] = game.currentPlayer;
    game.setCells(newCells);

    const smallTableWinner = getSmallTableWinner(newCells, move.block);
    if (smallTableWinner) {
        console.info(`Small Table Winner: ${smallTableWinner}`);
        const newSmallWinners = game.smallWinners.map((r) => [...r]);
        if (newSmallWinners[move.block.row][move.block.col] === undefined) {
          newSmallWinners[move.block.row][move.block.col] = smallTableWinner;
          game.setSmallWinners(newSmallWinners);
        }

        const winner = getWinner(newSmallWinners);
        if (winner) {
            console.info(`Winner: ${winner}`);
            game.setWinner(winner);
        }
    }

    game.setPreviousMove(move);
    game.switchPlayer();
  }

  return (
    <div className="relative">
      <table
        className={`border-collapse ${
          (game.previousMove && isFull(game.cells, { row: game.previousMove.cell.row, col: game.previousMove.cell.col })) ||
          (!game.winner && game.previousMove?.cell.row === blockRow && game.previousMove?.cell.col === blockCol)
            ? ' bg-green-100'
            : ''
        }`}
      >
        <tbody>
          {Array(3).fill(0).map((_, row) => (
            <tr key={row}>
              {Array(3).fill(0).map((_, col) => {
                const { row: globalRow, col: globalCol } = toGlobalCoord({ row: blockRow, col: blockCol }, { row, col });
                return (
                  <td
                    key={col}
                    onClick={() => handleCellClick(row, col)}
                    className="w-14 h-14 border border-slate-300 text-center text-2xl font-bold cursor-pointer select-none hover:bg-blue-50 active:bg-blue-100"
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
        {game.smallWinners[blockRow][blockCol] === 'X' && (
          <>
            <div className="absolute w-[12.5rem] h-[0.5rem] -left-4 top-20 bg-red-200 rotate-45 origin-center opacity-50"></div>
            <div className="absolute w-[12.5rem] h-[0.5rem] -left-4 top-20 bg-red-200 -rotate-45 origin-center opacity-50"></div>
          </>
        )}
        {game.smallWinners[blockRow][blockCol] === 'O' && (
          <div className="w-[10.5rem] h-[10.5rem] rounded-full border-8 opacity-50 border-blue-200 mx-auto my-auto"></div>
        )}
      </div>
    </div>
  );
}

export default SmallTable;
