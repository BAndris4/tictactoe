import { useState, useEffect } from "react";
import { getPendingRequests, respondToFriendRequest, type Friendship } from "../../api/social";

export default function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState<Friendship[]>([]);

  const fetchPending = async () => {
    try {
      const data = await getPendingRequests();
      setPending(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleResponse = async (id: number, action: 'accepted' | 'rejected') => {
    try {
      await respondToFriendRequest(id, action);
      setPending(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert("Failed to respond");
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
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {pending.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
            {pending.length}
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
              {pending.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3 text-deepblue/20">
                  <div className="p-4 bg-slate-50 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M9.143 17.082a24.248 24.248 0 003.844.214m-3.844-.214a10.856 10.856 0 00-4.773-5.091V9.125c0-4.556 3.468-8.25 7.75-8.25s7.75 3.694 7.75 8.25v2.866a10.856 10.856 0 00-4.773 5.091m-7.75 0a23.984 23.984 0 0115.5 0m-15.5 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest font-paytone text-slate-300">Quiet for now...</p>
                </div>
              ) : (
                pending.map(req => (
                  <div key={req.id} className="p-4 bg-slate-50/50 hover:bg-slate-50 transition-all rounded-2xl mb-2 last:mb-0 border border-white/50 group animate-slideInRight">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-sunshine/10 flex items-center justify-center text-sunshine font-paytone text-sm border border-sunshine/5">
                        {req.from_user[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-deepblue/60">
                          <span className="font-black text-deepblue">@{req.from_user}</span> wants to be friends!
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleResponse(req.id, 'accepted')}
                        className="flex-1 py-2 rounded-xl bg-mint text-white text-[10px] font-bold font-paytone shadow-sm shadow-mint/20 hover:scale-[1.02] transition-transform active:scale-95"
                      >
                        Accept
                      </button>
                      <button 
                         onClick={() => handleResponse(req.id, 'rejected')}
                         className="flex-1 py-2 rounded-xl bg-white border border-slate-100 text-deepblue/40 text-[10px] font-bold font-paytone hover:bg-slate-50 transition-colors"
                      >
                        Ignore
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
