interface GameEndStatusBannersProps {
  shield: number;
  placementGames: number;
  streak: number;
  lpChange: number;
}

export default function GameEndStatusBanners({ shield, placementGames, streak, lpChange }: GameEndStatusBannersProps) {
  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      {shield > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1 bg-red-50 px-3 py-1 rounded-full border border-red-100 animate-pulse">
            <div className="flex gap-0.5 items-center mr-1">
              {[...Array(3)].map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 ${i < shield ? 'text-red-500' : 'text-red-200'}`}>
                  <path fillRule="evenodd" d="M10.338 1.59a.75.75 0 00-.676 0l-6.25 3a.75.75 0 00-.362.648v5.5c0 3.03 1.906 5.757 4.661 6.84a.75.75 0 00.578 0c2.755-1.083 4.661-3.81 4.661-6.84v-5.5a.75.75 0 00-.362-.648l-6.25-3zM10 3.178l4.75 2.28v4.792c0 2.21-1.385 4.198-3.374 4.98a.75.75 0 00-.022.007L10 15.792l-.354-.555a.75.75 0 00-.022-.007c-1.99-.782-3.374-2.77-3.374-4.98V5.458L10 3.178z" clipRule="evenodd" />
                </svg>
              ))}
            </div>
            <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">Shield Protected</span>
          </div>
          <span className="text-[9px] font-bold text-red-400 uppercase tracking-tighter">No LP reduction for shield active</span>
        </div>
      )}

      {placementGames <= 10 && (
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Placement Phase: {placementGames}/10
        </span>
      )}

      {streak >= 3 && lpChange > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 animate-bounce">
            <span className="text-sm">🔥</span>
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider">Hot Streak Bonus</span>
          </div>
          <span className="text-[9px] font-bold text-orange-400 uppercase tracking-tighter">Earning bonus LP while on Hot Streak!</span>
        </div>
      )}
    </div>
  );
}
