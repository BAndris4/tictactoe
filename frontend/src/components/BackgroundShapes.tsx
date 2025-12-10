import { useEffect, useState } from "react";
import OShape from "../assets/O.svg";
import XShape from "../assets/X.svg";

type Parallax = {
  x: number;
  y: number;
};

type Props = {
  activePlayer?: "X" | "O";
};

export default function BackgroundShapes({ activePlayer }: Props) {
  const [parallax, setParallax] = useState<Parallax>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX / innerWidth - 0.5) * 2;
      const normY = (e.clientY / innerHeight - 0.5) * 2;
      setParallax({ x: normX, y: normY });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const oStyle: React.CSSProperties = {
    transform: `translate3d(${parallax.x * 30}px, ${parallax.y * 20}px, 0)`,
  };

  const xStyle: React.CSSProperties = {
    transform: `translate3d(${parallax.x * -40}px, ${parallax.y * -25}px, 0) rotate(${parallax.x * 5}deg)`,
  };

  return (
    <>
      <div
        className={`pointer-events-none fixed transition-all duration-300 ease-out z-0 
          w-[150vw] sm:w-[120vw] md:w-[1000px] lg:w-[1200px]
          -left-[40%] sm:-left-[20%] md:-left-[10%] lg:-left-[20%]
          top-[-10%] sm:top-[-20%] md:top-[-30%] lg:top-[-50%]
          ${
            activePlayer
              ? activePlayer === "O"
                ? "grayscale-0 brightness-100 opacity-70"
                : "grayscale brightness-75 opacity-20"
              : "opacity-40"
          }`}
        style={oStyle}
      >
        <img src={OShape} alt="O-shape" className="w-full h-full" />
      </div>

      <div
        className={`pointer-events-none fixed transition-all duration-300 ease-out z-0 
          w-[140vw] sm:w-[110vw] md:w-[900px] lg:w-[1100px]
          -right-[30%] sm:-right-[15%] md:-right-[10%] lg:-right-[20%]
          bottom-[-10%] sm:bottom-[-20%] md:bottom-[-30%] lg:bottom-[-35%]
          rotate-12 lg:rotate-20
          ${
            activePlayer
              ? activePlayer === "X"
                ? "grayscale-0 brightness-100 opacity-70"
                : "grayscale brightness-75 opacity-20"
              : "opacity-40"
          }`}
        style={xStyle}
      >
        <img src={XShape} alt="X-shape" className="w-full h-full" />
      </div>
    </>
  );
}
