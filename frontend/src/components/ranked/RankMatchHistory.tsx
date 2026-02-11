import type { MatchHistoryItem } from "../../data/mockProfile";

interface RankMatchHistoryProps {
  history: MatchHistoryItem[];
}

export default function RankMatchHistory({ history }: RankMatchHistoryProps) {
  const rankedHistory = history
    .filter((item) => item.mode === "ranked")
    .slice(0, 5);

  if (rankedHistory.length === 0) {
    return (
      <div className="text-center py-8 bg-deepblue/5 rounded-2xl border-2 border-dashed border-deepblue/10">
        <p className="text-deepblue/40 font-medium font-inter italic">No ranked matches yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rankedHistory.map((item) => (
        <div 
          key={item.id}
          className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-deepblue/5 hover:border-mint/30 transition-all hover:scale-[1.02] group"
        >
          <div className="flex flex-col">
            <span className="text-sm font-bold text-deepblue font-inter group-hover:text-mint transition-colors">vs {item.opponent}</span>
            <span className="text-[10px] text-deepblue/40 font-medium uppercase tracking-wider">{item.date}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`text-[9px] font-black px-2.5 py-1 rounded-full font-paytone uppercase shadow-sm tracking-widest ${
              item.result === 'WIN' ? 'bg-gradient-to-r from-mint to-mint/80 text-white shadow-mint/20' : 
              item.result === 'LOSS' ? 'bg-gradient-to-r from-coral to-coral/80 text-white shadow-coral/20' : 
              'bg-slate-100 text-slate-500'
            }`}>
              {item.result}
            </div>
            
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-md group/reward ${
              (item.lp_change ?? 0) > 0 
                ? "bg-gradient-to-br from-mint to-mint/80 border-mint/20 shadow-mint/10" 
                : (item.lp_change ?? 0) < 0 
                ? "bg-gradient-to-br from-coral to-coral/80 border-coral/20 shadow-coral/10" 
                : "bg-slate-500 border-slate-600 shadow-slate-100"
            }`}>
              <div className={`p-1 bg-white/20 rounded-lg group-hover/reward:scale-110 transition-transform text-white`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
              <span className={`text-[11px] font-black uppercase tracking-wider font-paytone text-white drop-shadow-sm`}>
                {(item.lp_change ?? 0) > 0 ? `+${item.lp_change}` : item.lp_change} LP
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
