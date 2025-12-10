import LoginCard from "../components/auth/LoginCard";
import BackgroundShapes from "../components/BackgroundShapes";

export default function Login() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3F4FF] font-inter">
      <BackgroundShapes />
      
       <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-deepblue/5 rounded-full blur-[100px] pointer-events-none"></div>
       <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mint/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex min-h-[calc(100vh-40px)] items-center justify-center px-4 py-6">
        <LoginCard />
      </div>
    </div>
  );
}
