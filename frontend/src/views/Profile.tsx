import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../api/auth";
import { useToast } from "../context/ToastContext";
import BackgroundShapes from "../components/BackgroundShapes";
import TopBar from "../components/layout/TopBar";

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading, refetch } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhone(user.phoneNumber || "");
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateMe({
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone
      });
      await refetch();
      showToast("Profile updated successfully!", "success");
      navigate("/");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="relative min-h-screen bg-[#F3F4FF] text-deepblue font-inter overflow-hidden p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <BackgroundShapes />
      <TopBar />

      <div className="relative z-10 w-full max-w-2xl mx-auto animate-fadeScaleIn">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-deepblue/5 border border-white p-8 md:p-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-paytone text-deepblue mb-2">Edit Profile</h1>
              <p className="text-deepblue/40 text-sm font-medium">Customize your appearance and personal info</p>
            </div>
            <button
                onClick={() => navigate("/")}
                className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-deepblue/40 hover:text-deepblue hover:border-deepblue/10 transition-all shadow-sm group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-deepblue/30 ml-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-mint/10 focus:border-mint/30 outline-none transition-all font-bold text-deepblue placeholder:text-deepblue/20"
                  placeholder="Your unique username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-deepblue/30 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-sunshine/10 focus:border-sunshine/30 outline-none transition-all font-bold text-deepblue placeholder:text-deepblue/20"
                  placeholder="Email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-deepblue/30 ml-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-deepblue/5 focus:border-deepblue/10 outline-none transition-all font-bold text-deepblue placeholder:text-deepblue/20"
                  placeholder="First name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-deepblue/30 ml-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-deepblue/5 focus:border-deepblue/10 outline-none transition-all font-bold text-deepblue placeholder:text-deepblue/20"
                  placeholder="Last name"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-deepblue/30 ml-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-mint/10 focus:border-mint/30 outline-none transition-all font-bold text-deepblue placeholder:text-deepblue/20"
                  placeholder="+36 30 123 4567"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 py-5 rounded-2xl bg-slate-100 text-deepblue font-paytone text-sm hover:bg-slate-200 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-[2] py-5 rounded-2xl bg-deepblue text-white font-paytone text-sm shadow-xl shadow-deepblue/20 hover:bg-deepblue/90 transition-all hover:-translate-y-1 active:scale-95 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
