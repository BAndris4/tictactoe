import { useNavigate } from "react-router-dom";
import BackgroundShapes from "../components/BackgroundShapes";
import { mockUser } from "../data/mockProfile";

export default function History() {
  const navigate = useNavigate();

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
            {mockUser.history.length === 0 ? (
                <div className="p-12 text-center text-deepblue/60 font-medium">No matches found yet. Play a game!</div>
            ) : (
                <div className="divide-y divide-slate-50">
                    {mockUser.history.map((match) => (
                        <div key={match.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-2xl group">
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm transition-transform group-hover:scale-110 ${
                                    match.result === 'WIN' ? 'bg-mint/10 text-mint' :
                                    match.result === 'LOSS' ? 'bg-coral/10 text-coral' :
                                    'bg-slate-100 text-slate-500'
                                }`}>
                                    {match.result[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-deepblue text-lg mb-0.5">{match.opponent}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-deepblue/60 uppercase tracking-wider">RANKED</span>
                                        <span className="text-xs text-deepblue/40 font-medium">{match.date}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <div className={`font-black text-xl ${
                                    match.lpChange > 0 ? 'text-mint' : 
                                    match.lpChange < 0 ? 'text-coral' : 'text-deepblue/50'
                                }`}>
                                    {match.lpChange > 0 ? '+' : ''}{match.lpChange} LP
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
