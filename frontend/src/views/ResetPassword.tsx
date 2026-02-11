import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BackgroundShapes from "../components/ui/BackgroundShapes";
import PasswordField from "../components/auth/PasswordField";
import { authApi } from "../api/auth";
import { getPasswordChecks } from "../rules/validation";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const passwordChecks = getPasswordChecks(password);
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Missing token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !isPasswordValid || !passwordsMatch) return;

    setLoading(true);
    setError("");
    try {
      await authApi.confirmPasswordReset(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired.");
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
              Reset Password
            </h1>
            
            {!success ? (
              <>
                <p className="mb-6 text-[13px] text-[#6B7280]">
                  Please enter your new password below.
                </p>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <PasswordField 
                    label="New Password" 
                    value={password} 
                    onChange={setPassword} 
                    mode="register"
                    disabled={loading || !token}
                    checks={passwordChecks}
                  />

                  <PasswordField 
                    label="Confirm New Password" 
                    value={confirmPassword} 
                    onChange={setConfirmPassword} 
                    mode="login" // Using login mode to hide the complexity checks for the confirmation field
                    disabled={loading || !token}
                  />

                  {confirmPassword && !passwordsMatch && (
                    <p className="text-[11px] text-[#F16063] mt-1 font-medium">
                      Passwords do not match.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !token || !isPasswordValid || !passwordsMatch}
                    className="group relative mt-6 inline-flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-deepblue text-sm font-bold text-white shadow-md shadow-deepblue/20 transition-all duration-300 hover:bg-deepblue/90 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed font-paytone tracking-wide"
                  >
                    <span className="relative z-10">
                      {loading ? "Resetting..." : "Update Password"}
                    </span>
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  ✓
                </div>
                <h2 className="text-lg font-bold text-deepblue mb-2">Success!</h2>
                <p className="text-[14px] text-[#4B5563] mb-6 font-medium">
                  Your password has been successfully updated. Redirecting you to login...
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-2 bg-deepblue text-white rounded-xl font-bold text-sm shadow-lg shadow-deepblue/20 transition"
                >
                  Go to Login Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
