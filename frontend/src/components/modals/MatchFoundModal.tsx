import { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../hooks/useAuth";

export default function MatchFoundModal() {
  const { matchFoundData } = useGame();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (matchFoundData) {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = `/game/${matchFoundData.gameId}`;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [matchFoundData]);

  if (!matchFoundData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-deepblue/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl p-12 md:p-16 flex flex-col items-center justify-center overflow-hidden border-4 border-white/50 animate-elegantEntrance">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-mint/10 rounded-full blur-[80px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-coral/10 rounded-full blur-[80px] animate-pulse [animation-delay:1s]" />
        </div>

        {/* Header */}
        <h1 className="relative z-10 text-5xl md:text-7xl font-black text-deepblue font-paytone tracking-wider uppercase mb-16 drop-shadow-sm">
          Match Found
        </h1>

        {/* Players Area */}
        <div className="relative z-10 flex items-center justify-center gap-12 md:gap-24 w-full mb-16">
          
          {/* Player 1 (Me) */}
          <div className="group flex flex-col items-center gap-6 animate-slideInLeft opacity-0 [animation-fill-mode:forwards] [animation-delay:0.2s]">
            <div className="relative">
                <div className="absolute inset-0 bg-mint rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-mint to-teal-500 p-1.5 shadow-xl animate-float">
                   <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-5xl font-black text-mint">
                      {user?.username?.[0]?.toUpperCase()}
                   </div>
                </div>
            </div>
            <div className="text-3xl font-black text-deepblue font-paytone tracking-wide">
              {user?.username}
            </div>
          </div>

          {/* VS - Pulsing Core */}
          <div className="relative animate-zoomIn opacity-0 [animation-fill-mode:forwards] [animation-delay:0.6s]">
             <div className="relative z-10 w-24 h-24 flex items-center justify-center bg-deepblue rounded-full shadow-xl border-4 border-white">
                <span className="text-4xl font-black text-white font-paytone italic pt-1 pr-1">VS</span>
             </div>
             {/* Ripple Effects behind VS */}
             <div className="absolute inset-0 bg-deepblue rounded-full animate-ping opacity-20 [animation-duration:2s]" />
             <div className="absolute inset-0 bg-deepblue rounded-full animate-ping opacity-20 [animation-duration:2s] [animation-delay:0.5s]" />
          </div>

          {/* Player 2 (Opponent) */}
          <div className="group flex flex-col items-center gap-6 animate-slideInRight opacity-0 [animation-fill-mode:forwards] [animation-delay:0.4s]">
            <div className="relative">
                <div className="absolute inset-0 bg-coral rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-coral to-rose-500 p-1.5 shadow-xl animate-float [animation-delay:1.5s]">
                   <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-5xl font-black text-coral">
                      {matchFoundData.opponentUsername?.[0]?.toUpperCase() || "?"}
                   </div>
                </div>
            </div>
            <div className="text-3xl font-black text-deepblue font-paytone tracking-wide">
              {matchFoundData.opponentUsername || matchFoundData.opponent}
            </div>
          </div>
        </div>

        {/* Progress / Status */}
        <div className="relative z-10 w-full max-w-lg mt-4">
             <div className="flex justify-between text-slate-400 font-bold font-inter text-sm uppercase tracking-widest mb-2 px-1">
                 <span>Preparing Battleground</span>
                 <span>{countdown}s</span>
             </div>
             <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-mint to-coral animate-progressFill" />
             </div>
        </div>

      </div>
    </div>
  );
}
