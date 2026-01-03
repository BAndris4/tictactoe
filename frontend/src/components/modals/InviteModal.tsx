import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../hooks/useAuth";
import { getFriendsList, type FriendUser } from "../../api/social";
import { inviteFriend, forfeitGame } from "../../api/game";

export default function InviteModal() {
  const { gameId, status, players, error, setError } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [invitedIds, setInvitedIds] = useState<Set<number>>(new Set());
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (status === "waiting" && gameId) {
      setLoadingFriends(true);
      getFriendsList()
        .then(setFriends)
        .finally(() => setLoadingFriends(false));
    }
  }, [status, gameId]);

  // Only show if waiting AND I am the creator (player_x)
  if (status !== "waiting" || !gameId || !user || String(players.x) !== String(user.id)) return null;

  const inviteLink = `${window.location.origin}/game/${gameId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteFriend = async (friend: FriendUser) => {
    try {
      await inviteFriend(gameId, friend.id);
      setInvitedIds(prev => new Set([...prev, friend.id]));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancelGame = async () => {
    try {
      setCancelling(true);
      await forfeitGame(gameId);
      navigate("/");
    } catch (err: any) {
      setError("Failed to cancel game");
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeScaleIn">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-white text-center flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
            <button 
                onClick={handleCancelGame}
                disabled={cancelling}
                className="text-[10px] font-black tracking-widest text-coral hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
                <div className="w-1.5 h-1.5 rounded-full bg-coral"></div>
                {cancelling ? "CANCELLING..." : "CANCEL GAME"}
            </button>
            <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-sunshine animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-sunshine animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-sunshine animate-bounce"></span>
            </div>
        </div>

        <h2 className="text-3xl font-black font-paytone text-deepblue mb-2">
          Invite Someone
        </h2>
        <p className="text-gray-400 font-medium mb-8">
          Share the link or invite your current friends!
        </p>

        {/* Link Copy Section */}
        <div className="bg-slate-50 p-2 rounded-2xl flex items-center gap-2 mb-8 border border-slate-100">
          <input
            readOnly
            value={inviteLink}
            className="flex-1 bg-transparent px-4 py-3 text-sm font-bold text-deepblue/60 focus:outline-none overflow-hidden text-ellipsis"
          />
          <button
            onClick={copyToClipboard}
            className="bg-deepblue text-white px-6 py-3 rounded-xl hover:bg-opacity-95 transition-all active:scale-95 font-paytone text-sm shadow-lg shadow-deepblue/20"
          >
            {copied ? "COPIED!" : "COPY LINK"}
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">Or pick a friend</span>
            <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        {/* Friends List Section */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loadingFriends ? (
                <div className="py-12 flex flex-col items-center gap-3 opacity-20">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-sunshine rounded-full animate-spin" />
                    <p className="text-[10px] font-black tracking-widest">GETTING BROS...</p>
                </div>
            ) : friends.length === 0 ? (
                <div className="py-12 text-center text-slate-300">
                    <p className="text-sm font-medium italic">No friends online matching your vibe.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {friends.map(friend => (
                        <div key={friend.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-sunshine/20 hover:bg-white transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-mint/10 flex items-center justify-center text-mint font-paytone text-lg">
                                    {friend.username[0].toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-deepblue text-sm">@{friend.username}</p>
                                    <p className="text-[10px] font-medium text-mint uppercase tracking-tighter">Ready to play</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleInviteFriend(friend)}
                                disabled={invitedIds.has(friend.id)}
                                className={`px-5 py-2.5 rounded-xl font-paytone text-xs transition-all shadow-sm ${
                                    invitedIds.has(friend.id)
                                    ? 'bg-slate-100 text-slate-400 cursor-default'
                                    : 'bg-sunshine text-deepblue hover:scale-105 active:scale-95 shadow-sunshine/20'
                                }`}
                            >
                                {invitedIds.has(friend.id) ? "INVITED" : "INVITE"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-500 text-xs font-bold border border-red-100 animate-shake">
                {error}
            </div>
        )}
      </div>
    </div>
  );
}
