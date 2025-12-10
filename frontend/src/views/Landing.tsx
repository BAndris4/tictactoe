import { useNavigate } from "react-router-dom";
import { useState } from "react";
import EditProfileModal from "../components/EditProfileModal";
import { mockUser } from "../data/mockProfile";
import type { UserProfile } from "../data/mockProfile";
import BackgroundShapes from "../components/BackgroundShapes";
import UnrankedIconRaw from "../assets/unranked.svg?raw";
import RankedIconRaw from "../assets/ranked.svg?raw";
import AiIconRaw from "../assets/ai.svg?raw";
import CustomIconRaw from "../assets/custom.svg?raw";
import LocalIcon from "../assets/local.svg";

export default function Landing() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSaveProfile = (updatedData: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative min-h-screen bg-[#F3F4FF] text-deepblue font-inter overflow-hidden p-4 sm:p-6 lg:p-8 flex items-center justify-center">
       <BackgroundShapes />
       
      <div className="relative z-10 w-full max-w-7xl mx-auto h-full grid grid-cols-1 md:grid-cols-4 grid-rows-[auto_auto_auto] md:grid-rows-[minmax(300px,auto)_auto] gap-4 md:gap-6 animate-fadeScaleIn">
        
        <div className="md:col-span-1 md:row-span-2 bg-white rounded-[2rem] p-6 flex flex-col items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-deepblue/5 border border-white h-full relative overflow-hidden">
            
            <div className="flex flex-col items-center text-center mt-8 cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
                 <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-slate-50 border-4 border-white shadow-[0_0_20px_rgba(0,0,0,0.05)] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform text-4xl font-extrabold text-deepblue font-paytone">
                        {getInitials()}
                    </div>
                    <div className="absolute top-0 right-0 bg-mint text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm font-paytone tracking-wider">
                        LVL 1
                    </div>
                 </div>
                 <h2 className="text-xl font-bold text-deepblue mb-1 font-paytone tracking-tight">{user.firstName} <br/> {user.lastName}</h2>
                 <p className="text-sm text-deepblue/50 font-medium font-inter">@{user.username}</p>
                 
                 
            </div>

            <div className="w-full flex flex-col gap-3 mt-auto mb-4">
                <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-deepblue font-bold text-sm transition-colors flex items-center justify-center gap-2 font-paytone"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-deepblue/70">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Edit Profile
                </button>
                <button 
                    onClick={() => navigate("/history")}
                    className="w-full py-3 rounded-xl bg-white border-2 border-slate-100 hover:border-slate-200 text-deepblue font-bold text-sm transition-colors flex items-center justify-center gap-2 font-paytone"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-deepblue/70">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Match History
                </button>
            </div>
        </div>

        <div className="md:col-span-1 bg-white rounded-[2rem] p-6 relative group overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all shadow-lg shadow-deepblue/5 border border-white flex flex-col items-center justify-center text-center gap-4" onClick={() => {}}>
             <div className="p-4 bg-coral/10 rounded-2xl text-coral group-hover:scale-110 transition-transform mb-2">
                  <div 
                    className="w-10 h-10 text-current [&>svg]:w-full [&>svg]:h-full [&_path]:!stroke-current"
                    dangerouslySetInnerHTML={{ __html: UnrankedIconRaw }}
                  />
             </div>
             <div>
                <h3 className="text-2xl font-bold text-deepblue font-paytone tracking-tight">Unranked</h3>
                <p className="text-sm text-deepblue/60 font-medium mt-1 font-inter">Casual Friendly Game</p>
             </div>
        </div>

        <div className="md:col-span-1 bg-white rounded-[2rem] p-6 relative group overflow-hidden cursor-pointer shadow-2xl shadow-mint/20 border-2 border-mint/20 flex flex-col items-center justify-center text-center gap-4 hover:scale-[1.03] transition-all duration-300 z-10" onClick={() => {}}>
             <div className="absolute top-3 right-3">
                 <span className="bg-mint text-white text-[10px] font-black px-2 py-1 rounded shadow-sm tracking-widest font-paytone">SEASON 1</span>                 
             </div>
             
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mint/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

             <div className="p-4 bg-mint/10 rounded-2xl text-mint group-hover:scale-110 transition-transform mb-2 shadow-inner">
                  <div 
                    className="w-12 h-12 text-current [&>svg]:w-full [&>svg]:h-full [&_path]:!stroke-current"
                    dangerouslySetInnerHTML={{ __html: RankedIconRaw }}
                  />
             </div>
             <div>
                <h3 className="text-3xl font-black text-deepblue tracking-tight font-paytone">Ranked</h3>
                <p className="text-sm text-deepblue/60 font-medium mt-1 font-inter">Competitive Ladder</p>
             </div>
             <div className="mt-2 text-xs font-bold text-mint bg-mint/10 px-3 py-1 rounded-full opacity-100 font-paytone tracking-wide">
                PLAY NOW
             </div>
        </div>

        <div className="md:col-span-1 bg-white rounded-[2rem] p-6 relative group overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all shadow-lg shadow-deepblue/5 border border-white flex flex-col items-center justify-center text-center gap-4" onClick={() => {}}>
             <div className="p-4 bg-purple-100 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform mb-2">
                  <div 
                    className="w-10 h-10 text-current [&>svg]:w-full [&>svg]:h-full [&_path]:!fill-current"
                    dangerouslySetInnerHTML={{ __html: AiIconRaw }}
                  />
             </div>
             <div>
                <h3 className="text-2xl font-bold text-deepblue font-paytone tracking-tight">Play Against AI</h3>
                <p className="text-sm text-deepblue/60 font-medium mt-1 font-inter">Training Ground</p>
             </div>
        </div>

        <div className="md:col-span-3 flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="flex-1 bg-white rounded-[2rem] p-6 flex flex-row items-center gap-4 group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all shadow-lg shadow-deepblue/5 border border-white" onClick={() => {}}>
               <div className="w-12 h-12 rounded-full bg-sunshine/10 flex items-center justify-center text-sunshine group-hover:scale-110 transition-transform shrink-0">
                    <div 
                        className="w-6 h-6 text-current [&>svg]:w-full [&>svg]:h-full [&_path]:!stroke-current"
                        dangerouslySetInnerHTML={{ __html: CustomIconRaw }}
                    />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-deepblue font-paytone">Custom Game</h3>
                    <p className="text-sm text-deepblue/60 font-inter">Invite a friend.</p>
                 </div>
            </div>

            <div className="flex-1 bg-white rounded-[2rem] p-6 flex flex-row items-center gap-4 group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all shadow-lg shadow-deepblue/5 border border-white" onClick={() => navigate("/game")}>
                 <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shrink-0">
                    <img 
                        src={LocalIcon} 
                        alt="Local Game" 
                        className="w-6 h-6 object-contain opacity-80"
                    />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-deepblue font-paytone">Local Game</h3>
                    <p className="text-sm text-deepblue/60 font-inter">Offline play.</p>
                 </div>
            </div>
        </div>

      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
