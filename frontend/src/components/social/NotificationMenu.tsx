import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingRequests, respondToFriendRequest, type Friendship } from "../../api/social";
import { getPendingInvitations, respondToGameInvitation, type GameInvitation } from "../../api/game";
import { useToast } from "../../context/ToastContext";

type Notification = 
  | { type: 'friend_request'; data: Friendship }
  | { type: 'game_invite'; data: GameInvitation };

export default function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchAll = async () => {
    try {
      const [friendReqs, gameInvites] = await Promise.all([
        getPendingRequests(),
        getPendingInvitations()
      ]);
      
      const combined: Notification[] = [
        ...friendReqs.map(f => ({ type: 'friend_request' as const, data: f })),
        ...gameInvites.map(g => ({ type: 'game_invite' as const, data: g }))
      ];
      
      setNotifications(combined.sort((a, b) => 
        new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime()
      ));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleFriendResponse = async (id: number, action: 'accepted' | 'rejected') => {
    try {
      await respondToFriendRequest(id, action);
      setNotifications(prev => prev.filter(n => !(n.type === 'friend_request' && n.data.id === id)));
    } catch (err) {
      showToast("Failed to respond to friend request", "error");
    }
  };

  const handleGameResponse = async (id: number, action: 'accepted' | 'rejected', gameId?: string) => {
    try {
      await respondToGameInvitation(id, action);
      setNotifications(prev => prev.filter(n => !(n.type === 'game_invite' && n.data.id === id)));
      if (action === 'accepted' && gameId) {
        navigate(`/game/${gameId}`);
        setIsOpen(false);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to respond to game invite", "error");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative ${
          isOpen 
          ? 'bg-coral text-white shadow-lg shadow-coral/20 animate-pulse' 
          : 'bg-white/80 hover:bg-white text-deepblue/60 hover:text-deepblue shadow-sm backdrop-blur-md'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-deepblue/10 border border-white p-3 z-50 animate-fadeScaleIn origin-top-right">
            <div className="p-4 border-b border-slate-50">
              <h3 className="font-paytone text-deepblue">Notifications</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto overflow-x-hidden p-1">
              {notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3 text-deepblue/20">
                  <div className="p-6 bg-slate-50/50 rounded-full text-deepblue/10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest font-paytone text-slate-300">Quiet for now...</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={`${notif.type}-${notif.data.id}`} className="p-4 bg-slate-50/50 hover:bg-slate-50 transition-all rounded-2xl mb-2 last:mb-0 border border-white/50 group animate-slideInRight">
                    {notif.type === 'friend_request' ? (
                      <>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-sunshine/10 flex items-center justify-center text-sunshine font-paytone text-sm border border-sunshine/5">
                            {notif.data.from_user[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-deepblue/60">
                              <span className="font-black text-deepblue">@{notif.data.from_user}</span> wants to be friends!
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleFriendResponse(notif.data.id, 'accepted')}
                            className="flex-1 py-2 rounded-xl bg-mint text-white text-[10px] font-bold font-paytone shadow-sm shadow-mint/20 hover:scale-[1.02] transition-transform active:scale-95"
                          >
                            Accept
                          </button>
                          <button 
                             onClick={() => handleFriendResponse(notif.data.id, 'rejected')}
                             className="flex-1 py-2 rounded-xl bg-white border border-slate-100 text-deepblue/40 text-[10px] font-bold font-paytone hover:bg-slate-50 transition-colors"
                          >
                            Ignore
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center text-mint font-paytone text-sm border border-mint/5">
                            {notif.data.from_user_name[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-deepblue/60">
                              <span className="font-black text-deepblue">@{notif.data.from_user_name}</span> invited you to a game!
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleGameResponse(notif.data.id, 'accepted', notif.data.game)}
                            className="flex-1 py-2 rounded-xl bg-deepblue text-white text-[10px] font-bold font-paytone shadow-sm shadow-deepblue/20 hover:scale-[1.02] transition-transform active:scale-95"
                          >
                            Play
                          </button>
                          <button 
                             onClick={() => handleGameResponse(notif.data.id, 'rejected')}
                             className="flex-1 py-2 rounded-xl bg-white border border-slate-100 text-deepblue/40 text-[10px] font-bold font-paytone hover:bg-slate-50 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </>
                    )}
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
