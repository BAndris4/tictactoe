import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFriendsList, type FriendUser } from "../../api/social";
import { createGame, inviteFriend } from "../../api/game";
import { useToast } from "../../context/ToastContext";
import UserAvatar from "../common/UserAvatar";

export default function SocialMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitingId, setInvitingId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getFriendsList()
        .then(setFriends)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleQuickInvite = async (friend: FriendUser) => {
    try {
      setInvitingId(friend.id);
      const game = await createGame('custom');
      await inviteFriend(game.id, friend.id);
      showToast(`Invite sent to @${friend.username}!`, "success");
      navigate(`/game/${game.id}`);
      setIsOpen(false);
    } catch (err) {
      showToast("Failed to create invite", "error");
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen 
          ? 'bg-sunshine text-deepblue shadow-lg shadow-sunshine/20 animate-pulse' 
          : 'bg-white/80 hover:bg-white text-deepblue/60 hover:text-deepblue shadow-sm backdrop-blur-md'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-72 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-deepblue/10 border border-white p-2 z-50 animate-fadeScaleIn origin-top-right">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-paytone text-deepblue">Friends</h3>
              <button 
                onClick={() => { navigate("/social"); setIsOpen(false); }}
                className="text-[10px] font-bold uppercase tracking-wider text-sunshine hover:text-sunshine/80"
              >
                Manage All
              </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto py-2">
              {loading ? (
                <div className="py-8 flex flex-col items-center gap-2 opacity-30">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-sunshine rounded-full animate-spin" />
                  <span className="text-[10px] font-bold">SYCHRONIZING...</span>
                </div>
              ) : friends.length === 0 ? (
                <div className="py-8 text-center px-4">
                  <p className="text-xs text-deepblue/40 font-medium italic">No friends online yet.</p>
                </div>
              ) : (
                friends.map(friend => (
                  <div key={friend.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-2xl group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center text-mint font-paytone text-sm border border-mint/5 overflow-hidden">
                        <UserAvatar 
                            username={friend.username}
                            avatarConfig={friend.profile?.avatar_config}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-deepblue">@{friend.username}</p>
                        <p className="text-[10px] text-deepblue/40 font-medium">Online</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                        <button 
                           onClick={() => { navigate(`/profile/${friend.username}`); setIsOpen(false); }}
                           className="px-3 py-1.5 rounded-lg bg-slate-100 text-deepblue text-[10px] font-bold font-paytone opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-200"
                        >
                          Profile
                        </button>
                        <button 
                           onClick={() => handleQuickInvite(friend)}
                           disabled={invitingId === friend.id}
                           className="px-3 py-1.5 rounded-lg bg-deepblue text-white text-[10px] font-bold font-paytone opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 shadow-sm disabled:opacity-50"
                        >
                          {invitingId === friend.id ? "..." : "Invite"}
                        </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
