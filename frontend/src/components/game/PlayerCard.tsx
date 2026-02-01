import { useGame } from "../../context/GameContext";
import UserAvatar from "../common/UserAvatar";

interface PlayerCardProps {
  player: { name: string | null | undefined; symbol: 'X' | 'O' } | null;
  avatarConfig?: any;
  isMe?: boolean;
  isLocalGame?: boolean;
}

export default function PlayerCard({ player, avatarConfig, isMe, isLocalGame }: PlayerCardProps) {
  const game = useGame();
  const isThinking = game.currentPlayer === player?.symbol;
  // In local game, don't show turn indicator for the "opponent" card (which is actually you playing both sides)
  const showTurnIndicator = isThinking && (isMe || !isLocalGame);

  return (
    <div className={`
      flex items-center gap-3 px-5 py-3 rounded-xl w-full max-w-sm justify-between
      backdrop-blur-md transition-all duration-300
      ${isThinking 
        ? isMe 
          ? player?.symbol === 'X' 
            ? 'bg-coral/20 border-2 border-coral shadow-lg shadow-coral/30 scale-[1.02]'
            : 'bg-sunshine/20 border-2 border-sunshine shadow-lg shadow-sunshine/30 scale-[1.02]'
          : player?.symbol === 'X'
            ? 'bg-coral/10 border-2 border-coral/50 shadow-lg shadow-coral/20'
            : 'bg-sunshine/10 border-2 border-sunshine/50 shadow-lg shadow-sunshine/20'
        : isMe 
          ? 'bg-white/80 border border-white shadow-sm' 
          : 'bg-white/40 border border-white/50 shadow-sm'
      }
    `}>
      <div className="flex items-center gap-2.5">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center font-bold text-white 
          transition-all duration-300 overflow-hidden
          ${isThinking ? 'scale-110 shadow-lg' : 'scale-100'}
          ${player?.symbol === 'X' ? 'bg-coral' : 'bg-sunshine'}
        `}>
          <UserAvatar 
            username={player?.name || "?"} 
            avatarConfig={avatarConfig} 
            className="w-full h-full"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-deepblue text-sm truncate max-w-[120px]">
            {player?.name || (isMe ? "You" : "...")}
          </span>
          {showTurnIndicator && (
            <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 text-gray-700`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {isMe ? 'Your Turn!' : 'Thinking...'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
