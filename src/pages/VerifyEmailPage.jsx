import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { verifyEmail, resendVerificationEmail } from "../api";
import { CheckCircle, AlertCircle, Loader2, ArrowRight, Mail, Edit3 } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";

function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract email from React Router state or URL query parameter (?email=...)
  const queryParams = new URLSearchParams(location.search);
  const queryEmail = queryParams.get("email");
  const initialEmail = (location.state?.email || queryEmail || "").trim();

  const [email, setEmail] = useState(initialEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(!initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const codeInputRef = useRef(null);

  useEffect(() => {
    // If we have an email and not editing, focus code input
    if (email && !isEditingEmail) {
      codeInputRef.current?.focus();
    }
  }, [email, isEditingEmail]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanCode = code.trim();

    if (!cleanEmail) {
      setError("Please provide your email address.");
      setIsEditingEmail(true);
      return;
    }

    if (cleanCode.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setVerifyLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await verifyEmail({ email: cleanEmail, verification_code: cleanCode });
      const token = res.data?.access_token;

      if (token) {
        localStorage.setItem("token", token);
        setSuccess("Email verified successfully! Logging you in...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1200);
      } else {
        setSuccess("Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.msg || "Verification failed. Please check the code and try again."
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your email address to receive a verification code.");
      setIsEditingEmail(true);
      return;
    }

    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await resendVerificationEmail(cleanEmail);
      setSuccess(res.data?.msg || "A new verification code has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the 6-digit code sent to your email address to activate your account."
      linkText="Sign in"
      linkTo="/login"
      linkLabel="Already verified?"
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

        {/* Email Display / Input Field */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          {isEditingEmail ? (
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Sending code to</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingEmail(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline shrink-0 ml-2"
              >
                <Edit3 size={13} />
                <span>Change</span>
              </button>
            </div>
          )}
        </div>

        {/* 6-Digit Code Input */}
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1.5">
            Verification Code
          </label>
          <div className="relative">
            <input
              ref={codeInputRef}
              id="code"
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").substring(0, 6))}
              required
              className="block w-full text-center tracking-[0.5em] text-2xl font-mono py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              placeholder="000000"
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 text-center">
            Enter the 6-digit code sent to your inbox (check spam folder if not found).
          </p>
        </div>

        <button
          type="submit"
          disabled={verifyLoading || code.length < 6}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
        >
          {verifyLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <span className="flex items-center gap-2">
              Verify Account <ArrowRight size={16} />
            </span>
          )}
        </button>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="font-semibold text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {resendLoading ? "Sending..." : "Resend code"}
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default VerifyEmailPage;
