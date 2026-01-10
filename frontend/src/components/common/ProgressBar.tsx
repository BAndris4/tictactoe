import { useEffect, useState } from 'react';

interface ProgressBarProps {
  currentXp: number;
  nextLevelXp: number;
  xpGained: number;
  level: number;
  leveledUp?: boolean;
}

export default function ProgressBar({ currentXp, nextLevelXp, xpGained, level, leveledUp }: ProgressBarProps) {
  // Determine start value (before this game's XP)
  // If leveled up: the start was (previous_level_max_xp - remainder?) 
  // actually simpler: backend gives us current state. XP Gained is what we added.
  // Visualizing "filling up" is tricky if we leveled up because the bar resets.
  // Strategy:
  // If NO level up: animate from (current - gained) to current.
  // If Level Up: animate from (something) to (current). 
  //   Ideally we'd show the old bar filling to 100%, then level number bumps, bar resets and fills to new current.
  //   But that's complex to coordinate without knowing previous level's max XP.
  //   Backend only sends CURRENT level info.
  //   Compromise for now: Just animate the current level's progress or a simple "slide in".
  
  // Let's try to be smart.
  // If we leveled up, it effectively started at 0 for this new level (visually).
  // Or we can just show the current state filling up from 0.
  
  const percentage = Math.min((currentXp / nextLevelXp) * 100, 100);
  
  // Calculate previous percentage
  // If leveled up, we effectively start at 0 for this new level bar?
  // Or if we want to be fancy, we assume previous was 0 for this level context.
  const startXp = leveledUp ? 0 : Math.max(currentXp - xpGained, 0);
  const previousPercentage = Math.min((startXp / nextLevelXp) * 100, 100);

  const [progress, setProgress] = useState(previousPercentage);
  
  // Animate on mount
  useEffect(() => {
    // Small delay to let UI settle
    const timer = setTimeout(() => {
        setProgress(percentage);
    }, 600);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="w-full max-w-xs mx-auto mt-4">
      <div className="flex justify-between items-end mb-1 px-1">
        <span className="text-sm font-bold text-deepblue/70 font-paytone">
          Level {level}
        </span>
        <span className="text-xs font-semibold text-slate-500">
          {currentXp} <span className="text-slate-400">/ {nextLevelXp} XP</span>
        </span>
      </div>
      
      <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
         {/* 1. Previous XP (Base) - Fill immediately or animate? 
             Let's fill immediately to show the "starting point". 
         */}
         <div 
            className="absolute top-0 left-0 h-full bg-slate-300 rounded-full"
            style={{ width: `${previousPercentage}%` }}
         />

         {/* 2. Total/Current XP (Overlay) - Animate this from previous to current */}
         <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-mint to-sunshine rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
         >
            {/* Shimmer/Stripes Effect */}
            <div className="absolute inset-0 w-full h-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12" />
         </div>
         
         {/* Marker for previous XP */}
         {!leveledUp && (
             <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10"
                style={{ left: `${previousPercentage}%` }}
             />
         )}
      </div>
      
      {leveledUp && (
          <div className="text-center mt-2 animate-bounce">
              <span className="text-xs font-bold text-coral uppercase tracking-widest bg-coral/10 px-2 py-1 rounded">
                  Level Up!
              </span>
          </div>
      )}
      
      <div className="text-center mt-2">
           <span className="text-sm font-medium text-emerald-600">
               +{xpGained} XP Gained
           </span>
      </div>
    </div>
  );
}
