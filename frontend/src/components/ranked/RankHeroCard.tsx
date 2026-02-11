import { getRankColor, getRankTextColor, getRankImage } from "../../utils/rankUtils";

interface RankHeroCardProps {
  profile: {
    rank: string;
    total_lp: number;
    lp_in_division: number;
    placement_games_played: number;
    demotion_shield: number;
  };
  isPlacement: boolean;
  onShowLadder: () => void;
}

export default function RankHeroCard({ profile, isPlacement, onShowLadder }: RankHeroCardProps) {
  const rankImage = getRankImage(profile.rank);

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className="relative w-full max-w-[280px] aspect-[3/4] group cursor-pointer perspective-1000"
        onClick={() => !isPlacement && onShowLadder()}
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
  );
}
