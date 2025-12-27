import { useGame } from "../../context/GameContext";

export default function MoveHistory() {
  const { moves } = useGame();

  return (
    <div className="flex-1 bg-white/60 backdrop-blur-md rounded-[32px] p-6 border border-white/50 shadow-inner flex flex-col overflow-hidden min-h-0">
      <h3 className="text-lg font-bold text-deepblue mb-4 flex items-center gap-2 flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Move History
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
        {moves && moves.length > 0 ? (
          [...moves].reverse().map((move, i) => (
            <div 
              key={move.move_no}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${i === 0 ? 'bg-white border-mint/30 shadow-sm' : 'bg-white/40 border-transparent text-gray-500'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full flex-shrink-0">{move.move_no}</span>
                <span className={`font-bold ${move.player === 'X' ? 'text-coral' : 'text-sunshine'}`}>{move.player}</span>
                <span className="text-sm">B{move.cell} C{move.subcell}</span>
              </div>
              <span className="text-[10px] opacity-50 whitespace-nowrap">{new Date(move.created_at).toLocaleString("hu-HU", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 space-y-2 py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-sm">No moves yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
