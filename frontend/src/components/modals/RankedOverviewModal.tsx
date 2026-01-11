import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getRankImage, getNextRank } from "../../utils/rankUtils";
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
  
  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      getUserGames()
        .then(data => {
            setGames(data.filter(g => g.mode === 'ranked'));
        })
        .finally(() => setLoading(false));
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
    mmr: 1000,
    level: 1,
    current_xp: 0,
    next_level_xp: 1000,
    placement_games_played: 0
  };

  const nextRank = getNextRank(profile.rank);
  const rankImage = getRankImage(profile.rank);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-deepblue/60 backdrop-blur-md animate-fadeIn" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-[#F3F4FF] w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-fadeScaleIn border-4 border-white/50">
        
        {/* Header/Close */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-8 text-deepblue/20 hover:text-coral transition-colors z-10"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left: Rank Display */}
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-mint/20 blur-3xl rounded-full group-hover:bg-mint/30 transition-all duration-500"></div>
                <img 
                  src={rankImage} 
                  alt={profile.rank} 
                  className="w-48 h-48 relative drop-shadow-2xl animate-float"
                />
              </div>
              
              <div className="mt-8">
                <h2 className="text-4xl font-black text-deepblue font-paytone tracking-tight uppercase">
                  {profile.rank}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-xl font-bold text-deepblue/40 font-inter uppercase tracking-widest">
                    Current Division
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Progression & Actions */}
            <div className="flex flex-col gap-8">
              
              {/* LP Progress Bar */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-deepblue/40 uppercase tracking-widest font-inter">
                    Division Progress
                  </span>
                  <span className="text-sm font-black text-deepblue font-paytone">
                    {profile.lp_in_division}/100
                  </span>
                </div>
                <div className="h-6 bg-white rounded-full p-1 shadow-inner overflow-hidden border-2 border-deepblue/5">
                  <div 
                    className="h-full bg-gradient-to-r from-mint via-mint/80 to-mint/60 rounded-full transition-all duration-1000 relative overflow-hidden"
                    style={{ width: `${Math.min(100, Math.max(5, profile.lp_in_division))}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                {nextRank && (
                  <p className="text-[10px] font-bold text-deepblue/40 font-inter text-center uppercase tracking-wider">
                    Next: <span className="text-deepblue/60">{nextRank}</span> • {100 - profile.lp_in_division} LP AWAY
                  </p>
                )}
              </div>

              {/* Stats Section */}
              <div className="relative">
                {loading && (
                  <div className="absolute inset-0 bg-[#F3F4FF]/80 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
                    <div className="w-5 h-5 border-2 border-mint border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-2xl p-3 border-2 border-deepblue/5 flex flex-col items-center">
                    <span className="text-[8px] font-black text-deepblue/30 uppercase tracking-tighter mb-1">Last 24h</span>
                    <span className={`text-sm font-black font-paytone ${lpStats.day >= 0 ? 'text-mint' : 'text-coral'}`}>
                      {lpStats.day >= 0 ? '+' : ''}{lpStats.day}
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-3 border-2 border-deepblue/5 flex flex-col items-center">
                    <span className="text-[8px] font-black text-deepblue/30 uppercase tracking-tighter mb-1">Last 30d</span>
                    <span className={`text-sm font-black font-paytone ${lpStats.month >= 0 ? 'text-mint' : 'text-coral'}`}>
                      {lpStats.month >= 0 ? '+' : ''}{lpStats.month}
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-3 border-2 border-deepblue/5 flex flex-col items-center">
                    <span className="text-[8px] font-black text-deepblue/30 uppercase tracking-tighter mb-1">All Time</span>
                    <span className={`text-sm font-black font-paytone ${lpStats.all >= 0 ? 'text-mint' : 'text-coral'}`}>
                      {lpStats.all >= 0 ? '+' : ''}{lpStats.all}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={onFindGame}
                className="w-full bg-mint text-white py-5 rounded-[1.5rem] font-black text-xl font-paytone shadow-xl shadow-mint/30 hover:scale-[1.02] hover:shadow-mint/40 active:scale-95 transition-all relative overflow-hidden group"
              >
                <span className="relative z-10 uppercase">Search Match</span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 slant-glow"></div>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

