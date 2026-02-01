import { useNavigate } from "react-router-dom";

interface Props {
  onExit?: () => void;
}

export default function GameSidebar({ onExit }: Props) {
  const navigate = useNavigate();

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="w-full flex-shrink-0">
      {/* Exit Button */}
      <button 
        onClick={handleExit}
        className="w-full flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-deepblue px-6 py-4 rounded-2xl font-bold shadow-sm transition-all hover:scale-[1.01] active:scale-95 border border-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 1.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H7a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Exit Game
      </button>
    </div>
  );
}
