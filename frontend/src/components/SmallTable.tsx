import type { Coord } from "../models/Coord";
import { useGame } from "../context/GameContext";
import type { Move } from "../models/Move";
import { isMoveValid } from "../rules/gameRule";
import { formatMove, toGlobalCoord } from "../utils";

function SmallTable({ blockRow, blockCol }: { blockRow: number; blockCol: number }) {

  const game = useGame();

  const handleCellClick = (row: number, col: number) => {
    
    const { row: globalRow, col: globalCol } = toGlobalCoord({row: blockRow, col: blockCol}, {row, col});

    const move: Move = {
      block: { row: blockRow, col: blockCol } as Coord,
      cell: { row, col } as Coord
    };

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

    game.setPreviousMove(move);
    game.switchPlayer();
  };

  return (
    <table className={`border-collapse ${game.previousMove?.cell.row === blockRow && game.previousMove?.cell.col === blockCol ? ' bg-blue-100' : ''}` }>
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
  );
}

export default SmallTable;
