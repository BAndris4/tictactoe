import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundShapes from "../components/BackgroundShapes";
import TextField from "../components/auth/TextField";
import { authApi } from "../api/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3F4FF] font-inter">
      <BackgroundShapes />
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-deepblue/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mint/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex min-h-[calc(100vh-40px)] items-center justify-center px-4 py-6 w-full">
        <div className="w-full max-w-sm bg-white px-9 py-10 rounded-[2rem] border border-white shadow-lg shadow-deepblue/5 transform transition-all relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="mb-2 text-[24px] font-bold text-deepblue tracking-tight font-paytone">
              Forgot Password
            </h1>
            
            {!sent ? (
              <>
                <p className="mb-6 text-[13px] text-[#6B7280]">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <TextField 
                    label="Email Address" 
                    type="email" 
                    value={email} 
                    onChange={setEmail} 
                    disabled={loading}
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="group relative mt-2 inline-flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-deepblue text-sm font-bold text-white shadow-md shadow-deepblue/20 transition-all duration-300 hover:bg-deepblue/90 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed font-paytone tracking-wide"
                  >
                    <span className="relative z-10">
                      {loading ? "Sending..." : "Send Reset Link"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="w-full text-center text-[12px] text-[#6B7280] hover:text-deepblue transition mt-4"
                  >
                    Back to Login
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  ✓
                </div>
                <p className="text-[14px] text-[#4B5563] mb-6 font-medium">
                  If an account exists for <b>{email}</b>, you will receive a password reset link shortly.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition"
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
