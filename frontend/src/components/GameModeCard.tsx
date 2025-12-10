import type { ReactNode } from "react";

interface GameModeCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  layout?: "vertical" | "horizontal";
  className?: string;
  iconBgClass?: string;
}

export default function GameModeCard({
  title,
  description,
  icon,
  onClick,
  layout = "vertical",
  className = "",
  iconBgClass = "bg-slate-100 text-deepblue",
}: GameModeCardProps) {
  if (layout === "horizontal") {
    return (
      <div
        className={`flex-1 bg-white rounded-[2rem] p-6 flex flex-row items-center gap-4 group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all shadow-lg shadow-deepblue/5 border border-white ${className}`}
        onClick={onClick}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 ${iconBgClass}`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-deepblue font-paytone">
            {title}
          </h3>
          <p className="text-sm text-deepblue/60 font-inter">{description}</p>
        </div>
      </div>
    );
  }


  return (
    <div
      className={`md:col-span-1 bg-white rounded-[2rem] p-6 relative group overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all shadow-lg shadow-deepblue/5 border border-white flex flex-col items-center justify-center text-center gap-4 ${className}`}
      onClick={onClick}
    >
      <div
        className={`p-4 rounded-2xl group-hover:scale-110 transition-transform mb-2 ${iconBgClass}`}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-deepblue font-paytone tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-deepblue/60 font-medium mt-1 font-inter">
          {description}
        </p>
      </div>
    </div>
  );
}
