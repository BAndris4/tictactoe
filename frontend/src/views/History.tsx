import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BackgroundShapes from "../components/BackgroundShapes";
import { getUserGames, type Game } from "../api/game";
import { useAuth } from "../hooks/useAuth";
import UserAvatar from "../components/common/UserAvatar";

const ITEMS_PER_PAGE = 10;

type FilterMode = 'all' | 'ranked' | 'casual' | 'bot';

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Pagination
  const [activeFilter, setActiveFilter] = useState<FilterMode>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch games when page or filter changes
  useEffect(() => {
    setLoading(true);
    getUserGames(page, activeFilter)
      .then((data) => {
        setGames(data.results);
        setTotalPages(Math.ceil(data.count / ITEMS_PER_PAGE));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch match history", err);
        setGames([]);
        setLoading(false);
      });
  }, [page, activeFilter]);

  // Reset page when filter changes
  const handleFilterChange = (mode: FilterMode) => {
      if (mode === activeFilter) return;
      setActiveFilter(mode);
      setPage(1);
  };

  return (
    <div className="relative min-h-screen bg-[#F3F4FF] overflow-x-hidden text-deepblue font-inter flex flex-col items-center">
      <BackgroundShapes />

      <div className="relative z-10 w-full max-w-5xl px-4 md:px-8 py-8 md:py-12 flex flex-col h-full animate-fadeScaleIn">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate("/")}
                    className="p-3 rounded-xl bg-white border-2 border-slate-100 text-deepblue/60 hover:text-deepblue hover:border-slate-200 transition-all shadow-sm active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>
                
                <div>
                    <h1 className="text-3xl font-black text-deepblue font-paytone tracking-tight leading-none">
                        Match History
                    </h1>
                    <p className="text-deepblue/50 font-bold text-sm mt-1">Your journey so far</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm overflow-x-auto">
                <FilterTab label="All" active={activeFilter === 'all'} onClick={() => handleFilterChange('all')} />
                <FilterTab label="Ranked" active={activeFilter === 'ranked'} onClick={() => handleFilterChange('ranked')} />
                <FilterTab label="Casual" active={activeFilter === 'casual'} onClick={() => handleFilterChange('casual')} />
                <FilterTab label="Bot" active={activeFilter === 'bot'} onClick={() => handleFilterChange('bot')} />
            </div>
        </div>
        
        {/* Match List */}
        <div className="flex flex-col gap-4 min-h-[500px]">
            {loading ? (
                <div className="flex flex-col items-center justify-center flex-1 bg-white/30 rounded-[2.5rem] border-2 border-dashed border-white/50">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-deepblue rounded-full animate-spin mb-4" />
                    <span className="font-bold text-deepblue/40 uppercase tracking-wider text-sm animate-pulse">Loading Matches...</span>
                </div>
            ) : games.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 bg-white/30 rounded-[2.5rem] border-2 border-white/50 text-center p-8">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-deepblue/20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <span className="font-black text-deepblue/40 text-xl font-paytone mb-2">No matches found</span>
                    <p className="text-deepblue/40 font-medium max-w-xs mx-auto mb-6">
                        {activeFilter === 'all' 
                            ? "You haven't played any games yet. Start your journey today!" 
                            : `You haven't played any ${activeFilter} games yet.`}
                    </p>
                    <button onClick={() => navigate("/")} className="px-8 py-3 bg-deepblue text-white rounded-2xl font-bold font-paytone hover:bg-deepblue/90 hover:-translate-y-1 transition-all shadow-lg shadow-deepblue/20">
                        Play Now
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {games.map((game, index) => (
                        <div 
                            key={game.id} 
                            className="animate-fadeInUp"
                            style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
                        >
                            <MatchCard game={game} user={user} navigate={navigate} />
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Pagination Controls - Only show if necessary */}
        {(totalPages > 1 || page > 1) && (
             <div className="mt-8 flex items-center justify-center gap-4">
                 <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-deepblue hover:-translate-x-1"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                 </button>
                 
                 <div className="bg-white/80 backdrop-blur px-6 py-3 rounded-xl shadow-sm border border-slate-100 font-bold text-deepblue font-paytone text-sm">
                     Page {page} <span className="text-deepblue/30 mx-1">/</span> {totalPages}
                 </div>

                 <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || loading}
                    className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-deepblue hover:translate-x-1"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                 </button>
             </div>
        )}
      </div>
    </div>
  );
}

