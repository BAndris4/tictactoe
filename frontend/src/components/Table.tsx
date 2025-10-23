import SmallTable from "./SmallTable";


function Table() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-4 inline-block">
        <table className="border-collapse border-4 border-slate-800">
            <tbody>
                {Array(3).fill(0).map((_, row) => (
                <tr key={row}>
                    {Array(3).fill(0).map((_, col) => (
                    <td key={col} className={`p-0 ${col < 2 ? 'border-r-4' : ''} ${row < 2 ? 'border-b-4' : ''} border-slate-800`}>
                        <SmallTable blockRow={row} blockCol={col} />
                    </td>
                    ))}
                </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}

export default Table;