import { Coord } from "../models/Coord";

function SmallTable({ blockRow, blockCol }: { blockRow: number; blockCol: number }) {
  const handleCellClick = (row: number, col: number) => {
    const blockCoord = new Coord(blockRow, blockCol);
    const cellCoord = new Coord(row, col);

    console.log(
      `Block: ${blockCoord.toString()} | Cell: ${cellCoord.toString()} `
    );
  };

  return (
    <table className="border-collapse">
      <tbody>
        {Array(3)
          .fill(0)
          .map((_, row) => (
            <tr key={row}>
              {Array(3)
                .fill(0)
                .map((_, col) => (
                  <td
                    key={col}
                    onClick={() => handleCellClick(row, col)}
                    className="w-14 h-14 border border-slate-300 text-center text-2xl font-medium cursor-pointer transition-colors select-none hover:bg-blue-50 active:bg-blue-100"
                  ></td>
                ))}
            </tr>
          ))}
      </tbody>
    </table>
  );
}

export default SmallTable;
