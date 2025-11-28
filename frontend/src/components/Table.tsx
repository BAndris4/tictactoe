import SmallTable from "./SmallTable";

export default function Table() {
  return (
    <div
      className="
      bg-white rounded-2xl shadow-xl p-4 
      border border-gray-300 
      transition-transform duration-300 
      scale-[0.97] hover:scale-100
    "
    >
      <table className="border-collapse border-4 border-deepblue rounded-xl overflow-hidden">
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
                      className={`
                    p-0 
                    ${col < 2 ? "border-r-4" : ""} 
                    ${row < 2 ? "border-b-4" : ""} 
                    border-deepblue
                  `}
                    >
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
