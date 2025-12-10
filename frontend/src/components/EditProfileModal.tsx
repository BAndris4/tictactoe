import { useState } from "react";
import type { UserProfile } from "../data/mockProfile";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updatedUser: Partial<UserProfile>) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSave,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(user.username);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");

  const handleSave = () => {
    onSave({ username, firstName, lastName, email, phoneNumber });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 transform transition-all animate-fadeScaleIn max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-deepblue">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-deepblue/60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
                <label htmlFor="username" className="text-sm font-semibold text-deepblue ml-1">Username</label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-deepblue/10 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-mint focus:border-transparent outline-none transition-all font-medium text-deepblue"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label htmlFor="firstName" className="text-sm font-semibold text-deepblue ml-1">First Name</label>
                    <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-deepblue/10 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-mint focus:border-transparent outline-none transition-all font-medium text-deepblue"
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="lastName" className="text-sm font-semibold text-deepblue ml-1">Last Name</label>
                    <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-deepblue/10 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-mint focus:border-transparent outline-none transition-all font-medium text-deepblue"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-semibold text-deepblue ml-1">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-deepblue/10 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-mint focus:border-transparent outline-none transition-all font-medium text-deepblue"
                />
            </div>

             <div className="space-y-1">
                <label htmlFor="phone" className="text-sm font-semibold text-deepblue ml-1">Phone Number</label>
                <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-deepblue/10 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-mint focus:border-transparent outline-none transition-all font-medium text-deepblue"
                    placeholder="+36 30 123 4567"
                />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-deepblue/10 font-semibold text-deepblue/70 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl bg-deepblue font-semibold text-white shadow-lg shadow-deepblue/20 hover:bg-deepblue/90 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
