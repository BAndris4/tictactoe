interface HotStreakBannerProps {
  streak: number;
}

export default function HotStreakBanner({ streak }: HotStreakBannerProps) {
  if (streak < 3) return null;

  return (
    <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center justify-between group animate-pulse">
      <div className="flex items-center gap-3">
        <div className="text-2xl">🔥</div>
        <div>
          <div className="text-xs font-black text-orange-600 uppercase tracking-wider">Hot Streak</div>
          <div className="text-[10px] font-bold text-orange-400">Earning bonus LP while on Hot Streak!</div>
        </div>
      </div>
      <div className="text-xl font-black text-orange-500 font-paytone decoration-mint decoration-wavy underline-offset-4">EXTRA LP</div>
    </div>
  );
}
