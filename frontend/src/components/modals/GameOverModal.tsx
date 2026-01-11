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

  // Handle Rank Animation Sequence
  useEffect(() => {
    if (visible && myXpResult?.rank_info?.is_change) {
      setIsRankTransitioning(true);
      const timer = setTimeout(() => {
        setShowNewRank(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [visible, myXpResult]);

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
      subText = "Ranked Match Won";
      accentColor = "text-mint";
      bgGradient = "from-mint/10 to-transparent";
  } else if (isLoss) {
      titleText = "Defeat";
      subText = "Better Luck Next Time";
      accentColor = "text-coral";
      bgGradient = "from-coral/10 to-transparent";
  }

  const rankInfo = myXpResult?.rank_info;
  const rankToShow = rankInfo ? (showNewRank ? rankInfo.new_rank : rankInfo.old_rank) : null;
  const lpChange = myXpResult?.lp_change ?? 0;
  
  const isPromotion = rankInfo?.is_change && lpChange > 0;

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
          
          {/* Top Bar: Mini Icons & Close */}
          <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
              {/* Streak Badge */}
              {rankInfo && typeof rankInfo.streak !== 'undefined' && (
                  <div className="group relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 hover:scale-105 ${
                          rankInfo.streak > 0 ? "bg-sunshine/5 text-sunshine border-sunshine/20" : 
                          rankInfo.streak < 0 ? "bg-sky-400/5 text-sky-400 border-sky-400/20" : 
                          "bg-slate-100/50 text-slate-400 border-slate-200/50"
                      }`}>
                          {rankInfo.streak > 0 ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.66 11.2c-.23-.3-.51-.56-.83-.77-1.01-.67-1.1-1.26-1.1-1.73 0-.47.1-.92.25-1.33a.41.41 0 00-.02-.36.41.41 0 00-.31-.18c-.01 0-.01 0-.02 0-2.33.02-4.69 1.15-5.99 3.22-1.23 1.96-1.09 4.38.35 6.19a4.805 4.805 0 003.69 1.78c2.61 0 4.73-2.13 4.73-4.73 0-1.13-.39-2.17-1.05-2.99z" /></svg>
                          ) : rankInfo.streak < 0 ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                          )}
                      </div>
                      <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-deepblue text-white text-[10px] font-bold tracking-widest uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl">
                          {Math.abs(rankInfo.streak)} {rankInfo.streak > 0 ? "Win" : rankInfo.streak < 0 ? "Loss" : ""} Streak
                      </div>
                  </div>
              )}

              {/* Skill Badge */}
              {rankInfo && (
                  <div className="group relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 hover:scale-105 ${
                          rankInfo.performance_status === 'Climbing' ? "bg-mint/5 text-mint border-mint/20" : 
                          rankInfo.performance_status === 'High LP' ? "bg-sky-400/5 text-sky-400 border-sky-400/20" : 
                          "bg-slate-100/50 text-slate-400 border-slate-200/50"
                      }`}>
                         {rankInfo.performance_status === 'Climbing' ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 7.828V20h-2V7.828l-5.364 5.364-1.414-1.414L12 4l7.778 7.778-1.414 1.414L13 7.828z"/></svg>
                          ) : rankInfo.performance_status === 'High LP' ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                          ) : (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 13h14v-2H5v2z"/></svg>
                          )}
                      </div>
                      <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-deepblue text-white text-[10px] font-bold tracking-widest uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl">
                          {rankInfo.performance_status}
                      </div>
                  </div>
              )}

              {/* Close Button */}
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
              {/* Rank Display - The "Hero" Element */}
              {(game.mode === 'ranked' || rankInfo) && rankInfo && (
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

                    {/* LP Bar - Slimmer & Cleaner */}
                    <div className="w-full max-w-sm">
                        <LPProgressBar 
                            previousLp={rankInfo.old_lp_div}
                            newLp={rankInfo.new_lp_div}
                            lpChange={lpChange}
                            rank={rankToShow || "Unranked"}
                        />
                    </div>
                </div>
              )}

              {/* XP Display - Subtle Footer Card */}
              {myXpResult && (
                <div className="mt-6 bg-slate-50/80 rounded-2xl p-4 border border-slate-100/50">
                    <ProgressBar 
                        currentXp={myXpResult.current_xp} 
                        nextLevelXp={myXpResult.next_level_xp} 
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
