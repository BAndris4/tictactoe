// useMemo removed as it was unused
// Removed fontPaytone as it was unused and the import was wrong

interface RankStatsGridProps {
  lpStats: {
    day: number;
    month: number;
    all: number;
  };
}

export default function RankStatsGrid({ lpStats }: RankStatsGridProps) {
  const stats = [
    { label: "24h Gained", value: lpStats.day },
    { label: "30d Gained", value: lpStats.month },
    { label: "Total LP", value: lpStats.all }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-50 flex flex-col items-center justify-center group hover:-translate-y-1 transition-transform relative overflow-hidden"
        >
          <span className="text-[9px] font-black text-deepblue/30 uppercase tracking-tighter mb-1">
            {stat.label}
          </span>
          <span className={`text-lg font-black font-paytone ${stat.value >= 0 ? 'text-mint' : 'text-coral'}`}>
            {stat.value >= 0 ? '+' : ''}{stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
