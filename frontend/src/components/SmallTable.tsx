import type { Coord } from "../models/Coord";
import { useGame } from "../context/GameContext";
import type { Move } from "../models/Move";
import { isMoveValid } from "../rules/gameRule";

function SmallTable({ blockRow, blockCol }: { blockRow: number; blockCol: number }) {

  const game = useGame();

  const handleCellClick = (row: number, col: number) => {
    
    const globalRow = blockRow * 3 + row;
    const globalCol = blockCol * 3 + col;

    const move: Move = {
      block: { row: blockRow, col: blockCol } as Coord,
      cell: { row, col } as Coord
    };

    if (!isMoveValid(game.cells, move, game.previousMove)) return;

    console.log(`Valid Move: ${move.block.row}, ${move.block.col} | ${move.cell.row}, ${move.cell.col}. Previous Move: ${game.previousMove?.block.row}, ${game.previousMove?.block.col} | ${game.previousMove?.cell.row}, ${game.previousMove?.cell.col}`);

    const newCells = game.cells.map((r) => [...r]);
    newCells[globalRow][globalCol] = game.currentPlayer;
    game.setCells(newCells);

    console.log(
      `Move: ${move.block.row}, ${move.block.col} | ${move.cell.row}, ${move.cell.col} | ${game.currentPlayer}`
    );

    game.setPreviousMove(move);
    console.log(game.previousMove);
    game.switchPlayer();
  };

  return (
    <table className="border-collapse">
      <tbody>
        {Array(3).fill(0).map((_, row) => (
          <tr key={row}>
            {Array(3).fill(0).map((_, col) => {
              const globalRow = blockRow * 3 + row;
              const globalCol = blockCol * 3 + col;
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
