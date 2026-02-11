import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { 
    getRankImage, 
    getNextRank, 
    RANKS_ORDER, 
    getRankTextColor, 
    getRankIndex,
    getRankColor 
} from "../../utils/rankUtils";
import { getUserGames } from "../../api/game";

interface RankedOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFindGame: () => void;
}

export default function RankedOverviewModal({ isOpen, onClose, onFindGame }: RankedOverviewModalProps) {
  const { user } = useAuth();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLadder, setShowLadder] = useState(false);
  
  // --- DRAG & SCROLL STATE ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentRankRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      setShowLadder(false); 
      // Fetch up to 100 ranked games for stats
      getUserGames(1, 'ranked', 100)
        .then(data => {
            setGames(data.results);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, user]);

  // Auto-scroll to current rank when ladder opens (with smooth animation)
  useEffect(() => {
    if (showLadder && currentRankRef.current && scrollContainerRef.current) {
        // Kis késleltetés, hogy a DOM felépüljön
        setTimeout(() => {
            currentRankRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'center' 
            });
        }, 100);
    }
  }, [showLadder]);

  // --- MOUSE DRAG HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // A szorzó növeli a húzás érzékenységét (1.5x gyorsabb)
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // --- WHEEL HANDLER (Horizontal) ---
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
        // Finomabb görgetés egérkerékkel
        scrollContainerRef.current.scrollBy({
            left: e.deltaY,
            behavior: 'smooth' 
        });
    }
  };

  const lpStats = useMemo(() => {
    if (!user) return { day: 0, month: 0, all: 0 };
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    let day = 0, month = 0, all = 0;
    games.forEach(g => {
      const isPlayerX = String(g.player_x) === String(user.id);
      const lpChange = isPlayerX ? (g.player_x_lp_change || 0) : (g.player_o_lp_change || 0);
      const gameDate = new Date(g.created_at);
      all += lpChange;
      if (gameDate > dayAgo) day += lpChange;
      if (gameDate > monthAgo) month += lpChange;
    });
    return { day, month, all };
  }, [games, user]);

  if (!isOpen || !user) return null;

  const profile = user.profile || {
    rank: "Unranked",
    total_lp: 0,
    lp_in_division: 0,
    placement_games_played: 0,
    demotion_shield: 0,
    current_streak: 0
  };

  const isPlacement = (profile.placement_games_played || 0) < 10;
  const currentRankIdx = getRankIndex(profile.rank);
  const nextRank = getNextRank(profile.rank);
  const rankImage = getRankImage(profile.rank);

  // --- LADDER VIEW ---
  const renderLadder = () => {
    return (
        <div className="h-full flex flex-col relative overflow-hidden select-none"> {/* select-none fontos a drag miatt */}
            {/* Header */}
            <div className="flex items-center justify-between mb-4 z-20 px-4 pt-2">
                <button 
                    onClick={() => setShowLadder(false)}
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
                style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }} // Drag közben ne legyen smooth, mert késne
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
                            className="relative flex-shrink-0 flex flex-col items-center justify-center w-40 md:w-48 group snap-center pointer-events-none" // pointer-events-none a gyermekeken, hogy ne zavarják a drag-et
                        >
                            {/* Connector Progress Line (Colored) */}
                            {isPassed && (
                                <div className="absolute top-1/2 left-1/2 w-full h-2 bg-mint -translate-y-1/2 z-0 origin-left" />
                            )}
                            {isCurrent && (
                                <div 
                                    className="absolute top-1/2 left-1/2 h-2 bg-gradient-to-r from-mint to-slate-100 -translate-y-1/2 z-0 origin-left" 
                                    style={{ width: `${Math.max(10, profile.lp_in_division)}%` }}
                                />
                            )}

                            {/* Rank Node */}
                            <div className={`
                                relative z-10 transition-all duration-500 ease-out
                                ${isCurrent ? "scale-125 -translate-y-4" : "scale-100"}
                                ${isLocked ? "opacity-50 grayscale" : "opacity-100"}
                            `}>
                                {/* Glow for current */}
                                {isCurrent && (
                                    <div className="absolute inset-0 bg-mint/30 blur-2xl rounded-full animate-pulse" />
                                )}

                                {/* Image */}
                                <div className={`
                                    flex items-center justify-center
                                    ${isMaster ? "w-28 h-28" : "w-20 h-20"}
                                `}>
                                    <img 
                                        src={getRankImage(rankName)} 
                                        alt={rankName} 
                                        className="w-full h-full object-contain drop-shadow-xl select-none"
                                        draggable="false" // Fontos, hogy a képet ne lehessen külön húzni
                                    />
                                </div>

                                {/* Locked Indicator */}
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

  // ... But I can't split easily.
  // I will target the `renderOverview` function body.

  const renderOverview = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full relative z-10">
            {/* LEFT: Hero Rank Card */}
            <div className="flex flex-col items-center justify-center">
                <div 
                    className="relative w-full max-w-[280px] aspect-[3/4] group cursor-pointer perspective-1000"
                    onClick={() => !isPlacement && setShowLadder(true)}
                >
                    <div className="w-full h-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border-4 border-white overflow-hidden relative transition-transform duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2 group-hover:rotate-1">
                        <div className={`absolute inset-0 opacity-10 ${getRankColor(profile.rank)} bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]`}></div>
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-deepblue/5 to-transparent"></div>
                        
                        <div className="relative h-full flex flex-col items-center justify-between p-6 z-10">
                            {/* Header */}
                            <div className="w-full flex justify-between items-center">
                                <span className="text-xs font-black text-deepblue/30 uppercase tracking-wider">Season 1</span>
                                {!isPlacement && <div className="w-2 h-2 rounded-full bg-mint animate-pulse"></div>}
                            </div>

                            {/* Center Content */}
                            <div className="flex-1 flex items-center justify-center relative w-full">
                                {isPlacement ? (
                                    <div className="flex flex-col items-center w-full">
                                        <div className="text-4xl font-black text-deepblue/20 mb-4">?</div>
                                        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-2 relative">
                                            <div 
                                                className="h-full bg-indigo-500 animate-progressFill" 
                                                style={{ width: `${(profile.placement_games_played / 10) * 100}%` }} 
                                            />
                                        </div>
                                        <div className="text-sm font-bold text-indigo-500 uppercase tracking-widest">
                                            Match {profile.placement_games_played} / 10
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 mt-2 text-center">
                                            Complete placement matches to reveal rank
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-mint/20 to-deepblue/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <img 
                                            src={rankImage} 
                                            alt={profile.rank} 
                                            className="w-40 h-40 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
                                        />
                                    </>
                                )}
                            </div>

                            {/* Footer Info */}
                            <div className="text-center w-full">
                                {isPlacement ? (
                                    <h2 className="text-2xl font-black font-paytone uppercase tracking-tight text-slate-300">
                                        Unranked
                                    </h2>
                                ) : (
                                    <>
                                        <h2 className={`text-3xl font-black font-paytone uppercase tracking-tight mb-1 ${getRankTextColor(profile.rank)}`}>
                                            {profile.rank}
                                        </h2>
                                        
                                        {/* LP Bar or Shield */}
                                        {profile.demotion_shield > 0 ? (
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 border border-red-100 rounded-lg text-[10px] font-bold text-red-500 uppercase tracking-wide animate-pulse">
                                                    <div className="flex gap-0.5">
                                                        {[...Array(3)].map((_, i) => (
                                                            <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3 h-3 ${i < profile.demotion_shield ? 'text-red-500' : 'text-red-200'}`}>
                                                                <path fillRule="evenodd" d="M10.338 1.59a.75.75 0 00-.676 0l-6.25 3a.75.75 0 00-.362.648v5.5c0 3.03 1.906 5.757 4.661 6.84a.75.75 0 00.578 0c2.755-1.083 4.661-3.81 4.661-6.84v-5.5a.75.75 0 00-.362-.648l-6.25-3zM10 3.178l4.75 2.28v4.792c0 2.21-1.385 4.198-3.374 4.98a.75.75 0 00-.022.007L10 15.792l-.354-.555a.75.75 0 00-.022-.007c-1.99-.782-3.374-2.77-3.374-4.98V5.458L10 3.178z" clipRule="evenodd" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                    Shield Active
                                                </div>
                                                <span className="text-[9px] font-bold text-red-400 uppercase tracking-tighter">No LP reduction for shield</span>
                                            </div>
                                        ) : (
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                                                <div className="h-full bg-mint" style={{ width: `${Math.max(5, profile.lp_in_division)}%` }}></div>
                                            </div>
                                        )}
                                        
                                        <p className="text-[10px] font-bold text-deepblue/40 uppercase tracking-widest group-hover:text-mint transition-colors mt-1">
                                            Click to View Path
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Stats & Actions */}
            <div className="flex flex-col gap-6">
              <div className="bg-white/60 backdrop-blur-xl p-5 rounded-[2rem] border border-white shadow-sm">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-xs font-black text-deepblue/40 uppercase tracking-widest">
                    {isPlacement ? "Placement Progress" : "Rank Progress"}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-deepblue font-paytone">
                        {isPlacement ? `${(profile.placement_games_played / 10) * 100}%` : profile.lp_in_division}
                    </span>
                    <span className="text-xs font-bold text-deepblue/40">{isPlacement ? "Complete" : "LP"}</span>
                  </div>
                </div>

                {nextRank ? (
                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 flex-shrink-0 bg-slate-50 rounded-xl flex items-center justify-center p-1.5">
                            <img src={getRankImage(nextRank)} className="w-full h-full object-contain opacity-50 grayscale" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                                <span className="text-deepblue/60">To {nextRank}</span>
                                <span className="text-deepblue/40">{100 - profile.lp_in_division} LP Left</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-deepblue/20 rounded-full" 
                                    style={{ width: `${Math.max(5, profile.lp_in_division)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl text-center font-bold text-xs uppercase tracking-wider border border-purple-100">
                        Maximum Rank Achieved
                    </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                 {[
                    { label: "24h Gained", value: lpStats.day },
                    { label: "30d Gained", value: lpStats.month },
                    { label: "Total LP", value: lpStats.all }
                 ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-50 flex flex-col items-center justify-center group hover:-translate-y-1 transition-transform relative overflow-hidden">
                        <span className="text-[9px] font-black text-deepblue/30 uppercase tracking-tighter mb-1">{stat.label}</span>
                        <span className={`text-lg font-black font-paytone ${stat.value >= 0 ? 'text-mint' : 'text-coral'}`}>
                        {stat.value >= 0 ? '+' : ''}{stat.value}
                        </span>
                    </div>
                 ))}
              </div>
              
              {profile.current_streak >= 3 && (
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center justify-between group animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">🔥</div>
                        <div>
                            <div className="text-xs font-black text-orange-600 uppercase tracking-wider">Hot Streak</div>
                            <div className="text-[10px] font-bold text-orange-400">Earning bonus LP while on Hot Streak!</div>
                        </div>
                    </div>
                    <div className="text-xl font-black text-orange-500 font-paytone decoration-mint decoration-wavy underline-offset-4">EXTRA LP</div>
                </div>
              )}
              <button
                onClick={onFindGame}
                className="w-full py-4 rounded-[1.8rem] bg-deepblue text-white font-paytone text-xl uppercase tracking-widest shadow-[0_10px_30px_-10px_rgba(20,30,80,0.4)] hover:bg-[#1a2b5e] hover:scale-[1.02] hover:shadow-[0_20px_40px_-12px_rgba(20,30,80,0.5)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Find Match
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
              </button>
            </div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative bg-[#F3F4FF] w-full max-w-4xl h-[600px] rounded-[3.5rem] overflow-hidden shadow-2xl animate-fadeScaleIn border-[8px] border-white flex flex-col">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-mint/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-deepblue/5 rounded-full blur-[120px] pointer-events-none"></div>
        {!showLadder && (
             <button onClick={onClose} className="absolute top-8 right-8 z-50 p-2.5 bg-white rounded-full shadow-sm text-deepblue/30 hover:text-coral transition-all hover:rotate-90 hover:scale-110 active:scale-90">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        )}
        <div className="flex-1 p-8 sm:p-10 relative z-10 overflow-hidden">
             {showLadder ? renderLadder() : renderOverview()}
        </div>
      </div>
    </div>
  );
}


