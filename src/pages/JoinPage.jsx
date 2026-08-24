import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getInvitationDetails, acceptInvitation } from "../api";
import toast, { Toaster } from "react-hot-toast";
import { Spinner } from "react-bootstrap";
import { User, Lock, Building, ShieldCheck, AlertCircle } from "lucide-react";

function JoinPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviteDetails, setInviteDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [userExists, setUserExists] = useState(false); // We can check this if details load

  // Form states
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const res = await getInvitationDetails(token);
        setInviteDetails(res.data);
        // We'll call the api/login check or backend check if user exists under that email.
        // Actually, we can check if they have an account via a simple check or wait until submission,
        // but it is friendlier to see if they are a new or existing user.
        // Let's assume we can determine if they have an account by checking with a quick auth-check or backend update.
        // For simplicity, we can let them input their Name & Password. If they already have an account,
        // they can check a checkbox or the form can adapt. Let's make the form adapt dynamically:
        // if they enter their email, we know it's pre-filled. We can show both options:
        // "Since you already have a ProofDeck account, please enter your password to link your account."
        // Or show Name field if they are new.
        // Wait, how do we know if user exists? We can return "user_exists" boolean in GET /invite/<token>!
        // Let's update team.py to return "user_exists" in the details! That is so clean!
      } catch (err) {
        setErrorMsg(err.response?.data?.msg || "Invalid or expired invitation link.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return toast.error("Password is required.");
    if (!inviteDetails?.user_exists && !name) {
      return toast.error("Full name is required for new accounts.");
    }

    setSubmitting(true);
    const toastId = toast.loading("Processing onboarding...");
    try {
      const res = await acceptInvitation({
        token,
        name: inviteDetails?.user_exists ? undefined : name,
        password,
      });

      // Save token and log in
      localStorage.setItem("token", res.data.access_token);
      toast.success("Joined organization successfully!", { id: toastId });
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard");
        window.location.reload();
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to join organization.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Spinner animation="border" variant="indigo" className="mb-4" />
          <p className="text-slate-600 font-semibold">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Invitation Error</h2>
          <p className="text-slate-500 mb-6">{errorMsg}</p>
          <Link
            to="/login"
            className="inline-block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md shadow-indigo-100"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const isExistingUser = inviteDetails?.user_exists;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <Toaster position="top-right" />
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100/80 p-8 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
        
        <div className="text-center mb-8 mt-2">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <Building size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Join Organization</h2>
          <p className="text-slate-500 text-sm mt-1">
            You've been invited to join <span className="font-semibold text-slate-700">{inviteDetails?.company_name}</span> on ProofDeck.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4 mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Invited Email</p>
          <p className="text-sm font-semibold text-slate-800">{inviteDetails?.email}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-indigo-600 font-medium">
            <ShieldCheck size={14} />
            <span>Secure Invitation link</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isExistingUser && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-800 placeholder-slate-400 bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {isExistingUser ? "Account Password" : "Create Password"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder={isExistingUser ? "Enter your password to link" : "Choose a secure password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-800 placeholder-slate-400 bg-white"
              />
            </div>
            {isExistingUser && (
              <p className="text-[11px] text-slate-500 mt-1">
                An account already exists for this email. Enter your password to link and accept the invitation.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center mt-6 text-sm"
          >
            {submitting ? (
              <Spinner size="sm" />
            ) : isExistingUser ? (
              "Link Account & Join"
            ) : (
              "Create Account & Join"
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-500">
          Already have a different account?{" "}
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default JoinPage;
