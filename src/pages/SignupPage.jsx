import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../api";
import { Mail, Lock, User, Briefcase, Loader2, AlertCircle, Check, Building2, Eye, EyeOff } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";

function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    referral_code: "", // Add referral code
    role: "free", // 'free' (individual) or 'enterprise' (business)
    company_name: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Map frontend role selection to backend expected fields
      const payload = {
        name: formData.username,
        email: formData.email,
        password: formData.password,
        account_type: formData.role === 'enterprise' ? 'company' : 'individual',
        company_name: formData.role === 'enterprise' ? formData.company_name : undefined,
        referral_code: formData.referral_code || undefined
      };

      await signupUser(payload);
      // Redirect to verification
      navigate(`/verify-email`, { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const AccountTypeCard = ({ id, icon: Icon, title, description, badge }) => {
    const isSelected = formData.role === id;
    return (
      <div
        onClick={() => setFormData({ ...formData, role: id })}
        className={`relative p-4 pr-9 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
          isSelected
            ? "border-indigo-600 bg-indigo-50 shadow-md"
            : "border-gray-200 hover:border-indigo-200 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
             <Icon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
                <h4 className={`text-sm font-bold ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>{title}</h4>
                 {badge && <span className="text-[10px] uppercase font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{badge}</span>}
            </div>
            <p className={`text-xs mt-1 ${isSelected ? 'text-indigo-700' : 'text-gray-500'}`}>{description}</p>
          </div>
        </div>
        {isSelected && (
          <div className="absolute top-2 right-2 text-indigo-600">
             <Check size={18} />
          </div>
        )}
      </div>
    );
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start issuing verifiable credentials in minutes."
      linkText="Sign in"
      linkTo="/login"
      linkLabel="Already have an account?"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4">
             <AccountTypeCard 
                id="free"
                icon={User}
                title="Personal"
                description="For individuals."
             />
             <AccountTypeCard 
                id="enterprise"
                icon={Briefcase}
                title="Business"
                description="For organizations."
             />
        </div>

        <div className="space-y-4">
          
          {/* Company Name Field - Only for Business */}
          {formData.role === 'enterprise' && (
             <div className="animate-in fade-in slide-in-from-top-2">
                <label
                  htmlFor="company_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Organization Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Building2 size={18} />
                  </div>
                  <input
                    id="company_name"
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow sm:text-sm"
                    placeholder="Acme Inc."
                  />
                </div>
             </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {formData.role === 'enterprise' ? 'Admin Full Name' : 'Full Name'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                id="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow sm:text-sm"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Work Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow sm:text-sm"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow sm:text-sm"
                placeholder="••••••••"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
             <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters.</p>
          </div>

          <div>
            <label
              htmlFor="referral_code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Referral Code (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Briefcase size={18} />
              </div>
              <input
                id="referral_code"
                type="text"
                value={formData.referral_code}
                onChange={(e) =>
                  setFormData({ ...formData, referral_code: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow sm:text-sm"
                placeholder="R-123456"
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
            "Create Account"
          )}
        </button>
        
        <p className="text-xs text-center text-gray-500 mt-4">
             By creating an account, you agree to our <a href="#" className="underline hover:text-indigo-600">Terms of Service</a> and <a href="#" className="underline hover:text-indigo-600">Privacy Policy</a>.
        </p>
      </form>
    </AuthLayout>
  );
}

export default SignupPage;
