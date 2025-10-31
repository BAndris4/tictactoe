import { Coord } from "../models/Coord";
import { useGame } from "../context/GameContext";

function SmallTable({ blockRow, blockCol }: { blockRow: number; blockCol: number }) {

  const game = useGame();

  const handleCellClick = (row: number, col: number) => {
    
    const globalRow = blockRow * 3 + row;
    const globalCol = blockCol * 3 + col;

    if (game.cells[globalRow][globalCol]) return;

    const newCells = game.cells.map((r) => [...r]);
    newCells[globalRow][globalCol] = game.currentPlayer;
    game.setCells(newCells);

    const blockCoord = new Coord(blockRow, blockCol);
    const cellCoord = new Coord(row, col);

    console.log(
      `Block: ${blockCoord.toString()} | Cell: ${cellCoord.toString()} `
    );

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
