import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BackgroundShapes from "../components/BackgroundShapes";
import { 
  getFriendsList, 
  getPendingRequests, 
  sendFriendRequest, 
  respondToFriendRequest, 
  unfriendUser, 
  type FriendUser,
  type Friendship
} from "../api/social";

type Tab = 'friends' | 'pending' | 'add';

export default function Social() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [pending, setPending] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState("");
  const [requestStatus, setRequestStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'friends') {
        const data = await getFriendsList();
        setFriends(data);
      } else if (activeTab === 'pending') {
        const data = await getPendingRequests();
        setPending(data);
      }
    } catch (err) {
      console.error("Failed to fetch social data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;
    
    try {
      await sendFriendRequest(searchUsername);
      setRequestStatus({ type: 'success', msg: `Friend request sent to @${searchUsername}!` });
      setSearchUsername("");
    } catch (err: any) {
      setRequestStatus({ type: 'error', msg: err.message || "Failed to send request" });
    }
  };

  const handleResponse = async (id: number, action: 'accepted' | 'rejected') => {
    try {
      await respondToFriendRequest(id, action);
      setPending(prev => prev.filter(p => p.id !== id));
      if (action === 'accepted') {
          // If accepted, maybe switch to friends tab or just show toast
          // For now just refresh data
          fetchData();
      }
    } catch (err) {
      alert("Action failed");
    }
  };

  const handleUnfriend = async (username: string) => {
    if (!window.confirm(`Are you sure you want to unfriend @${username}?`)) return;
    try {
      await unfriendUser(username);
      setFriends(prev => prev.filter(f => f.username !== username));
    } catch (err) {
      alert("Failed to unfriend");
    }
  };

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
            <h1 className="text-3xl font-extrabold text-deepblue tracking-tight font-paytone">Social</h1>
            <div className="w-[100px]"></div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/50 p-1.5 rounded-2xl mb-8 gap-1.5 self-center border border-white/50 shadow-sm">
            {[
                { id: 'friends', label: 'Friends' },
                { id: 'pending', label: 'Pending' },
                { id: 'add', label: 'Add Friend' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => {
                        setActiveTab(tab.id as Tab);
                        setRequestStatus(null);
                    }}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                        activeTab === tab.id 
                        ? 'bg-white text-deepblue shadow-sm scale-105' 
                        : 'text-deepblue/40 hover:text-deepblue/60'
                    } font-paytone`}
                >
                    {tab.label}
                    {tab.id === 'pending' && pending.length > 0 && (
                        <span className="ml-2 bg-coral text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                            {pending.length}
                        </span>
                    )}
                </button>
            ))}
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-deepblue/5 border border-white overflow-hidden p-2 min-h-[400px] flex flex-col">
            
            {activeTab === 'add' ? (
                <div className="p-8 md:p-12 flex flex-col items-center">
                    <div className="w-20 h-20 bg-sunshine/10 rounded-3xl flex items-center justify-center mb-6 text-sunshine">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5L12 14.5L19 21.5" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.5H3" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-deepblue mb-2 font-paytone">Add New Friend</h2>
                    <p className="text-deepblue/40 text-center mb-8 max-w-sm font-medium">
                        Enter your friend's username to send them a request. You'll become friends once they accept!
                    </p>

                    <form onSubmit={handleSendRequest} className="w-full max-w-md flex flex-col gap-4">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={searchUsername}
                                onChange={(e) => setSearchUsername(e.target.value)}
                                placeholder="Friend's username (e.g. dragon88)"
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-sunshine/30 focus:bg-white outline-none transition-all font-bold placeholder:text-deepblue/20"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="w-full py-4 rounded-2xl bg-sunshine text-deepblue font-black shadow-lg shadow-sunshine/20 hover:scale-[1.02] active:scale-95 transition-all font-paytone"
                        >
                            Send Friend Request
                        </button>
                    </form>

                    {requestStatus && (
                        <div className={`mt-6 p-4 rounded-xl text-sm font-bold animate-fadeIn ${
                            requestStatus.type === 'success' ? 'bg-mint/10 text-mint' : 'bg-red-50 text-red-500 border border-red-100'
                        }`}>
                            {requestStatus.msg}
                        </div>
                    )}
                </div>
            ) : loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-deepblue/30">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-sunshine rounded-full animate-spin mb-4"></div>
                    <p className="font-bold font-paytone">Syncing with server...</p>
                </div>
            ) : activeTab === 'friends' ? (
                <div className="flex flex-col">
                    {friends.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                            </div>
                            <h3 className="font-paytone text-lg text-deepblue/60">No friends yet</h3>
                            <p className="text-sm text-deepblue/30 mt-1">Start by adding someone new!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {friends.map(friend => (
                                <div key={friend.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-mint/10 flex items-center justify-center text-mint font-black text-xl font-paytone">
                                            {friend.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-deepblue text-lg mb-0.5">@{friend.username}</h3>
                                            <p className="text-xs text-deepblue/40 font-medium">{friend.first_name} {friend.last_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleUnfriend(friend.username)}
                                            className="px-4 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-bold font-paytone opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100"
                                        >
                                            Unfriend
                                        </button>
                                        <button 
                                            className="px-4 py-2 rounded-xl bg-deepblue text-white text-xs font-bold font-paytone opacity-0 group-hover:opacity-100 transition-all hover:bg-deepblue/90"
                                            onClick={() => alert("Quick game invite coming soon!")}
                                        >
                                            Invite
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col">
                    {pending.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-paytone text-lg text-deepblue/60">No pending requests</h3>
                            <p className="text-sm text-deepblue/30 mt-1">Incoming requests will appear here</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {pending.map(req => (
                                <div key={req.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-sunshine/10 flex items-center justify-center text-sunshine font-black text-xl font-paytone">
                                            {req.from_user[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-deepblue text-lg mb-0.5">@{req.from_user}</h3>
                                            <p className="text-xs text-deepblue/40 font-medium">Sent a friend request</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleResponse(req.id, 'accepted')}
                                            className="px-5 py-2.5 rounded-xl bg-mint text-white text-xs font-bold font-paytone shadow-sm shadow-mint/20 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Accept
                                        </button>
                                        <button 
                                            onClick={() => handleResponse(req.id, 'rejected')}
                                            className="px-5 py-2.5 rounded-xl bg-slate-100 text-deepblue/50 text-xs font-bold font-paytone hover:bg-slate-200 transition-all"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
