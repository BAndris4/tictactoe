import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameResults } from "../../hooks/useGameResults";
import { useAuth } from "../../hooks/useAuth";
import ProgressBar from "../common/ProgressBar";
import LPProgressBar from "../common/LPProgressBar";
import { getRankImage, getRankTextColor } from "../../utils/rankUtils";

function GameOverModal() {
  const game = useGameResults();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Staged animation states
  const [showNewRank, setShowNewRank] = useState(false);
  const [isRankTransitioning, setIsRankTransitioning] = useState(false);

  // XP/Rank Result lookup for the current user
  const myXpResult = (user && game.xpResults) ? (game.xpResults[user.id] || game.xpResults[String(user.id)]) : null;
  
  // RANKED CHECK
  const isRankedGame = game.mode === 'ranked';

  useEffect(() => {
    if (game.status !== "finished") {
      setIsDismissed(false);
      setShowNewRank(false);
      setIsRankTransitioning(false);
    }
    
    // HISTORY GUARD
    if ((game.status === "finished" || game.winner) && myXpResult) {
      const timeout = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timeout);
    } else {
      setVisible(false);
    }
  }, [game.status, game.winner, myXpResult]);

  // Handle Rank Animation Sequence (Only if Ranked)
  useEffect(() => {
    if (visible && isRankedGame && myXpResult?.rank_info?.is_change) {
      setIsRankTransitioning(true);
      const timer = setTimeout(() => {
        setShowNewRank(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [visible, isRankedGame, myXpResult]);

  useEffect(() => {
    if (visible && !isDismissed) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
  }, [visible, isDismissed]);

  if ((!game.winner && game.status !== "finished") || !visible || isDismissed) return null;

  const handleExit = () => navigate("/");
  const handleClose = () => setIsDismissed(true);
  
  const isMe = user && (
      (game.winnerSymbol === 'X' && String(game.players.x) === String(user.id)) || 
      (game.winnerSymbol === 'O' && String(game.players.o) === String(user.id))
  );
  
  const isDraw = game.winnerSymbol === "D";
  const isLoss = !isMe && !isDraw && user;

  let accentColor = "text-deepblue";
  let bgGradient = "from-deepblue/5 to-transparent";
  let titleText = "GAME OVER";
  let subText = "Match Concluded";

  if (isDraw) {
      titleText = "It's a Draw";
      subText = "Well Played";
      accentColor = "text-slate-600";
      bgGradient = "from-slate-500/10 to-transparent";
  } else if (isMe) {
      titleText = "Victory";
      subText = isRankedGame ? "Ranked Match Won" : "Unranked Match Won";
      accentColor = "text-mint";
      bgGradient = "from-mint/10 to-transparent";
  } else if (isLoss) {
      titleText = "Defeat";
      subText = "Better Luck Next Time";
      accentColor = "text-coral";
      bgGradient = "from-coral/10 to-transparent";
  }

  const rankInfo = myXpResult?.rank_info;
  const rankToShow = (isRankedGame && rankInfo) ? (showNewRank ? rankInfo.new_rank : rankInfo.old_rank) : null;
  const lpChange = (isRankedGame && myXpResult?.lp_change) ? myXpResult.lp_change : 0;
  
  const isPromotion = isRankedGame && rankInfo?.is_change && lpChange > 0;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center 
        bg-deepblue/30 backdrop-blur-md
        transition-opacity duration-500 ease-out p-4
        ${mounted ? "opacity-100" : "opacity-0"}
      `}
    >
      <div className="relative max-w-2xl w-full animate-fadeScaleIn">
        <div
          className={`
            relative rounded-[3rem] bg-white/90 backdrop-blur-3xl 
            shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50
            p-8 overflow-hidden
            transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)
            ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}
          `}
        >
          {/* Subtle Background Ambient Light */}
          <div className={`absolute top-0 left-0 right-0 h-64 bg-gradient-to-b ${bgGradient} opacity-50 pointer-events-none`} />
          
          {/* Top Bar: Close Button */}
          <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
              {/* Close Button is enough here, removed Performance Status and Streak as requested */}
              <button 
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-deepblue hover:bg-slate-100 transition-all flex items-center justify-center active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
          </div>

          {/* Centered Header */}
          <div className="flex flex-col items-center justify-center mb-8 mt-2 relative z-0">
             <div className={`text-4xl font-paytone tracking-tight ${accentColor} transition-colors duration-700 drop-shadow-sm`}>
                 {titleText}
             </div>
             <div className="flex items-center gap-2 mt-1">
                 <div className={`h-[1px] w-8 ${isMe ? 'bg-mint/30' : isLoss ? 'bg-coral/30' : 'bg-slate-300'}`}></div>
                 <p className="text-deepblue/40 font-bold tracking-widest text-[10px] uppercase">{subText}</p>
                 <div className={`h-[1px] w-8 ${isMe ? 'bg-mint/30' : isLoss ? 'bg-coral/30' : 'bg-slate-300'}`}></div>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-4 mb-8">
              {/* Rank Display - The "Hero" Element - ONLY IF RANKED */}
              {isRankedGame && rankInfo && (
                <div className="flex flex-col items-center">
                    {/* Floating Rank Image */}
                    <div className="relative mb-2">
                         {/* Glow effect behind the image */}
                         <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-2xl opacity-20 ${
                             isPromotion ? 'bg-mint' : 'bg-deepblue'
                         }`}></div>
                         
                         <img 
                            src={getRankImage(rankToShow || "Unranked")} 
                            alt={rankToShow || "Rank"} 
                            className={`relative w-28 h-28 object-contain drop-shadow-2xl transition-all duration-700 ${
                                isRankTransitioning && !showNewRank ? 'animate-pulse scale-105 opacity-80' : 
                                showNewRank ? 'animate-[bounce_0.6s_cubic-bezier(0.34,1.56,0.64,1)]' : ''
                            }`}
                        />
                        
                        {/* Promotion Indicator */}
                        {rankInfo.is_change && showNewRank && (
                            <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg animate-fadeInUp ${
                                isPromotion ? 'bg-mint' : 'bg-coral'
                            }`}>
                                {isPromotion ? 'Promoted' : 'Demoted'}
                            </div>
                        )}
                    </div>

                    <div className="text-center mb-4">
                        <h3 className={`text-2xl font-black text-deepblue leading-none mb-1 ${getRankTextColor(rankToShow || "")}`}>
                            {rankToShow}
                        </h3>
                        <p className="text-deepblue/30 text-[10px] font-bold uppercase tracking-widest">Current Season Rank</p>
                    </div>

                    <div className="w-full max-w-sm flex flex-col items-center gap-3">
                        <LPProgressBar 
                            previousLp={rankInfo.old_lp_div}
                            newLp={rankInfo.new_lp_div}
                            lpChange={lpChange}
                            rank={rankToShow || "Unranked"}
                        />
                        
                        {/* Shield & Streak Context Labels */}
                        <div className="flex flex-col items-center gap-2">
                            {rankInfo.shield > 0 && (
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex gap-1 bg-red-50 px-3 py-1 rounded-full border border-red-100 animate-pulse">
                                        <div className="flex gap-0.5 items-center mr-1">
                                            {[...Array(3)].map((_, i) => (
                                                <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 ${i < rankInfo.shield ? 'text-red-500' : 'text-red-200'}`}>
                                                    <path fillRule="evenodd" d="M10.338 1.59a.75.75 0 00-.676 0l-6.25 3a.75.75 0 00-.362.648v5.5c0 3.03 1.906 5.757 4.661 6.84a.75.75 0 00.578 0c2.755-1.083 4.661-3.81 4.661-6.84v-5.5a.75.75 0 00-.362-.648l-6.25-3zM10 3.178l4.75 2.28v4.792c0 2.21-1.385 4.198-3.374 4.98a.75.75 0 00-.022.007L10 15.792l-.354-.555a.75.75 0 00-.022-.007c-1.99-.782-3.374-2.77-3.374-4.98V5.458L10 3.178z" clipRule="evenodd" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">Shield Protected</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-tighter">No LP reduction for shield active</span>
                                </div>
                            )}

                            {rankInfo.placement_games <= 10 && (
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                    Placement Phase: {rankInfo.placement_games}/10
                                </span>
                            )}

                            {rankInfo.streak >= 3 && lpChange > 0 && (
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 animate-bounce">
                                        <span className="text-sm">🔥</span>
                                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider">Hot Streak Bonus</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-orange-400 uppercase tracking-tighter">Earning bonus LP while on Hot Streak!</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              )}

              {/* XP Display - Subtle Footer Card - Always Visible */}
              {myXpResult && (
                <div className="mt-6 bg-slate-50/80 rounded-2xl p-4 border border-slate-100/50">
                    <ProgressBar 
                        currentXp={myXpResult.new_xp} 
                        nextLevelXp={myXpResult.xp_to_next_level} 
                        xpGained={myXpResult.xp_gained}
                        level={myXpResult.new_level}
                        leveledUp={myXpResult.leveled_up}
                    />
                </div>
              )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
              <button
                onClick={handleExit}
                className="
                  flex-1 py-3.5 rounded-2xl
                  bg-deepblue text-white font-paytone text-sm tracking-wider
                  shadow-lg shadow-deepblue/20
                  hover:bg-deepblue/90 hover:-translate-y-0.5 hover:shadow-deepblue/30
                  active:translate-y-0 active:scale-95
                  transition-all duration-300
                  flex items-center justify-center gap-2
                "
              >
                <span>Dashboard</span>
                <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
              <button
                onClick={handleClose}
                className="
                  px-6 py-3.5 rounded-2xl
                  bg-white text-deepblue/60 font-black text-[10px] uppercase tracking-widest
                  border border-slate-200 hover:bg-slate-50 hover:text-deepblue hover:border-slate-300
                  transition-all duration-300
                "
              >
                View Board
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameOverModal;
