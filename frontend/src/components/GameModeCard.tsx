interface GameModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  colorClass?: string;
  disabled?: boolean;
}

export default function GameModeCard({
  title,
  description,
  icon,
  onClick,
  colorClass = "bg-white",
  disabled = false,
}: GameModeCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative group flex flex-col justify-between items-start p-8 rounded-[2rem] transition-all duration-300 w-full h-full min-h-[220px] text-left border overflow-hidden ${
        disabled
          ? "opacity-60 cursor-not-allowed bg-slate-50 border-slate-200"
          : `${colorClass} border-transparent hover:scale-[1.02] hover:shadow-2xl hover:shadow-deepblue/10 cursor-pointer`
      }`}
    >
      {!disabled && (
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
      )}

      <div className="relative z-10 w-full">
        <div className={`w-14 h-14 mb-6 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
            disabled ? "bg-slate-200 text-slate-400" : "bg-white/90 text-deepblue backdrop-blur-md"
        }`}>
          {icon}
        </div>
        
        <h3 className={`text-2xl font-bold mb-3 tracking-tight ${disabled ? "text-slate-400" : "text-inherit"}`}>
            {title}
        </h3>
        
        <p className={`text-sm font-medium leading-relaxed max-w-[90%] ${
            disabled ? "text-slate-400" : "opacity-80"
        }`}>
          {description}
        </p>
      </div>

      {!disabled && (
        <div className="absolute bottom-8 right-8 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      )}
    </button>
  );
}
