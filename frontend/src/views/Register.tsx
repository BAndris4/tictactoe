import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RegisterCard from "../components/auth/RegisterCard";
import BackgroundShapes from "../components/ui/BackgroundShapes";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, refetch } = useAuth();
  const [pendingTutorial, setPendingTutorial] = useState(false);

  const redirectPath = searchParams.get("redirect");

  const handleSuccess = (playTutorial?: boolean) => {
    if (playTutorial) {
      setPendingTutorial(true);
    }
    refetch();
  };

  useEffect(() => {
    if (!loading && user) {
      // Priority: 
      // 1. Tutorial (if selected during register)
      // 2. Explicit redirect param (e.g. back to game)
      // 3. Home
      if (pendingTutorial) {
        navigate("/tutorial");
      } else if (redirectPath && redirectPath !== "/") {
        navigate(redirectPath);
      } else {
        navigate("/");
      }
    }
  }, [user, loading, navigate, redirectPath, pendingTutorial]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3F4FF] font-inter">
      <BackgroundShapes />
      
       <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-deepblue/5 rounded-full blur-[100px] pointer-events-none"></div>
       <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mint/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex min-h-[calc(100vh-40px)] items-center justify-center px-4 py-6">
        <RegisterCard onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
