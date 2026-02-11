import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { 
    getRankImage, 
    getNextRank 
} from "../../utils/rankUtils";
import { getUserGames } from "../../api/game";

// Sub-components
import RankHeroCard from "./RankHeroCard";
import RankStatsGrid from "./RankStatsGrid";
import RankLadderView from "./RankLadderView";
import HotStreakBanner from "./HotStreakBanner";

interface RankedOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFindGame: () => void;
}

export default function RankedOverviewModal({ isOpen, onClose, onFindGame }: RankedOverviewModalProps) {
  const { user } = useAuth();
  const [games, setGames] = useState<any[]>([]);
  const [showLadder, setShowLadder] = useState(false);
  
  useEffect(() => {
    if (isOpen && user) {
      setShowLadder(false); 
      getUserGames(1, 'ranked', 100)
        .then(data => {
            setGames(data.results);
        });
    }
  }, [isOpen, user]);

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
  const nextRank = getNextRank(profile.rank);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      
      <div className="relative bg-[#F3F4FF] w-full max-w-4xl h-[600px] rounded-[3.5rem] overflow-hidden shadow-2xl animate-fadeScaleIn border-[8px] border-white flex flex-col">
        {/* Background Ambient Effects */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-mint/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-deepblue/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        {!showLadder && (
             <button 
                onClick={onClose} 
                className="absolute top-8 right-8 z-50 p-2.5 bg-white rounded-full shadow-sm text-deepblue/30 hover:text-coral transition-all hover:rotate-90 hover:scale-110 active:scale-90"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
        )}

        <div className="flex-1 p-8 sm:p-10 relative z-10 overflow-hidden">
             {showLadder ? (
                <RankLadderView 
                    currentRank={profile.rank} 
                    lpInDivision={profile.lp_in_division} 
                    onBack={() => setShowLadder(false)} 
                />
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full relative z-10">
                    {/* LEFT: Hero Rank Card */}
                    <RankHeroCard 
                        profile={profile as any} 
                        isPlacement={isPlacement} 
                        onShowLadder={() => setShowLadder(true)} 
                    />

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

                        <RankStatsGrid lpStats={lpStats} />
                        
                        <HotStreakBanner streak={profile.current_streak} />

                        <button
                            onClick={onFindGame}
                            className="w-full py-4 rounded-[1.8rem] bg-deepblue text-white font-paytone text-xl uppercase tracking-widest shadow-[0_10px_30px_-10px_rgba(20,30,80,0.4)] hover:bg-[#1a2b5e] hover:scale-[1.02] hover:shadow-[0_20px_40px_-12px_rgba(20,30,80,0.5)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Find Match
                            </span>
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                        </button>
                    </div>
                </div>
             )}
        </div>
      </div>
    </div>
  );
}
