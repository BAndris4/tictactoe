import { useState, useRef, useEffect } from "react";
import { 
    getRankImage, 
    RANKS_ORDER, 
    getRankTextColor, 
    getRankIndex 
} from "../../utils/rankUtils";

interface RankLadderViewProps {
  currentRank: string;
  lpInDivision: number;
  onBack: () => void;
}

export default function RankLadderView({ currentRank, lpInDivision, onBack }: RankLadderViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentRankRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const currentRankIdx = getRankIndex(currentRank);

  useEffect(() => {
    if (currentRankRef.current && scrollContainerRef.current) {
        setTimeout(() => {
            currentRankRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'center' 
            });
        }, 100);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({
            left: e.deltaY,
            behavior: 'smooth' 
        });
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden select-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 z-20 px-4 pt-2">
            <button 
                onClick={onBack}
                className="group flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 text-deepblue/60 hover:text-deepblue font-bold font-paytone transition-all active:scale-95"
            >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back to Overview
            </button>
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-deepblue/40 uppercase tracking-widest">Seasonal Journey</span>
                <span className="text-lg font-black text-deepblue font-paytone uppercase leading-none">Rank Path</span>
            </div>
        </div>

        {/* Scrollable Path Container */}
        <div 
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
            className={`
                flex-1 flex items-center overflow-x-auto scrollbar-hide px-[50%] py-8 gap-0 relative z-10 
                ${isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x snap-mandatory'} 
                transition-colors duration-300
            `}
            style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
        >
            {/* Visual Connector Line Background */}
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-100 -translate-y-1/2 z-0 pointer-events-none" />

            {RANKS_ORDER.map((rankName) => {
                const rIdx = getRankIndex(rankName);
                const isCurrent = rIdx === currentRankIdx;
                const isPassed = rIdx < currentRankIdx;
                const isLocked = rIdx > currentRankIdx;
                const isMaster = rankName === "Master";
                
                return (
                    <div 
                        key={rankName} 
                        ref={isCurrent ? currentRankRef : null}
                        className="relative flex-shrink-0 flex flex-col items-center justify-center w-40 md:w-48 group snap-center pointer-events-none"
                    >
                        {/* Connector Progress Line (Colored) */}
                        {isPassed && (
                            <div className="absolute top-1/2 left-1/2 w-full h-2 bg-mint -translate-y-1/2 z-0 origin-left" />
                        )}
                        {isCurrent && (
                            <div 
                                className="absolute top-1/2 left-1/2 h-2 bg-gradient-to-r from-mint to-slate-100 -translate-y-1/2 z-0 origin-left" 
                                style={{ width: `${Math.max(10, lpInDivision)}%` }}
                            />
                        )}

                        {/* Rank Node */}
                        <div className={`
                            relative z-10 transition-all duration-500 ease-out
                            ${isCurrent ? "scale-125 -translate-y-4" : "scale-100"}
                            ${isLocked ? "opacity-50 grayscale" : "opacity-100"}
                        `}>
                            {isCurrent && (
                                <div className="absolute inset-0 bg-mint/30 blur-2xl rounded-full animate-pulse" />
                            )}

                            <div className={`
                                flex items-center justify-center
                                ${isMaster ? "w-28 h-28" : "w-20 h-20"}
                            `}>
                                <img 
                                    src={getRankImage(rankName)} 
                                    alt={rankName} 
                                    className="w-full h-full object-contain drop-shadow-xl select-none"
                                    draggable="false"
                                />
                            </div>

                            {isLocked && (
                                <div className="absolute top-0 right-0 bg-slate-200 p-1.5 rounded-full shadow-sm">
                                    <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                            )}
                        </div>

                        {/* Label Info */}
                        <div className={`
                            mt-4 flex flex-col items-center transition-all duration-300
                            ${isCurrent ? "opacity-100 translate-y-0" : "opacity-40 translate-y-2"}
                        `}>
                            <span className={`text-sm font-black font-paytone uppercase tracking-tight ${getRankTextColor(rankName)}`}>
                                {rankName}
                            </span>
                            {isCurrent && (
                                <span className="text-[10px] font-bold text-mint uppercase tracking-wider bg-mint/10 px-2 py-0.5 rounded-full mt-1">
                                    Current
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
        
        {/* Footer Legend */}
        <div className="bg-white/40 backdrop-blur-md p-3 border-t border-white/50 flex justify-center gap-6 text-[10px] font-bold text-deepblue/40 uppercase tracking-wider">
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-mint"></div>Unlocked</div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-300"></div>Locked</div>
             <div className="flex items-center gap-2 ml-4 text-deepblue/30 italic normal-case">
                Drag or Scroll to explore
             </div>
        </div>
    </div>
  );
}
