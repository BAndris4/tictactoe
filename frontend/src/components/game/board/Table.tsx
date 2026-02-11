import SmallTable from "./SmallTable";
import { useGame } from "../../../context/GameContext";
import TableWinningLine from "./TableWinningLine";

export default function Table() {
  const game = useGame();

  // Coordinate Helpers

  return (
    <div
      className={`
        bg-white rounded-2xl shadow-xl p-6 relative
        border border-gray-300 
        transition-transform duration-300 
        scale-[0.98] hover:scale-100 ${game.shake ? "animate-shake" : ""}
      `}
    >
      <div className="relative inline-block">
          {/* Row Labels (1-9) - Absolute Left - Outside but close */}
          <div className="absolute -left-3 top-0 h-full flex flex-col py-[2px] text-deepblue/50 font-mono text-xs font-bold leading-none select-none">
              {/* Group 1 (Rows 1-3) */}
              <div className="flex-1 flex flex-col">
                  {[1, 2, 3].map(n => <div key={n} className="flex-1 flex items-center justify-end pr-1">{n}</div>)}
              </div>
              {/* Group 2 (Rows 4-6) */}
              <div className="flex-1 flex flex-col">
                  {[4, 5, 6].map(n => <div key={n} className="flex-1 flex items-center justify-end pr-1">{n}</div>)}
              </div>
              {/* Group 3 (Rows 7-9) */}
              <div className="flex-1 flex flex-col">
                  {[7, 8, 9].map(n => <div key={n} className="flex-1 flex items-center justify-end pr-1">{n}</div>)}
              </div>
          </div>

          {/* Main Board */}
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
          <TableWinningLine />
          
          {/* Col Labels (a-i) - Absolute Bottom - Outside */}
          <div className="absolute -bottom-4 left-0 w-full flex px-[2px] text-deepblue/50 font-mono text-xs font-bold leading-none select-none">
             {/* Group 1 (Cols a-c) */}
             <div className="flex-1 flex justify-around">
                 {['a', 'b', 'c'].map(c => <div key={c} className="flex-1 text-center">{c}</div>)}
             </div>
             {/* Group 2 (Cols d-f) */}
             <div className="flex-1 flex justify-around">
                 {['d', 'e', 'f'].map(c => <div key={c} className="flex-1 text-center">{c}</div>)}
             </div>
             {/* Group 3 (Cols g-i) */}
             <div className="flex-1 flex justify-around">
                 {['g', 'h', 'i'].map(c => <div key={c} className="flex-1 text-center">{c}</div>)}
             </div>
          </div>
      </div>
    </div>
  );
}
