import { useEffect, useState } from 'react';
import { getRankColor } from '../../utils/rankUtils';

interface LPProgressBarProps {
  previousLp: number; // 0-100 within division
  newLp: number;      // 0-100 within division
  lpChange: number;
  rank: string;
}

export default function LPProgressBar({ previousLp, newLp, lpChange, rank }: LPProgressBarProps) {
  const [progress, setProgress] = useState(previousLp);
  const rankColorClass = getRankColor(rank);

  useEffect(() => {
    const timer = setTimeout(() => {
      // If it's a rank change, the animation is handled differently in the modal (showing old then new)
      // but for the bar itself, we just animate to the new value.
      setProgress(newLp);
    }, 800);
    return () => clearTimeout(timer);
  }, [newLp]);

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between items-end mb-2 px-1">
        <span className="text-xs font-black text-deepblue/40 uppercase tracking-widest">
            Division Progress
        </span>
        <span className="text-sm font-black text-deepblue/80 font-inter">
          {newLp} <span className="text-deepblue/30 font-bold">/ 100 LP</span>
        </span>
      </div>
      
      <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
         {/* Base/Previous LP */}
         <div 
            className="absolute top-0 left-0 h-full bg-slate-200 rounded-full"
            style={{ width: `${previousLp}%` }}
         />
 
         {/* Animating Fill */}
         <div 
            className={`absolute top-0 left-0 h-full ${rankColorClass} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
            style={{ width: `${progress}%` }}
         >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 w-full h-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12" />
         </div>
      </div>
      
      <div className="mt-4 flex justify-center">
        <span className={`text-sm font-black px-4 py-2 rounded-full ${
            lpChange >= 0 ? 'bg-mint/10 text-mint' : 'bg-coral/10 text-coral'
        } animate-fadeInUp shadow-sm`}>
            {lpChange >= 0 ? `+${lpChange}` : lpChange} LP This Game
        </span>
      </div>
    </div>
  );
}
