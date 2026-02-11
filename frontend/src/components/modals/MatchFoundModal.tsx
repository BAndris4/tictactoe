import { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../hooks/useAuth";
import UserAvatar from "../common/UserAvatar";

export default function MatchFoundModal() {
  const { matchFoundData, setMatchFoundData } = useGame();
  const { user } = useAuth();
  const [stage, setStage] = useState<'revealing' | 'countdown' | 'exiting'>('revealing');
  const [countdown, setCountdown] = useState(3);
  const [slotSymbol, setSlotSymbol] = useState<'X' | 'O'>('X');
  const [isSpinning, setIsSpinning] = useState(true);

  useEffect(() => {
    if (matchFoundData) {
      setStage('revealing');
      setIsSpinning(true);
      
      // Slot machine effect
      let spins = 0;
      const interval = setInterval(() => {
        setSlotSymbol(prev => prev === 'X' ? 'O' : 'X');
        spins++;
        if (spins > 20) {
          clearInterval(interval);
          setSlotSymbol(matchFoundData.mySymbol || 'X');
          setIsSpinning(false);
          
          // Start countdown after reveal
          setTimeout(() => {
            setStage('countdown');
          }, 1000);
        }
      }, 80);

      return () => clearInterval(interval);
    }
  }, [matchFoundData]);

  useEffect(() => {
    if (stage === 'countdown' && matchFoundData) {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStage('exiting');
            setTimeout(() => {
                const gid = matchFoundData.gameId;
                setMatchFoundData(null);
                window.location.href = `/game/${gid}?t=${Date.now()}`;
            }, 600);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage, matchFoundData]);

  if (!matchFoundData) return null;

  return (
    <div className={`
        fixed inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-xl p-4 transition-all duration-700
        ${stage === 'exiting' ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}
        animate-fadeIn
    `}>
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100 rounded-full blur-[140px] animate-pulse [animation-delay:1s]" />
      </div>

      <div className={`
        relative w-full max-w-4xl bg-white/80 backdrop-blur-2xl rounded-[3.5rem] border-8 border-white shadow-[0_20px_100px_rgba(0,0,0,0.1)] p-8 md:p-14 flex flex-col items-center overflow-hidden
        animate-elegantEntrance
      `}>
        
        {/* Status Header */}
        <div className="relative z-10 mb-14 flex flex-col items-center">
            <div className="px-5 py-2 bg-red-50 border border-red-100 rounded-full mb-5 shadow-sm">
                <span className="text-coral text-xs font-black uppercase tracking-[0.25em]">Preparation Complete</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-deepblue font-paytone tracking-tight uppercase text-center drop-shadow-sm">
                Match Found
            </h1>
        </div>

        {/* Players Area */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 w-full mb-14">
          
          {/* User Profile */}
          <div className="flex flex-col items-center gap-5 animate-slideInLeft [animation-delay:0.1s]">
            <div className={`
                relative p-1.5 rounded-full shadow-2xl transition-all duration-500
                ${!isSpinning && slotSymbol === 'X' ? 'bg-gradient-to-tr from-coral to-red-400 scale-110' : ''}
                ${!isSpinning && slotSymbol === 'O' ? 'bg-gradient-to-tr from-sunshine to-yellow-400 scale-110' : ''}
                ${isSpinning ? 'bg-slate-100' : ''}
                ${!isSpinning && slotSymbol !== 'X' && slotSymbol !== 'O' ? 'bg-slate-100' : ''}
            `}>
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white overflow-hidden bg-white">
                    <UserAvatar 
                        username={user?.username}
                        avatarConfig={(user as any)?.profile?.avatar_config} 
                        size="100%"
                    />
                </div>
                {!isSpinning && (
                    <div className={`
                        absolute -top-1 -right-1 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg animate-popIn border-4
                        ${slotSymbol === 'X' ? 'border-coral' : 'border-sunshine'}
                    `}>
                        <span className={`text-2xl font-black font-paytone ${slotSymbol === 'X' ? 'text-coral' : 'text-sunshine'}`}>{slotSymbol}</span>
                    </div>
                )}
            </div>
            <span className="text-2xl font-black text-deepblue font-paytone tracking-wide uppercase">{user?.username}</span>
          </div>

          {/* Slot Machine Reveal */}
          <div className="relative flex items-center justify-center group">
              <div className={`
                  relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] flex items-center justify-center overflow-hidden
                  bg-slate-50 border-4 border-white shadow-[inset_0_2px_15px_rgba(0,0,0,0.05)]
                  ${isSpinning ? 'animate-pulse' : 'border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'}
              `}>
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-200/50 via-transparent to-slate-200/50 z-10" />
                  
                  <div className={`
                      flex flex-col items-center transition-transform duration-300
                      ${isSpinning ? 'animate-slotSpin' : ''}
                  `}>
                      <span className={`text-7xl md:text-9xl font-black font-paytone ${slotSymbol === 'X' ? 'text-coral' : 'text-sunshine'} drop-shadow-sm`}>
                          {slotSymbol}
                      </span>
                  </div>
              </div>

              {/* VS Pill */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 px-8 py-2 bg-deepblue rounded-full shadow-xl border-4 border-white">
                  <span className="text-2xl font-black text-white italic font-paytone">VS</span>
              </div>
          </div>

          {/* Opponent Profile */}
          <div className="flex flex-col items-center gap-5 animate-slideInRight [animation-delay:0.2s]">
            <div className={`
                relative p-1.5 rounded-full shadow-2xl transition-all duration-500
                ${!isSpinning && slotSymbol === 'O' ? 'bg-gradient-to-tr from-coral to-red-400 scale-110' : ''}
                ${!isSpinning && slotSymbol === 'X' ? 'bg-gradient-to-tr from-sunshine to-yellow-400 scale-110' : ''}
                ${isSpinning ? 'bg-slate-100' : ''}
            `}>
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white overflow-hidden bg-white">
                    <UserAvatar 
                        username={matchFoundData.opponentUsername || "?"}
                        avatarConfig={matchFoundData.opponentAvatar}
                        size="100%"
                    />
                </div>
                {!isSpinning && (
                    <div className={`
                        absolute -top-1 -right-1 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg animate-popIn border-4
                        ${slotSymbol === 'X' ? 'border-sunshine' : 'border-coral'}
                    `}>
                        <span className={`text-2xl font-black font-paytone ${slotSymbol === 'X' ? 'text-sunshine' : 'text-coral'}`}>
                            {slotSymbol === 'X' ? 'O' : 'X'}
                        </span>
                    </div>
                )}
            </div>
            <span className="text-2xl font-black text-deepblue font-paytone tracking-wide uppercase line-clamp-1 max-w-[180px]">
                {matchFoundData.opponentUsername || matchFoundData.opponent}
            </span>
          </div>
        </div>

        {/* Footer Countdown */}
        <div className="relative z-10 w-full max-w-sm text-center">
            {stage === 'revealing' ? (
                <div className="flex items-center justify-center gap-3">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0s]" />
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
            ) : (
                <div className="space-y-6 animate-fadeInUp">
                    <p className="text-coral font-black text-3xl uppercase font-paytone tracking-tight animate-bounce-slow">Engaging Target!</p>
                    <div className="bg-slate-50 border-4 border-white rounded-[2rem] p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-2 px-1">
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Battle Synchronizing</span>
                             <span className="text-deepblue font-black font-paytone">{countdown}s</span>
                        </div>
                        <div className="h-4 w-full bg-slate-200/50 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-coral to-sunshine transition-all duration-1000"
                                style={{ width: `${(countdown / 3) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
