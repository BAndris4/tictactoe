
export default function CircularProgressBar({ 
  percentage, 
  size = 120, 
  strokeWidth = 4,
  level,
  currentXp,
  nextLevelXp,
  children
}: { 
  percentage: number; 
  size?: number; 
  strokeWidth?: number;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative group cursor-pointer" style={{ width: size, height: size }}>
      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-deepblue text-white text-xs py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100] font-bold shadow-lg border border-white/10">
          {currentXp} / {nextLevelXp} XP
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-deepblue" />
      </div>

      {/* SVG Circle */}
      <svg 
         width={size} 
         height={size} 
         className="transform -rotate-90 drop-shadow-sm"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9" // slate-100
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#4FD1C5"
          className="text-mint transition-all duration-1000 ease-out"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Inner Content (Avatar) */}
      <div className="absolute inset-0 flex items-center justify-center p-1">
         <div className="rounded-full overflow-hidden w-full h-full border-4 border-white shadow-inner flex items-center justify-center bg-slate-50">
             {children}
         </div>
      </div>
      
      {/* Level Badge */}
      <div className="absolute top-0 right-0 bg-mint text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm font-paytone tracking-wider z-10 transform translate-x-2 translate-y-0">
            LVL {level}
      </div>
    </div>
  );
}
