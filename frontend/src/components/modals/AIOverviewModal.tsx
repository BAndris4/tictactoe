import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGame } from "../../api/game";

interface AIOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Difficulty = 'easy' | 'normal' | 'hard' | 'custom';

// MOCK DATA - In real app, this would come from API/Context
const BOT_DATA = {
    easy: {
        id: 'easy',
        name: "Tiny Bot",
        icon: "🐣",
        color: "text-mint",
        bgWithOpacity: "bg-mint/10",
        border: "border-mint/20",
        description: "Perfect for beginners. Tiny Bot moves randomly and makes frequent mistakes.",
        stats: { wins: 12, losses: 0, winRate: 100 }
    },
    normal: {
        id: 'normal',
        name: "Beta Unit",
        icon: "🤖",
        color: "text-blue-500",
        bgWithOpacity: "bg-blue-500/10",
        border: "border-blue-500/20",
        description: "A balanced opponent. Beta Unit thinks ahead but leaves openings.",
        stats: { wins: 5, losses: 8, winRate: 38 }
    },
    hard: {
        id: 'hard',
        name: "Omega AI",
        icon: "👿",
        color: "text-coral",
        bgWithOpacity: "bg-coral/10",
        border: "border-coral/20",
        description: "The ultimate challenge. Omega calculates deep into the future. No mercy.",
        stats: { wins: 0, losses: 24, winRate: 0 }
    },
    custom: {
        id: 'custom',
        name: "Custom Bot",
        icon: "⚙️",
        color: "text-deepblue",
        bgWithOpacity: "bg-deepblue/5",
        border: "border-deepblue/10",
        description: "Configure your opponent's parameters to creating a unique training scenario.",
        stats: { wins: 0, losses: 0, winRate: 0 }
    }
};

