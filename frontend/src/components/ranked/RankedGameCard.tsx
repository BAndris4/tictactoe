import RankedIconRaw from "../../assets/ranked.svg?raw";
import type { UserProfile } from "../../data/mockProfile";

interface RankedGameCardProps {
  onClick: () => void;
  user?: UserProfile | null;
}

export default function RankedGameCard({ onClick, user }: RankedGameCardProps) {
  const profile = user?.profile;
  const showPreview = profile && profile.rank !== "Unranked";

  return (
    <div
      className="md:col-span-1 bg-white rounded-[2rem] p-6 relative group overflow-hidden cursor-pointer shadow-2xl shadow-mint/20 border-2 border-mint/20 flex flex-col items-center justify-center text-center gap-4 hover:scale-[1.03] transition-all duration-300 z-10"
      onClick={onClick}
    >
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
        <span className="bg-mint text-white text-[10px] font-black px-2 py-1 rounded shadow-sm tracking-widest font-paytone uppercase">
          Season 1
        </span>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mint/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="relative">
        <div className="p-4 bg-mint/10 rounded-2xl text-mint group-hover:scale-110 transition-transform mb-2 shadow-inner">
          <div
            className="w-12 h-12 text-current [&>svg]:w-full [&>svg]:h-full [&_path]:!stroke-current"
            dangerouslySetInnerHTML={{ __html: RankedIconRaw }}
          />
        </div>
      </div>

      <div>
        <h3 className="text-3xl font-black text-deepblue tracking-tight font-paytone">
          Ranked
        </h3>
        <p className="text-sm text-deepblue/60 font-black mt-1 font-inter uppercase tracking-tight">
          {showPreview ? `${profile.rank} • ${profile.lp_in_division} LP` : "Competitive Ladder"}
        </p>
      </div>
      <div className="mt-2 text-[10px] font-black text-mint bg-mint/10 px-4 py-1.5 rounded-full opacity-100 font-paytone tracking-wider group-hover:bg-mint group-hover:text-white transition-all shadow-sm">
        PLAY NOW
      </div>
    </div>
  );
}
