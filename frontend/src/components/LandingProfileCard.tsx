import type { UserProfile } from "../data/mockProfile";

interface LandingProfileCardProps {
  user: UserProfile;
  onEdit: () => void;
  onHistory: () => void;
  onLogout: () => void;
}

export default function LandingProfileCard({
  user,
  onEdit,
  onHistory,
  onLogout,
}: LandingProfileCardProps) {
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="md:col-span-1 md:row-span-2 bg-white rounded-[2rem] p-6 flex flex-col items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-deepblue/5 border border-white h-full relative overflow-hidden">
      <div
        className="flex flex-col items-center text-center mt-8 cursor-pointer"
        onClick={onEdit}
      >
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-slate-50 border-4 border-white shadow-[0_0_20px_rgba(0,0,0,0.05)] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform text-4xl font-extrabold text-deepblue font-paytone">
            {getInitials()}
          </div>
          <div className="absolute top-0 right-0 bg-mint text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm font-paytone tracking-wider">
            LVL 1
          </div>
        </div>
        <h2 className="text-xl font-bold text-deepblue font-paytone tracking-tight">
          {user.firstName} {user.lastName}
        </h2>
        <p className="text-sm text-deepblue/50 font-medium font-inter mt-2 mb-4">
          @{user.username}
        </p>
      </div>

      <div className="w-full flex flex-col gap-3 mt-auto mb-4">
        <button
          onClick={onEdit}
          className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-deepblue font-bold text-sm transition-colors flex items-center justify-center gap-2 font-paytone"
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
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
          Edit Profile
        </button>
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
