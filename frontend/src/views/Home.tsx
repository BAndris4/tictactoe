
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OShape from "../assets/O.svg";
import XShape from "../assets/X.svg";
import { useAuth } from "../hooks/useAuth";

type Parallax = {
  x: number;
  y: number;
};


export default function Landing() {
  const [parallax, setParallax] = useState<Parallax>({ x: 0, y: 0 });
  const { user, loading, error, logout } = useAuth();
  const navigate = useNavigate();

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
    left: "-20%",
    top: "-50%",
    transform: `translate3d(${parallax.x * 30}px, ${parallax.y * 20}px, 0)`,
  };

  const xStyle: React.CSSProperties = {
    right: "-20%",
    bottom: "-35%",
    rotate: "20deg",
    transform: `translate3d(${parallax.x * -40}px, ${
      parallax.y * -25
    }px, 0) rotate(${parallax.x * 5}deg)`,
  };

  const handlePlayGame = () => {
    navigate("/game");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3F4FF]">
      <div
        className="pointer-events-none fixed transition-transform duration-200 ease-out"
        style={oStyle}
      >
        <img src={OShape} alt="O-shape" className="w-[1200px]" />
      </div>

      <div
        className="pointer-events-none fixed transition-transform duration-200 ease-out"
        style={xStyle}
      >
        <img src={XShape} alt="X-shape" className="w-[1100px]" />
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-40px)] items-center justify-center px-4 py-6">
        <div className="w-full max-w-md rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur">
          <h1 className="mb-2 text-center text-3xl font-semibold text-slate-900">
            Ultimate Tic-Tac-Toe
          </h1>
          <p className="mb-6 text-center text-sm text-slate-600">
            Gondolkodj előre, urald a táblát és győzd le az ellenfeledet!
          </p>

          <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {loading && <p>Felhasználói adatok betöltése…</p>}

            {!loading && error && (
              <p className="text-red-600">
                {error} (a gombok ettől függetlenül működhetnek)
              </p>
            )}

            {!loading && !error && user && (
              <>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Bejelentkezve
                </p>
                <p className="mb-2">
                  Üdv,{" "}
                  <span className="font-semibold">
                    {user.username ?? "ismeretlen felhasználó"}
                  </span>
                  !
                </p>
                <pre className="max-h-40 overflow-auto rounded-xl bg-white px-3 py-2 text-xs text-slate-700">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </>
            )}

            {!loading && !error && !user && (
              <>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nem vagy bejelentkezve
                </p>
                <p className="text-sm text-slate-600">
                  Jelentkezz be, hogy elmenthessük a játékaidat és az
                  eredményeidet.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={handlePlayGame}
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Play game
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
