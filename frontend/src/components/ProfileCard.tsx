import type { UserProfile } from "../data/mockProfile";
import { useNavigate } from "react-router-dom";

interface ProfileCardProps {
  user: UserProfile;
  onEdit: () => void;
}

export default function ProfileCard({ user, onEdit }: ProfileCardProps) {
  const navigate = useNavigate();

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-sm border border-slate-100">
      <div className="flex flex-col items-center">
        <div className="relative mb-6 group cursor-pointer" onClick={onEdit}>
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-mint/20 shadow-inner bg-mint/10 flex items-center justify-center">
            <span className="text-3xl font-bold text-mint">{getInitials()}</span>
          </div>
          <div className="absolute bottom-0 right-0 bg-mint rounded-full p-1.5 border-2 border-white group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
              <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-deepblue mb-1">{user.username}</h2>
        <p className="text-sm text-deepblue/60 font-medium mb-6">
            {user.firstName} {user.lastName}
        </p>
        
        <div className="w-full space-y-3 mt-2">
          <button 
            onClick={onEdit}
            className="w-full py-2.5 px-4 rounded-xl bg-deepblue text-white text-sm font-semibold hover:bg-deepblue/90 transition shadow-lg shadow-deepblue/20"
          >
            Edit Profile
          </button>
          <button
            onClick={() => navigate("/history")}
            className="w-full py-2.5 px-4 rounded-xl bg-white border-2 border-slate-100 text-deepblue text-sm font-semibold hover:bg-slate-50 transition"
          >
            Match History
          </button>
        </div>
      </div>
    </div>
  );
}
