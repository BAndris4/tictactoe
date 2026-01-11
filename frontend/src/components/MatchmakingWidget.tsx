import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";

export default function MatchmakingWidget() {
  const { isSearching, isSearchMinimized, cancelSearch, searchStartTime, searchMode } = useGame();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isSearching && searchStartTime) {
        setElapsed(Math.floor((Date.now() - searchStartTime) / 1000));
        
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - searchStartTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [isSearching, searchStartTime]);

  if (!isSearching || !isSearchMinimized) return null;
  
  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div 
        className="fixed top-24 right-4 z-50 bg-white rounded-2xl shadow-xl border-2 border-slate-100 p-4 flex items-center gap-4 animate-fadeScaleIn group hover:scale-[1.02] transition-transform"
    >
        <div className="relative w-3 h-3 shrink-0">
             <div className={`absolute inset-0 ${searchMode === 'ranked' ? 'bg-mint' : 'bg-coral'} rounded-full animate-ping opacity-75`} />
             <div className={`relative w-3 h-3 ${searchMode === 'ranked' ? 'bg-mint' : 'bg-coral'} rounded-full`} />
        </div>
        <div className="flex flex-col mr-2">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight mb-0.5">
                {searchMode === 'ranked' ? 'Ranked' : 'Unranked'}
            </div>
            <div className="text-lg font-black text-deepblue font-paytone tabular-nums leading-none">
                {formatTime(elapsed)}
            </div>
        </div>
        <button 
             onClick={(e) => {
                 e.stopPropagation();
                 cancelSearch();
             }}
             title="Cancel Search"
             className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
            </svg>
        </button>
    </div>
  );
}
