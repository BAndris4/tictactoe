import RankedIconRaw from "../assets/ranked.svg?raw";

interface RankedGameCardProps {
  onClick: () => void;
}

export default function RankedGameCard({ onClick }: RankedGameCardProps) {
  return (
    <div
      className="md:col-span-1 bg-white rounded-[2rem] p-6 relative group overflow-hidden cursor-pointer shadow-2xl shadow-mint/20 border-2 border-mint/20 flex flex-col items-center justify-center text-center gap-4 hover:scale-[1.03] transition-all duration-300 z-10"
      onClick={onClick}
    >
      <div className="absolute top-3 right-3">
        <span className="bg-mint text-white text-[10px] font-black px-2 py-1 rounded shadow-sm tracking-widest font-paytone">
          SEASON 1
        </span>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mint/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="p-4 bg-mint/10 rounded-2xl text-mint group-hover:scale-110 transition-transform mb-2 shadow-inner">
        <div
          className="w-12 h-12 text-current [&>svg]:w-full [&>svg]:h-full [&_path]:!stroke-current"
          dangerouslySetInnerHTML={{ __html: RankedIconRaw }}
        />
      </div>
      <div>
        <h3 className="text-3xl font-black text-deepblue tracking-tight font-paytone">
          Ranked
        </h3>
        <p className="text-sm text-deepblue/60 font-medium mt-1 font-inter">
          Competitive Ladder
        </p>
      </div>
      <div className="mt-2 text-xs font-bold text-mint bg-mint/10 px-3 py-1 rounded-full opacity-100 font-paytone tracking-wide">
        PLAY NOW
      </div>
    </div>
  );
}
