import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyEmail, resendVerificationEmail } from "../api";
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";

function VerifyEmailPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(state?.email || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    // If no email provided, redirect to login
    if (!state?.email) {
      navigate("/login");
    }
  }, [state, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyLoading(true);
    setError("");
    setSuccess("");

    try {
      await verifyEmail({ email, verification_code: code });
      setSuccess("Email verification successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.msg || "Verification failed. Please check the code."
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      await resendVerificationEmail(email);
      setSuccess("A new verification code has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We've sent a 6-digit verification code to ${email}. Please enter it below.`}
    >
      <form onSubmit={handleVerify} className="space-y-6">
        {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
        )}

        {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-green-700 font-medium">{success}</p>
            </div>
        )}

        <div className="space-y-5">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Verification Code
            </label>
            <div className="relative">
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                required
                className="block w-full text-center tracking-[0.5em] text-2xl font-mono py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 text-center">Enter the 6-digit code sent to your email.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={verifyLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
        >
          {verifyLoading ? (
             <Loader2 className="animate-spin h-5 w-5" />
          ) : (
             <span className="flex items-center gap-2">Verify Email <ArrowRight size={16} /></span>
          )}
        </button>

        <div className="text-center mt-6">
             <p className="text-sm text-gray-600">
                 Didn't receive the code?{' '}
                 <button 
                    type="button" 
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                     {resendLoading ? 'Sending...' : 'Resend code'}
                 </button>
             </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default VerifyEmailPage;
