import { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";

export default function MatchmakingModal() {
  const { isSearching, isSearchMinimized, cancelSearch, minimizeSearch, searchStartTime, searchMode } = useGame();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isSearching && searchStartTime) {
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - searchStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    } else {
        setElapsed(0);
    }
  }, [isSearching, searchStartTime]);

  if (!isSearching || isSearchMinimized) return null;

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeScaleIn">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border-4 border-white text-center relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
             <div className="absolute top-0 -left-1/2 w-full h-full bg-gradient-to-r from-transparent via-deepblue to-transparent animate-[shimmer_3s_infinite]" />
        </div>

        <h2 className="text-2xl font-black text-deepblue font-paytone mb-2">
             Finding Opponent...
             {searchMode === 'ranked' && <span className="ml-2 bg-mint/10 text-mint text-[10px] px-2 py-0.5 rounded align-middle">RANKED</span>}
         </h2>
         <p className="text-slate-500 font-medium mb-8">
             {searchMode === 'ranked' ? 'Searching for players near your MMR' : 'Searching for players near your level'}
         </p>

        <div className="text-5xl font-black text-mint font-paytone mb-8 tabular-nums tracking-widest">
            {formatTime(elapsed)}
        </div>
        
        <div className="flex flex-col gap-3">
            <button 
                onClick={() => minimizeSearch(true)}
                className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
            >
                Minimize
            </button>
            <button 
                onClick={cancelSearch}
                className="w-full py-3 rounded-xl border-2 border-coral/20 text-coral font-bold hover:bg-coral/10 transition-colors"
            >
                Cancel Search
            </button>
        </div>
      </div>
    </div>
  );
}
