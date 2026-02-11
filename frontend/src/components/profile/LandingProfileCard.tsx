import type { UserProfile } from "../../data/mockProfile";

interface LandingProfileCardProps {
  user: UserProfile;

  onProfileNavigate: () => void;
  onHistory: () => void;
  onLogout: () => void;
}

import CircularProgressBar from "../common/CircularProgressBar";
import Avatar from 'avataaars';

export default function LandingProfileCard({
  user,
  onProfileNavigate,
  onHistory,
  onLogout,
}: LandingProfileCardProps) {
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  // Safe access to profile data (in case UserProfile type in mockProfile/auth isn't fully updated yet)
  const level = (user as any).profile?.level || 1;
  const currentXp = (user as any).profile?.current_xp || 0;
  const nextLevelXp = (user as any).profile?.next_level_xp || 1000;
  
  const percentage = Math.min((currentXp / nextLevelXp) * 100, 100);

  return (
    <div className="md:col-span-1 md:row-span-2 bg-white rounded-[2rem] p-6 flex flex-col items-center justify-between shadow-lg shadow-deepblue/5 border border-white h-full relative overflow-hidden">
      <div
        className="flex flex-col items-center text-center mt-8 cursor-pointer w-full group"
        onClick={onProfileNavigate}
      >
        <div className="relative mb-4 hover:scale-105 transition-transform duration-300 ease-out">
             <CircularProgressBar
                 percentage={percentage}
                 level={level}
                 currentXp={currentXp}
                 nextLevelXp={nextLevelXp}
                 size={135}
                 strokeWidth={5}
             >
                  <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-deepblue font-paytone bg-slate-50 overflow-hidden">
                     {(user as any).profile?.avatar_config ? (
                         <div className="w-[110%] h-[110%] mt-2">
                            <Avatar
                                style={{ width: '100%', height: '100%' }}
                                avatarStyle="Transparent"
                                {...(user as any).profile.avatar_config}
                            />
                         </div>
                     ) : (
                         getInitials()
                     )}
                  </div>
             </CircularProgressBar>
        </div>

        <h2 className="text-xl font-bold text-deepblue font-paytone tracking-tight transition-colors duration-300">
          {user.firstName} {user.lastName}
        </h2>
        <p className="text-sm text-deepblue/50 font-medium font-inter mt-2 mb-4 transition-colors">
          @{user.username}
        </p>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-slate-100 text-deepblue text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none">
            VIEW PROFILE
        </div>
      </div>

      <div className="w-full flex flex-col gap-3 mt-auto mb-4">

        <button
          onClick={onHistory}
          className="w-full py-3 rounded-xl bg-white border-2 border-slate-100 hover:border-slate-200 text-deepblue font-bold text-sm transition-colors flex items-center justify-center gap-2 font-paytone"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 text-deepblue/70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Match History
        </button>
        <button
          onClick={onLogout}
          className="w-full py-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 font-bold text-sm transition-colors flex items-center justify-center gap-2 font-paytone border border-red-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}
