import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, resendVerificationEmail } from "../api";
import { useUser } from "../context/UserContext";
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const { refreshUser } = useUser();
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResendCode = async () => {
    const targetEmail = (unverifiedEmail || formData.email || "").trim();
    if (!targetEmail) return;

    setResending(true);
    setResendMessage("");
    try {
      const res = await resendVerificationEmail(targetEmail);
      setResendMessage(res.data?.msg || "A new 6-digit code has been sent to your email.");
    } catch (err) {
      setResendMessage(err.response?.data?.msg || "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setIsUnverified(false);
    setResendMessage("");

    const email = (
      document.getElementById("email")?.value || formData.email || ""
    ).trim();
    const password =
      document.getElementById("password")?.value || formData.password || "";

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const res = await loginUser({ email, password });
      const data = res.data;

      if (data && data.access_token) {
        localStorage.setItem("token", data.access_token);
        window.location.href = "/dashboard";
      } else {
        setError(data.msg || "Login failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      const isAccountUnverified =
        err.response?.data?.unverified ||
        err.response?.data?.msg?.toLowerCase().includes("not verified");

      if (isAccountUnverified) {
        setIsUnverified(true);
        setUnverifiedEmail(email);
        setError("");
      } else {
        setIsUnverified(false);
        const msg = err.response?.data?.msg || "Login failed. Please check your credentials.";
        setError(msg);
      }
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue managing your credentials."
      linkText="Create an account"
      linkTo="/signup"
      linkLabel="Don't have an account?"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {isUnverified ? (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-sm text-amber-900 font-bold">Account Not Verified</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Your account is registered but must be verified before you can sign in.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <Link
                to={`/verify-email?email=${encodeURIComponent(unverifiedEmail || formData.email)}`}
                state={{ email: unverifiedEmail || formData.email }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <span>Enter Verification Code</span>
                <ArrowRight size={13} />
              </Link>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {resending ? "Sending code..." : "Resend Code"}
              </button>
            </div>
            {resendMessage && (
              <p className="text-xs text-indigo-700 font-medium flex items-center gap-1 mt-1">
                <CheckCircle size={13} /> {resendMessage}
              </p>
            )}
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        ) : null}

        <div className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow sm:text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