function FilterTab({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
                px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap relative overflow-hidden group
                ${active 
                    ? 'text-white shadow-lg shadow-deepblue/20' 
                    : 'text-deepblue/50 hover:bg-slate-50 hover:text-deepblue'}
            `}
        >
            {active && (
                <div className="absolute inset-0 bg-deepblue animate-fadeIn" />
            )}
            <span className="relative z-10">{label}</span>
        </button>
    );
}

function MatchCard({ game, user, navigate }: { game: Game, user: any, navigate: any }) {
    const isPlayerX = user && String(game.player_x) === String(user.id);
    const opponentName = isPlayerX ? (game.player_o_name || "Waiting...") : game.player_x_name;
    const opponentAvatar = isPlayerX ? game.player_o_avatar : game.player_x_avatar;
    
    let result: 'WIN' | 'LOSS' | 'DRAW' | 'ABORTED' = 'DRAW';
    let cardStyle = "border-slate-100";
    let glowStyle = "group-hover:translate-x-[-100%]";
    let statusTextColor = "text-slate-400";
    let statusBg = "bg-slate-100";

    if (game.status === 'aborted') {
        result = 'ABORTED';
    } else if (game.status === 'finished') {
        if (game.winner === 'D') {
            result = 'DRAW';
            statusTextColor = "text-slate-500";
            statusBg = "bg-slate-100";
            cardStyle = "border-slate-200";
        }
        else if ((isPlayerX && game.winner === 'X') || (!isPlayerX && game.winner === 'O')) {
            result = 'WIN';
            statusTextColor = "text-mint";
            statusBg = "bg-mint/10 border border-mint/20 shadow-lg shadow-mint/10";
            cardStyle = "border-mint/30 bg-mint/[0.02]";
            glowStyle = "bg-gradient-to-r from-transparent via-mint/10 to-transparent";
        }
        else {
            result = 'LOSS';
            statusTextColor = "text-coral";
            statusBg = "bg-coral/10 border border-coral/20 shadow-lg shadow-coral/10";
            cardStyle = "border-coral/30 bg-coral/[0.02]";
            glowStyle = "bg-gradient-to-r from-transparent via-coral/10 to-transparent";
        }
    } else {
        return null; 
    }

    const dateStr = new Date(game.created_at).toLocaleDateString("en-US", {
        month: 'short',
        day: 'numeric'
    });
    
    const timeStr = new Date(game.created_at).toLocaleTimeString("en-US", {
        hour: '2-digit',
        minute: '2-digit'
    });

    const xpGained = (isPlayerX ? game.player_x_xp_gained : game.player_o_xp_gained) || 0;
    const lpChange = (isPlayerX ? game.player_x_lp_change : game.player_o_lp_change) || 0;

    const isRanked = game.mode === 'ranked';
    const isBot = game.mode.startsWith('bot') || game.mode === 'ai';

    return (
        <div 
            onClick={() => navigate(`/game/${game.id}`)}
            className={`
                group relative w-full bg-white p-2 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden border
                ${cardStyle}
            `}
        >
             {/* Dynamic Glow Effect */}
             <div className={`absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ${glowStyle} pointer-events-none z-0`} />

             <div className="flex flex-col md:flex-row items-center gap-4 relative z-10 p-3 pl-4">
                 
                 {/* Avatar Section */}
                 <div className="flex items-center gap-5 flex-1 w-full">
                     <div className="relative shrink-0">
                         <div className="w-16 h-16 rounded-2xl bg-slate-50 border-[3px] border-white shadow-md overflow-hidden ring-1 ring-black/5 group-hover:scale-105 transition-transform duration-300">
                             {opponentName === "Waiting..." ? (
                                 <div className="w-full h-full flex items-center justify-center text-deepblue/20 text-xl font-black">?</div>
                             ) : (
                                <UserAvatar avatarConfig={opponentAvatar} size="100%" /> 
                             )}
                         </div>
                         
                         {/* Mode Badge intersecting avatar */}
                        <div className={`
                             absolute -bottom-2 -right-3 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 border-white shadow-sm
                             ${isRanked ? 'bg-deepblue text-white' : 
                               isBot ? 'bg-indigo-500 text-white' : 
                               'bg-slate-200 text-slate-500'}
                        `}>
                             {isRanked ? 'Ranked' : isBot ? 'Bot' : 'Casual'}
                        </div>
                     </div>
                     
                     <div className="flex flex-col">
                         <h3 className="text-xl font-black text-deepblue leading-none group-hover:text-deepblue/80 transition-colors">
                             {opponentName}
                         </h3>
                         <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-bold text-deepblue/30 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                                {dateStr}
                            </span>
                            <span className="text-[10px] font-bold text-deepblue/20">
                                {timeStr}
                            </span>
                         </div>
                     </div>
                 </div>

                 {/* Results & Rewards Section */}
                 <div className="flex flex-col md:flex-row items-end md:items-center gap-4 md:gap-8 w-full md:w-auto mt-4 md:mt-0 pl-4 border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                     
                     {/* Rewards Breakdown */}
                     <div className="flex items-center gap-6">
                         {xpGained > 0 && (
                            <div className="flex flex-col items-center group/xp">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover/xp:text-orange-300 transition-colors">Experience</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-orange-400 font-paytone leading-none drop-shadow-sm">+{xpGained}</span>
                                    <span className="text-[10px] font-bold text-orange-300">XP</span>
                                </div>
                            </div>
                         )}
                         
                         {lpChange !== 0 ? (
                            <div className="relative flex flex-col items-center group/lp">
                                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${lpChange > 0 ? 'text-slate-300 group-hover/lp:text-mint/60' : 'text-slate-300 group-hover/lp:text-coral/60'}`}>
                                    Ranked LP
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-xl font-black font-paytone leading-none drop-shadow-sm ${lpChange > 0 ? 'text-mint' : 'text-coral'}`}>
                                        {lpChange > 0 ? '+' : ''}{lpChange}
                                    </span>
                                    <span className={`text-[10px] font-bold ${lpChange > 0 ? 'text-mint/60' : 'text-coral/60'}`}>LP</span>
                                </div>
                            </div>
                         ) : isRanked && (
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</span>
                                <span className="text-sm font-black text-indigo-400 font-paytone uppercase tracking-wider">Placement</span>
                            </div>
                         )}
                     </div>
                     
                     {/* Status Pill */}
                     <div className={`
                         px-6 py-3 rounded-2xl font-black font-paytone text-xl uppercase tracking-wider flex items-center gap-2 transition-all duration-300 group-hover:scale-105 shadow-sm
                         ${statusBg} ${statusTextColor}
                     `}>
                         {result === 'WIN' ? 'Victory' : result === 'LOSS' ? 'Defeat' : result}
                     </div>
                 </div>

             </div>
        </div>
    );
}
