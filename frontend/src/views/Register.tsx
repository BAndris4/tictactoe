import { useEffect, useState } from "react";
import RegisterCard from "../components/auth/RegisterCard";
import OShape from "../assets/O.svg";
import XShape from "../assets/X.svg";

type Parallax = {
  x: number;
  y: number;
};

export default function Register() {
  const [parallax, setParallax] = useState<Parallax>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;

      const normX = (e.clientX / innerWidth - 0.5) * 2;
      const normY = (e.clientY / innerHeight - 0.5) * 2;

      setParallax({
        x: normX,
        y: normY,
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const oStyle: React.CSSProperties = {
    right: "-8%",
    bottom: "-65%",
    transform: `translate3d(${parallax.x * 30}px, ${parallax.y * 20}px, 0)`,
  };

  const xStyle: React.CSSProperties = {
    left: "-10%",
    top: "-25%",
    rotate: "-20deg",
    transform: `translate3d(${parallax.x * -40}px, ${
      parallax.y * -25
    }px, 0) rotate(${parallax.x * 5}deg)`,
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3F4FF]">
      <div
        className="pointer-events-none fixed transition-transform duration-200 ease-out"
        style={oStyle}
      >
        <img
          src={OShape}
          alt="O-shape"
          className="w-[1100px] max-w-none opacity-65"
        />
      </div>

      <div
        className="pointer-events-none fixed transition-transform duration-200 ease-out"
        style={xStyle}
      >
        <img
          src={XShape}
          alt="X-shape"
          className="w-[1100px] max-w-none opacity-75"
        />
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-40px)] items-center justify-center px-4 py-6">
        <RegisterCard />
      </div>
    </div>
  );
}
