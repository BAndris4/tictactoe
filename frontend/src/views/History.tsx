import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BackgroundShapes from "../components/BackgroundShapes";
import { getUserGames, type Game } from "../api/game";
import { useAuth } from "../hooks/useAuth";

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserGames()
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch match history", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F3F4FF] overflow-x-hidden text-deepblue font-inter flex flex-col items-center">
      <BackgroundShapes />

      {/* Container: Közepes méret, kényelmes olvasáshoz */}
      <div className="relative z-10 w-full max-w-4xl px-4 md:px-8 py-8 md:py-12 flex flex-col h-full animate-fadeScaleIn">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
            <button 
                onClick={() => navigate("/")}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-slate-100 text-deepblue/80 font-bold hover:bg-slate-50 hover:border-slate-200 transition-all duration-200 font-paytone text-sm shadow-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Dashboard
            </button>
            
            <h1 className="text-3xl font-black text-deepblue font-paytone tracking-tight">
                Match History
            </h1>
            
            <div className="w-[120px] hidden md:block"></div> {/* Spacer az igazításhoz */}
        </div>
        
        {/* Match List */}
        <div className="flex flex-col gap-4 pb-8">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white/50 rounded-3xl border border-white">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-deepblue rounded-full animate-spin mb-4" />
                    <span className="font-bold text-deepblue/40 uppercase tracking-wider text-sm">Loading Matches...</span>
                </div>
            ) : games.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white/50 rounded-3xl border border-white text-center p-6">
                    <span className="font-bold text-deepblue/40 uppercase tracking-wider text-lg mb-4">No matches found</span>
                    <button onClick={() => navigate("/")} className="px-6 py-2 bg-deepblue text-white rounded-xl font-bold font-paytone hover:opacity-90 transition-opacity">
                        Play Now
                    </button>
                </div>
            ) : (
                games.map((game, index) => {
                    const isPlayerX = user && String(game.player_x) === String(user.id);
                    const opponentName = isPlayerX ? (game.player_o_name || "Waiting...") : game.player_x_name;
                    
                    let result: 'WIN' | 'LOSS' | 'DRAW' | 'ABORTED' = 'DRAW';
                    if (game.status === 'aborted') {
                        result = 'ABORTED';
                    } else if (game.status === 'finished') {
                        if (game.winner === 'D') result = 'DRAW';
                        else if ((isPlayerX && game.winner === 'X') || (!isPlayerX && game.winner === 'O')) result = 'WIN';
                        else result = 'LOSS';
                    } else {
                        return null; 
                    }

                    const dateStr = new Date(game.created_at).toLocaleDateString("en-US", {
                        month: 'short',
                        day: 'numeric'
                    });

                    const xpGained = (isPlayerX ? game.player_x_xp_gained : game.player_o_xp_gained) || 0;
                    const lpChange = (isPlayerX ? game.player_x_lp_change : game.player_o_lp_change) || 0;

                    return (
                        <div 
                            key={game.id} 
                            onClick={() => navigate(`/game/${game.id}`)}
                            className="group relative w-full bg-white p-5 rounded-3xl shadow-sm hover:shadow-lg border border-slate-100 hover:border-slate-200 transition-all duration-200 cursor-pointer"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                
                                {/* Bal oldal: Ikon és Infó */}
                                <div className="flex items-center gap-5">
                                    {/* Eredmény Ikon - Egyszerű, tiszta színekkel */}
                                    <div className={`w-16 h-16 flex-shrink-0 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm ${
                                        result === 'WIN' ? 'bg-mint/10 text-mint' :
                                        result === 'LOSS' ? 'bg-coral/10 text-coral' :
                                        result === 'ABORTED' ? 'bg-slate-100 text-slate-400' :
                                        'bg-slate-100 text-slate-500'
                                    }`}>
                                        {result[0]}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-xl font-bold text-deepblue leading-tight group-hover:text-deepblue/80 transition-colors">
                                            {opponentName}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs font-semibold">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 text-deepblue/50 uppercase tracking-wider border border-slate-200">
                                                {game.mode}
                                            </span>
                                            <span className="text-slate-400">
                                                {dateStr}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Jobb oldal: Eredmény szöveg és Jutalmak */}
                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center pl-2 md:pl-0">
                                    
                                    {/* Eredmény Szöveg - Nincs italic, nincs gradient, csak tiszta bold */}
                                    <div className={`text-sm md:text-base font-black uppercase tracking-wider mb-1 ${
                                        result === 'WIN' ? 'text-mint' : 
                                        result === 'LOSS' ? 'text-coral' : 
                                        'text-slate-400'
                                    }`}>
                                        {result === 'WIN' ? 'Victory' : result === 'LOSS' ? 'Defeat' : result}
                                    </div>

                                    {/* Jutalmak - Tiszta kapszulák */}
                                    <div className="flex items-center gap-2">
                                        {/* XP */}
                                        {xpGained > 0 && (
                                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-100/50">
                                                <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider font-paytone">+XP</span>
                                                <span className="text-xs font-bold text-orange-600">{xpGained}</span>
                                            </div>
                                        )}
                                        
                                        {/* LP */}
                                        {game.mode === 'ranked' && lpChange !== 0 && (
                                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                                                lpChange > 0 
                                                ? "bg-mint/5 border-mint/20" 
                                                : "bg-coral/5 border-coral/20"
                                            }`}>
                                                <span className={`text-[10px] font-black uppercase tracking-wider font-paytone ${lpChange > 0 ? 'text-mint' : 'text-coral'}`}>LP</span>
                                                <span className={`text-xs font-bold ${lpChange > 0 ? 'text-mint' : 'text-coral'}`}>
                                                    {lpChange > 0 ? '+' : ''}{lpChange}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
      </div>
    </div>
  );
}
