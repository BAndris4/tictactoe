function SmallTable({ blockRow, blockCol }: { blockRow: number, blockCol: number }) {

  const handleCellClick = (row:number, col:number) => {
    console.log(`Block [${blockRow},${blockCol}] - Cell [${row},${col}]`);
  };

  return (
      <table className="border-collapse">
        <tbody>
          {Array(3).fill(0).map((_, row) => (
            <tr key={row}>
              {Array(3).fill(0).map((_, col) => {
                return (
                  <td 
                    key={col}
                    onClick={() => handleCellClick(row, col)}
                    className="w-14 h-14 border border-slate-300 text-center text-2xl font-medium cursor-pointer transition-colors select-none hover:bg-blue-50 active:bg-blue-100"
                  >
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