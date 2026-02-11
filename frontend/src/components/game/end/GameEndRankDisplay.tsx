import { getRankImage, getRankTextColor } from "../../../utils/rankUtils";
import LPProgressBar from "../../common/LPProgressBar";

interface GameEndRankDisplayProps {
  rankToShow: string | null;
  oldLpDiv: number;
  newLpDiv: number;
  lpChange: number;
  isRankTransitioning: boolean;
  showNewRank: boolean;
  isPromotion: boolean;
  rankIsChange: boolean;
}

export default function GameEndRankDisplay({
  rankToShow,
  oldLpDiv,
  newLpDiv,
  lpChange,
  isRankTransitioning,
  showNewRank,
  isPromotion,
  rankIsChange
}: GameEndRankDisplayProps) {
  if (!rankToShow) return null;

  return (
    <div className="flex flex-col items-center">
      {/* Floating Rank Image */}
      <div className="relative mb-2">
        {/* Glow effect */}
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
        
        {/* Promotion/Demotion Indicator */}
        {rankIsChange && showNewRank && (
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
          previousLp={oldLpDiv}
          newLp={newLpDiv}
          lpChange={lpChange}
          rank={rankToShow || "Unranked"}
        />
      </div>
    </div>
  );
}
