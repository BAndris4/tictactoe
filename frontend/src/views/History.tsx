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
    <div className="relative min-h-screen bg-[#F3F4FF] overflow-hidden text-deepblue font-inter flex flex-col items-center">
      <BackgroundShapes />

      <div className="relative z-10 w-full max-w-4xl px-4 md:px-8 py-8 md:py-12 flex flex-col h-full animate-fadeScaleIn">
        
        <div className="flex items-center justify-between mb-8">
            <button 
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-slate-100 text-deepblue font-bold hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm font-paytone"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back
            </button>
            <h1 className="text-3xl font-extrabold text-deepblue tracking-tight font-paytone">Match History</h1>
            <div className="w-[100px]"></div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-deepblue/5 border border-white overflow-hidden p-2">
            {loading ? (
                <div className="p-12 text-center text-deepblue/60 font-medium">Loading history...</div>
            ) : games.length === 0 ? (
                <div className="p-12 text-center text-deepblue/60 font-medium">No matches found yet. Play a game!</div>
            ) : (
                <div className="divide-y divide-slate-50">
                    {games.map((game) => {
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
                            // Active or waiting games in history? Might happen if we list all.
                            // Let's call them 'ACTIVE' for now if they aren't finished/aborted
                            return null; // Don't show active games in history for now, or maybe label them.
                        }

                        const dateStr = new Date(game.created_at).toLocaleDateString("en-US", {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });

                        return (
                            <div key={game.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-2xl group cursor-pointer" onClick={() => navigate(`/game/${game.id}`)}>
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm transition-transform group-hover:scale-110 ${
                                        result === 'WIN' ? 'bg-mint/10 text-mint' :
                                        result === 'LOSS' ? 'bg-coral/10 text-coral' :
                                        result === 'ABORTED' ? 'bg-slate-100 text-slate-400' :
                                        'bg-slate-100 text-slate-500'
                                    }`}>
                                        {result[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-deepblue text-lg mb-0.5">{opponentName}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-deepblue/60 uppercase tracking-wider">{game.mode}</span>
                                            <span className="text-xs text-deepblue/40 font-medium">{dateStr}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <div className={`text-xs font-bold uppercase tracking-widest ${
                                        result === 'WIN' ? 'text-mint' : 
                                        result === 'LOSS' ? 'text-coral' : 'text-deepblue/30'
                                    }`}>
                                        {result}
                                    </div>
                                    
                                    {/* XP Display */}
                                    {(game.player_x_xp_gained !== undefined && game.player_x_xp_gained !== null) && (
                                        <div className="mt-1 text-right">
                                            <span className={`text-xs font-bold ${
                                                (isPlayerX ? game.player_x_xp_gained : game.player_o_xp_gained) === 0 
                                                  ? "text-slate-400" 
                                                  : "text-sunshine"
                                            }`}>
                                                +{(isPlayerX ? game.player_x_xp_gained : game.player_o_xp_gained) || 0} XP
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
