import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import EditProfileModal from "../components/EditProfileModal";
import type { UserProfile } from "../data/mockProfile";
import BackgroundShapes from "../components/BackgroundShapes";
import UnrankedIconRaw from "../assets/unranked.svg?raw";
import AiIconRaw from "../assets/ai.svg?raw";
import CustomIconRaw from "../assets/custom.svg?raw";
import LocalIcon from "../assets/local.svg";
import LandingProfileCard from "../components/LandingProfileCard";
import RankedGameCard from "../components/RankedGameCard";
import GameModeCard from "../components/GameModeCard";
import { useAuth } from "../hooks/useAuth";

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading, logout, setUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  const handleSaveProfile = (updatedData: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
    }
  };

  if (loading || !user) return null;

  return (
    <div className="relative min-h-screen bg-[#F3F4FF] text-deepblue font-inter overflow-hidden p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <BackgroundShapes />

      <div className="relative z-10 w-full max-w-7xl mx-auto h-full grid grid-cols-1 md:grid-cols-4 grid-rows-[auto_auto_auto] md:grid-rows-[minmax(300px,auto)_auto] gap-4 md:gap-6 animate-fadeScaleIn">

        <LandingProfileCard
          user={user}
          onEdit={() => setIsEditModalOpen(true)}
          onHistory={() => navigate("/history")}
          onLogout={logout}
        />


        <GameModeCard
          title="Unranked"
          description="Casual Friendly Game"
          icon={
            <div
              className="w-10 h-10 text-current [&>svg]:w-full [&>svg]:h-full [&_path]:!stroke-current"
              dangerouslySetInnerHTML={{ __html: UnrankedIconRaw }}
            />
          }
          onClick={() => {}}
          iconBgClass="bg-coral/10 text-coral"
        />


        <RankedGameCard onClick={() => {}} />


        <GameModeCard
          title="Play Against AI"
          description="Training Ground"
          icon={
            <div
              className="w-10 h-10 text-current [&>svg]:w-full [&>svg]:h-full [&_path]:!fill-current"
              dangerouslySetInnerHTML={{ __html: AiIconRaw }}
            />
          }
          onClick={() => {}}
          iconBgClass="bg-purple-100 text-purple-600"
        />


        <div className="md:col-span-3 flex flex-col md:flex-row gap-4 md:gap-6">

          <GameModeCard
            title="Custom Game"
            description="Invite a friend"
            layout="horizontal"
            icon={
              <div
                className="w-6 h-6 text-current [&>svg]:w-full [&>svg]:h-full [&_path]:!stroke-current"
                dangerouslySetInnerHTML={{ __html: CustomIconRaw }}
              />
            }
            onClick={() => {}}
            iconBgClass="bg-sunshine/10 text-sunshine"
          />


          <GameModeCard
            title="Local Game"
            description="Offline play"
            layout="horizontal"
            icon={
              <img
                src={LocalIcon}
                alt="Local Game"
                className="w-6 h-6 object-contain opacity-80"
              />
            }
            onClick={() => navigate("/game")}
            iconBgClass="bg-blue-500/10 text-blue-500"
          />
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