export default function AIOverviewModal({ isOpen, onClose }: AIOverviewModalProps) {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');
  const activeBot = BOT_DATA[selectedDifficulty];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative bg-[#F3F4FF] w-full max-w-5xl h-[90vh] max-h-[700px] rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeScaleIn border-[8px] border-white flex flex-col">
        
        {/* Decorative Background */}
        <div className={`absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-colors duration-700 ${selectedDifficulty === 'easy' ? 'bg-mint/10' : selectedDifficulty === 'normal' ? 'bg-blue-500/10' : selectedDifficulty === 'hard' ? 'bg-coral/10' : 'bg-slate-500/10'}`}></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-deepblue/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 bg-white rounded-full shadow-sm text-deepblue/30 hover:text-coral transition-all hover:rotate-90 hover:scale-110 active:scale-90">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="flex-1 p-6 relative z-10 flex flex-col min-h-0">
            
            {/* Header */}
            <div className="flex-shrink-0 mb-6 flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-black font-paytone text-deepblue uppercase tracking-tight leading-none">
                        Training Arena
                    </h2>
                    <p className="text-[10px] font-bold text-deepblue/40 uppercase tracking-widest mt-0.5">
                        Sharpen your skills
                    </p>
                </div>
            </div>

            {/* Main Content - Split View */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
                
                {/* LEFT COLUMN: Bot Preview (5 Cols) */}
                <div className="md:col-span-5 flex flex-col min-h-0">
                    <div className="flex-1 relative group cursor-default h-full min-h-0">
                        {/* Dynamic Background Card */}
                        <div className="absolute inset-0 bg-white rounded-[2rem] shadow-lg border-4 border-white overflow-hidden transition-all duration-500">
                             <div className={`absolute inset-0 opacity-10 ${activeBot.bgWithOpacity} transition-colors duration-500 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]`}></div>
                             <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-deepblue/5 to-transparent"></div>
                        </div>

                        {/* Content */}
                        <div className="relative h-full flex flex-col items-center p-6 z-10 overflow-y-auto scrollbar-hide">
                            
                            <div className="w-full flex justify-between items-center mb-4 flex-shrink-0">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white/50 backdrop-blur-sm ${activeBot.color}`}>
                                    {selectedDifficulty}
                                </span>
                                {selectedDifficulty === 'hard' && <span className="text-xl">🔥</span>}
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center relative w-full min-h-[160px]">
                                {/* Glow Effect */}
                                <div className={`absolute inset-0 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${activeBot.bgWithOpacity}`}></div>
                                
                                <div className="text-[100px] leading-none drop-shadow-2xl transform transition-transform duration-500 group-hover:scale-110 motion-safe:animate-bounce-slow">
                                    {activeBot.icon}
                                </div>
                                
                                <h3 className={`text-3xl font-black font-paytone text-center mt-4 uppercase tracking-tight ${activeBot.color}`}>
                                    {activeBot.name}
                                </h3>
                            </div>

                            <div className="w-full bg-white/60 backdrop-blur-md rounded-xl p-3 text-center border border-white/50 shadow-sm mt-4 flex-shrink-0">
                                <p className="text-[11px] font-medium text-deepblue/70 leading-relaxed">
                                    "{activeBot.description}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Selection & Actions (7 Cols) */}
                <div className="md:col-span-7 flex flex-col gap-4 min-h-0">
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3 flex-shrink-0">
                        {[
                            { label: "vs " + activeBot.name, value: `${activeBot.stats.wins} - ${activeBot.stats.losses}`, color: 'text-deepblue' },
                            { label: "Win Rate", value: activeBot.stats.winRate + "%", color: activeBot.stats.winRate >= 50 ? 'text-mint' : 'text-coral' },
                            { label: "Status", value: "READY", color: 'text-deepblue/60' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-3 rounded-2xl border border-slate-50 shadow-sm flex flex-col items-center justify-center">
                                 <span className="text-[9px] font-black text-deepblue/30 uppercase tracking-tighter mb-0.5">{stat.label}</span>
                                 <span className={`text-base font-black font-paytone ${stat.color}`}>{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Difficulty List */}
                    <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 min-h-0">
                        {(['easy', 'normal', 'hard', 'custom'] as Difficulty[]).map((diff) => {
                            const bot = BOT_DATA[diff];
                            const isSelected = selectedDifficulty === diff;
                            return (
                                <button
                                    key={diff}
                                    onClick={() => setSelectedDifficulty(diff)}
                                    className={`
                                        w-full p-2.5 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 group relative overflow-hidden flex-shrink-0
                                        ${isSelected 
                                            ? 'bg-white border-deepblue shadow-sm' 
                                            : 'bg-white/50 border-transparent hover:bg-white hover:border-slate-100'
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-transform duration-300 flex-shrink-0
                                        ${isSelected ? 'scale-110 rotate-3' : 'group-hover:scale-110'}
                                        ${bot.bgWithOpacity}
                                    `}>
                                        {bot.icon}
                                    </div>
                                    <div className="flex-1 text-left z-10">
                                        <h4 className={`font-black font-paytone uppercase text-sm ${isSelected ? 'text-deepblue' : 'text-deepblue/60'}`}>
                                            {bot.name}
                                        </h4>
                                        <p className="text-[9px] font-bold text-deepblue/30 uppercase tracking-wider">
                                            {diff}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="text-deepblue animate-pulse mx-2">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Action Button */}
                    <button 
                        onClick={async () => {
                            try {
                                let mode: any = 'bot_easy';
                                if (selectedDifficulty === 'normal') {
                                    mode = 'bot_medium';
                                } else if (selectedDifficulty === 'hard') {
                                    mode = 'bot_hard';
                                }
                                
                                const game = await createGame(mode);
                                navigate(`/game/${game.id}`);
                            } catch (e) {
                                console.error(e);
                                alert("Failed to start bot game");
                            }
                        }}
                        className="flex-shrink-0 w-full py-4 rounded-2xl bg-deepblue text-white font-paytone text-lg uppercase tracking-widest shadow-[0_10px_30px_-10px_rgba(20,30,80,0.4)] hover:bg-[#1a2b5e] hover:scale-[1.01] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <span>Start Match</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </span>
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    </button>

                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
