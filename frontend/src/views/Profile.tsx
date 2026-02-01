import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../api/auth";
import { useToast } from "../context/ToastContext";
import BackgroundShapes from "../components/BackgroundShapes";
import TopBar from "../components/layout/TopBar";
import CircularProgressBar from "../components/common/CircularProgressBar";

// Dynamically import all rank icons
const unrankedIcon = new URL("../assets/ranks/unranked.svg", import.meta.url).href;
const rankIcons = import.meta.glob('../assets/ranks/*.svg', { eager: true, as: 'raw' });

interface ProfileData {
  username: string;
  first_name: string;
  last_name: string;
  profile: {
    level: number;
    rank: string;
    current_xp: number;
    next_level_xp: number;
    placement_games_played: number;
    lp_in_division: number;
  };
  stats: {
    total_games_played: number;
    unrated_winrate: number;
    unrated_wins: number;
    unrated_losses: number;
    unrated_draws: number;
  };
  mutual_friends: string[];
}

export default function Profile() {
// ... (lines 36-248 kept same, skipping to render part for brevity in thought, but tool needs exact target)
// Wait, I need to do this in chunks. First interface.

  const navigate = useNavigate();
  const { username: paramUsername } = useParams<{ username: string }>();
  const { user, loading: authLoading, refetch } = useAuth();
  const { showToast } = useToast();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Edit form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const targetUsername = paramUsername || user?.username;
  const isOwner = user?.username === targetUsername;

  useEffect(() => {
    if (targetUsername) {
      loadProfile(targetUsername);
    }
  }, [targetUsername]);

  useEffect(() => {
    if (isOwner && user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhone(user.phoneNumber || "");
    }
  }, [isOwner, user]);

  const loadProfile = async (uname: string) => {
    setLoading(true);
    try {
      const data = await authApi.getProfile(uname);
      setProfileData(data);
    } catch (err) {
      showToast("Failed to load profile", "error");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateMe({
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone
      });
      await refetch();
      showToast("Profile updated successfully!", "success");
      setShowSettings(false);
      if (targetUsername) loadProfile(targetUsername);
    } catch (err: any) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading && !targetUsername) return null;

  const levelPercentage = profileData 
    ? Math.min((profileData.profile.current_xp / profileData.profile.next_level_xp) * 100, 100) 
    : 0;

  const getRankIcon = () => {
      if (!profileData) return unrankedIcon;
      
      const rankName = profileData.profile.rank.toLowerCase();
      // Example: "Bronze 3" -> "b3", "Gold 1" -> "g1", "Master" -> "m"
      let fileKey = "unranked";
      
      if (rankName.includes("bronze")) fileKey = `b${rankName.replace(/[^0-9]/g, '')}`;
      else if (rankName.includes("silver")) fileKey = `s${rankName.replace(/[^0-9]/g, '')}`;
      else if (rankName.includes("gold")) fileKey = `g${rankName.replace(/[^0-9]/g, '')}`;
      else if (rankName.includes("master")) fileKey = "m";
      else if (rankName === "unranked") fileKey = "unranked";

      // Try to match file path
      const path = `../assets/ranks/${fileKey}.svg`;
      return rankIcons[path] || rankIcons['../assets/ranks/unranked.svg'];
  };

  return (
    <div className="relative min-h-screen bg-[#F3F4FF] text-deepblue font-inter overflow-hidden p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <BackgroundShapes />
      <TopBar />

      <div className="relative z-10 w-full max-w-7xl mx-auto pt-20 pb-10 flex flex-col gap-6">
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 lg:left-0 z-50">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-slate-100 text-deepblue font-bold hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm font-paytone group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back
            </button>
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center h-96 gap-4 animate-pulse">
               <div className="w-16 h-16 rounded-full border-4 border-t-deepblue border-deepblue/20 animate-spin"/>
               <div className="text-xl font-black text-deepblue/50 font-paytone">Loading Profile...</div>
           </div>
        ) : profileData ? (
           <div className="grid grid-cols-1 lg:grid-cols-12 auto-rows-[minmax(100px,auto)] gap-6">
               
               {/* 1. Main Profile Card (Left, taller) */}
               <div className={`lg:col-span-4 lg:row-span-2 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-deepblue/5 border border-white relative overflow-hidden flex flex-col items-center text-center ${!isOwner ? 'justify-center' : ''}`}>
                   <div className="absolute inset-0 bg-gradient-to-br from-deepblue/5 to-transparent pointer-events-none"/>
                   
                   <div className="relative z-10 mb-6 mt-4 group">
                       <CircularProgressBar
                           percentage={levelPercentage}
                           level={profileData.profile.level}
                           currentXp={profileData.profile.current_xp}
                           nextLevelXp={profileData.profile.next_level_xp}
                           size={180}
                           strokeWidth={8}
                       >
                           <div className="w-full h-full flex items-center justify-center text-6xl font-black text-deepblue font-paytone bg-slate-50">
                               {profileData.username.substring(0, 2).toUpperCase()}
                           </div>
                       </CircularProgressBar>
                   </div>

                   <h1 className="text-4xl font-black text-deepblue font-paytone mb-2 relative z-10 tracking-tight">
                       {profileData.first_name} {profileData.last_name}
                   </h1>
                   <div className="flex flex-col gap-1 items-center mb-8 relative z-10">
                       <p className="text-deepblue/60 font-medium text-lg">
                           {profileData.username}
                       </p>
                       {profileData.mutual_friends.length > 0 && (
                           <span className="text-mint font-bold text-xs bg-mint/10 px-3 py-1 rounded-full uppercase tracking-widest mt-2 border border-mint/20">
                               {profileData.mutual_friends.length} Mutual Friends
                           </span>
                       )}
                   </div>

                   {isOwner && (
                       <button
                           onClick={() => setShowSettings(true)}
                           className="mt-auto w-full py-4 rounded-xl bg-slate-100 text-deepblue font-black text-sm hover:bg-slate-200 transition-all font-paytone flex items-center justify-center gap-2 group"
                       >
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transition-transform duration-500">
                             <path d="M18.75 12.75h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM12 6a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 6zM12 18a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 18zM3.75 6.75h1.5a.75.75 0 100-1.5h-1.5a.75.75 0 000 1.5zM5.25 18.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5zM3 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 013 12zM9 3.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12.75 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zM9 15.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                           </svg>
                           EDIT PROFILE
                       </button>
                   )}
               </div>

               {/* 2. Rank Card (Wide top right) */}
               <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-deepblue/5 border border-white relative overflow-hidden flex items-center justify-between group">
                   <div className="relative z-10 flex flex-col justify-center h-full">
                       <h2 className="text-sm font-black uppercase tracking-widest text-deepblue/30 mb-2">Current Season</h2>
                       <div className="text-5xl lg:text-6xl font-paytone text-deepblue tracking-tighter drop-shadow-sm">{profileData.profile.rank}</div>
                       <div className="flex items-center gap-3 mt-3">
                            <span className="bg-mint text-white text-xs font-black px-3 py-1 rounded shadow-sm tracking-widest uppercase">Season 1</span>
                            
                            {/* Always show LP if not unranked */}
                            {profileData.profile.rank !== "Unranked" && (
                                <span className="text-deepblue/60 font-bold text-sm bg-deepblue/5 px-3 py-1 rounded-lg">
                                    {profileData.profile.lp_in_division} LP
                                </span>
                            )}
                       </div>
                   </div>
                   
                   <div 
                     className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 opacity-90 drop-shadow-2xl [&>svg]:w-full [&>svg]:h-full transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 z-0"
                     dangerouslySetInnerHTML={{ __html: getRankIcon() }}
                   />
                   <div className="absolute -right-20 -top-20 w-96 h-96 bg-mint/5 rounded-full blur-3xl pointer-events-none"/>
               </div>

               {/* 3. Stats Grid (Bottom Right) */}
               <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-deepblue/5 border border-white flex flex-col justify-center relative overflow-hidden">
                    <h3 className="text-xs font-black uppercase tracking-widest text-deepblue/30 mb-8 absolute top-8 left-8">Performance</h3>
                    <div className="flex items-center justify-center h-full pt-6">
                        <div className="relative w-40 h-40 shrink-0">
                            <PieChart percent={profileData.stats.unrated_winrate} color="#FF6B6B" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-paytone text-deepblue tracking-tighter">{profileData.stats.unrated_winrate}%</span>
                                <span className="text-[10px] font-bold text-deepblue/40 uppercase tracking-widest">Winrate</span>
                            </div>
                        </div>
                        <div className="ml-8 flex flex-col gap-2">
                             <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 rounded-full bg-mint"></div>
                                 <span className="text-sm font-bold text-deepblue">{profileData.stats.unrated_wins} Wins</span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 rounded-full bg-coral"></div>
                                 <span className="text-sm font-bold text-deepblue">{profileData.stats.unrated_losses} Losses</span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                                 <span className="text-sm font-bold text-deepblue">{profileData.stats.unrated_draws} Draws</span>
                             </div>
                        </div>
                    </div>
               </div>

               <div className="lg:col-span-3 bg-deepblue rounded-[2.5rem] p-8 shadow-xl shadow-deepblue/10 flex flex-col items-center justify-center text-center text-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50"/>
                    <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-mint/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"/>
                    
                    <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-2 relative z-10">Total Games</h3>
                    <div className="text-7xl font-paytone relative z-10">{profileData.stats.total_games_played}</div>
                    <div className="text-xs font-bold opacity-40 mt-2 max-w-[100px] leading-tight relative z-10">Matches played all-time</div>
               </div>

           </div>
        ) : (
           <div className="text-center py-20 text-red-500 font-bold bg-white/50 rounded-3xl shadow-lg">
               Cannot load profile. Please try again.
           </div>
        )}
      </div>

       {/* Top-Level Settings Modal */}
       {isOwner && showSettings && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-deepblue/40 backdrop-blur-md animate-fadeIn" 
                    onClick={() => setShowSettings(false)} 
                />
                <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-8 md:p-12 animate-slideUp border border-white z-10">
                    <div className="flex items-center justify-between mb-8">
                         <div>
                            <h2 className="text-3xl font-paytone text-deepblue">Edit Profile</h2>
                            <p className="text-deepblue/50 font-bold text-sm">Update your personal details</p>
                         </div>
                        <button 
                            onClick={() => setShowSettings(false)} 
                            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all hover:rotate-90 text-deepblue"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-deepblue/30 ml-4">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-deepblue/10 focus:ring-4 focus:ring-deepblue/5 outline-none transition-all font-bold text-deepblue text-lg placeholder:font-medium placeholder:text-slate-300"
                                    placeholder="First Name"
                                />
                            </div>
                             <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-deepblue/30 ml-4">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-deepblue/10 focus:ring-4 focus:ring-deepblue/5 outline-none transition-all font-bold text-deepblue text-lg placeholder:font-medium placeholder:text-slate-300"
                                    placeholder="Last Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-deepblue/30 ml-4">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-deepblue/10 focus:ring-4 focus:ring-deepblue/5 outline-none transition-all font-bold text-deepblue text-lg placeholder:font-medium placeholder:text-slate-300"
                                    placeholder="Email"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-deepblue/30 ml-4">Phone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-deepblue/10 focus:ring-4 focus:ring-deepblue/5 outline-none transition-all font-bold text-deepblue text-lg placeholder:font-medium placeholder:text-slate-300"
                                    placeholder="+36..."
                                />
                            </div>
                        </div>
                        
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-5 rounded-2xl bg-deepblue text-white font-paytone text-xl shadow-xl shadow-deepblue/20 hover:bg-deepblue/90 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                            >
                                {saving ? "Saving Changes..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
             </div>
        )}
    </div>
  );
}

function PieChart({ percent, color }: { percent: number; color: string }) {
    const size = 100;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 origin-center overflow-visible">
            <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
            <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
            />
        </svg>
    )
}
