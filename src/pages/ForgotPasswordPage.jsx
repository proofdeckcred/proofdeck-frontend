import React, { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await requestPasswordReset(email);
      setMessage("If an account exists for that email, we have sent password reset instructions.");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
        )}

        {message && (
             <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-green-700 font-medium">{message}</p>
            </div>
        )}

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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow sm:text-sm"
                placeholder="you@example.com"
              />
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
            "Send Reset Link"
          )}
        </button>

        <div className="text-center mt-4">
             <Link to="/login" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                <ArrowLeft size={16} /> Back to Sign In
             </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
