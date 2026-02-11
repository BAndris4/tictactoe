import ProgressBar from "../../common/ProgressBar";

interface GameEndXPBarProps {
  newXp: number;
  xpToNextLevel: number;
  xpGained: number;
  newLevel: number;
  leveledUp: boolean;
}

export default function GameEndXPBar({ newXp, xpToNextLevel, xpGained, newLevel, leveledUp }: GameEndXPBarProps) {
  return (
    <div className="mt-6 bg-slate-50/80 rounded-2xl p-4 border border-slate-100/50">
      <ProgressBar 
        currentXp={newXp} 
        nextLevelXp={xpToNextLevel} 
        xpGained={xpGained}
        level={newLevel}
        leveledUp={leveledUp}
      />
    </div>
  );
}
