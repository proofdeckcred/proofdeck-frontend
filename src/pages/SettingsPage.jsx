import React, { useState, useEffect, useCallback } from "react";
import PaystackPop from "@paystack/inline-js";
import { loadBachs } from "@bachs/js";

import {
  getCurrentUser,
  initializePayment as apiInitializePayment,
  verifyPayment,
  uploadUserSignature,
  generateApiKey,
  switchToCompany,
  getCanvaAuthUrl,
  getReferralStats,
  getTeamMembers,
  sendTeamInvite,
  cancelTeamInvite,
  removeTeamMember,
} from "../api";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { SERVER_BASE_URL } from "../config";
import { useUser } from "../context/UserContext";
import {
  User,
  CreditCard,
  Shield,
  Building,
  PenTool,
  UploadCloud,
  Check,
  Copy,
  LogOut,
  HelpCircle,
  Lock,
  Info,
  Key,
  CheckCircle,
  Link as LinkIcon,
  Gift,
  PlusCircle,
  Trash2,
  UserMinus,
  Mail,
  Globe,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Modal, Spinner, Button } from "react-bootstrap";

const Section = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 ${className}`}
  >
    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
        <Icon size={20} />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

const PLAN_INFO = {
  starter: {
    name: "Starter",
    priceNGN: "₦25,000",
    priceUSD: "$18.00",
    certs: "500",
    costPerCert: "₦50 (~$0.03)",
    description: "Ideal for workshops, bootcamps, and small cohorts.",
    features: [
      "500 Credits Included",
      "Unlimited Template Designs",
      "Secure Email Delivery",
      "High-Res PDF Downloads",
      "Basic Verification Portal",
    ],
  },
  growth: {
    name: "Growth",
    priceNGN: "₦60,000",
    priceUSD: "$42.00",
    certs: "2,000",
    costPerCert: "₦30 (~$0.02)",
    description: "Ideal for schools and training centers issuing regularly.",
    features: [
      "2,000 Credits Included",
      "Unlimited Template Designs",
      "Secure Email Delivery",
      "Priority Support Channel",
      "Basic Verification Portal",
    ],
  },
  pro: {
    name: "Pro",
    priceNGN: "₦100,000",
    priceUSD: "$70.00",
    certs: "5,000",
    costPerCert: "₦20 (~$0.014)",
    description: "For institutions needing automation and deeper integration.",
    features: [
      "5,000 Credits Included",
      "Everything in Growth",
      "Developer API Access",
      "Custom Logo & Branding",
      "Custom Domain URL",
    ],
  },
  enterprise: {
    name: "Enterprise",
    priceNGN: "₦300,000",
    priceUSD: "$200.00",
    certs: "20,000",
    costPerCert: "₦15 (~$0.01)",
    description: "For universities, exam bodies, and large organizations.",
    features: [
      "20,000 Credits Included",
      "Dedicated Account Manager",
      "SLA Support Guarantee",
      "Developer API Access",
      "Unlimited Webhooks & API",
    ],
  },
};

const PlanCard = ({
  planKey,
  onAction,
  current,
  disabled,
  loading,
}) => {
  const plan = PLAN_INFO[planKey];
  if (!plan) return null;

  return (
    <div
      className={`flex flex-col h-full p-6 rounded-xl border ${
        current
          ? "border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/50"
          : "border-gray-200 bg-white hover:border-indigo-300 shadow-sm hover:shadow-md"
      } transition-all`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
        {current && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-4 min-h-[32px]">{plan.description}</p>
      
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-gray-900">
            {plan.priceNGN}
          </span>
          <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
            {plan.priceUSD}
          </span>
        </div>
        <span className="text-gray-400 text-xs font-medium">/ one-time payment</span>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-5 flex justify-between items-center text-xs">
        <span className="text-gray-500 font-medium">Credits</span>
        <span className="font-bold text-gray-900">{plan.certs} certs</span>
      </div>

      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start text-xs text-gray-600">
            <Check
              size={14}
              className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => onAction(planKey)}
        disabled={disabled || loading}
        className={`w-full py-2.5 px-4 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-2 ${
          current
            ? "bg-indigo-700 text-white hover:bg-indigo-800 shadow-sm"
            : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
        }`}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : current ? (
          "Add Credits / Renew"
        ) : (
          <>
            <span>Choose {plan.name}</span>
            <ArrowRight size={13} />
          </>
        )}
      </button>
    </div>
  );
};


const ReferralSection = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getReferralStats();
        setStats(data);
      } catch (error) {
        toast.error("Failed to load referral data.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const copyToClipboard = () => {
    if (stats?.referral_code) {
      navigator.clipboard.writeText(stats.referral_code);
      toast.success("Referral code copied!");
    }
  };

  if (loading) return <div className="p-8 text-center"><Spinner animation="border" /></div>;

  return (
    <div className="space-y-6">
       <Section title="Invite & Earn" icon={Gift}>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white mb-8 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Give credits, Get credits</h2>
              <p className="text-indigo-100 mb-6 max-w-lg">
                Refer a friend to ProofDeck. When they verify their account, they get 5 bonus credits and you get 10!
              </p>
              
              <div className="bg-white/10 backdrop-blur-md p-1 pl-4 rounded-lg inline-flex items-center gap-4 border border-white/20">
                <span className="font-mono font-bold tracking-widest text-lg">{stats?.referral_code}</span>
                <button 
                  onClick={copyToClipboard}
                  className="bg-white text-indigo-600 px-3 py-1.5 rounded-md text-sm font-bold hover:bg-indigo-50 transition-colors"
                >
                  <Copy size={16} className="inline mr-1" /> Copy
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
               <p className="text-sm text-gray-500 mb-1">Total Referrals</p>
               <p className="text-2xl font-bold text-gray-900">{stats?.total_referrals}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
               <p className="text-sm text-gray-500 mb-1">Completed</p>
               <p className="text-2xl font-bold text-green-600">{stats?.completed_referrals}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
               <p className="text-sm text-gray-500 mb-1">Credits Earned</p>
               <p className="text-2xl font-bold text-indigo-600">{stats?.earned_credits}</p>
            </div>
          </div>
       </Section>
    </div>
  );
};

function SettingsPage() {
  const { user, refreshUser, workspace } = useUser();
  const [localUser, setLocalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [signatureFile, setSignatureFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState(null);
  const [isBachsLoading, setIsBachsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);
  const [isCanvaConnecting, setIsCanvaConnecting] = useState(false);

  // Team management states
  const [teamData, setTeamData] = useState({ members: [], invitations: [] });
  const [inviteEmail, setInviteEmail] = useState("");
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isFreeUser = user && user.role?.toLowerCase() === "free";
  const hasApiAccess =
    user && ["pro", "enterprise"].includes(user.role?.toLowerCase());
  const isCompanyUser = user && user.company;
  const isCanvaConnected = user && user.canva_access_token;
  const isCompanyOwner = user && user.company && user.company.active_role === "owner" && workspace !== "personal";
  const isCompanyAdmin = user && user.company && user.company.active_role === "admin" && workspace !== "personal";
  const isCompanyOwnerOrAdmin = isCompanyOwner || isCompanyAdmin;

  const fetchUser = async () => {
    try {
      const res = await getCurrentUser();
      setLocalUser(res.data);
      if (res.data.signature_image_url) {
        setPreview(SERVER_BASE_URL + res.data.signature_image_url);
      }
    } catch (error) {
      toast.error("Session expired.");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("canva_connected") === "true") {
      toast.success("Canva connected successfully!");
      refreshUser();
      setActiveTab("integrations");
      navigate(location.pathname, { replace: true });
    } else if (params.get("payment") === "success" && params.get("reference")) {
      const ref = params.get("reference");
      const toastId = toast.loading("Verifying your payment...");
      verifyPayment(ref)
        .then(async () => {
          toast.success("Payment verified! Your account is upgraded.", { id: toastId });
          await refreshUser();
          await fetchUser();
        })
        .catch(() => {
          toast.error("Payment verification failed or pending.", { id: toastId });
        })
        .finally(() => {
          navigate(location.pathname, { replace: true });
        });
    } else {
      fetchUser();
    }

    if (location.state?.defaultTab) {
      setActiveTab(location.state.defaultTab);
    }
  }, [navigate, location.search, location.state, refreshUser]);

  const fetchTeam = useCallback(async () => {
    setLoadingTeam(true);
    try {
      const res = await getTeamMembers();
      setTeamData(res.data);
    } catch (error) {
      toast.error("Failed to load team members.");
    } finally {
      setLoadingTeam(false);
    }
  }, []);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return toast.error("Enter a valid email.");
    setSendingInvite(true);
    const toastId = toast.loading("Sending invitation...");
    try {
      await sendTeamInvite(inviteEmail.trim());
      toast.success("Invitation sent successfully!", { id: toastId });
      setInviteEmail("");
      fetchTeam();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to send invitation.", { id: toastId });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    if (!window.confirm("Are you sure you want to cancel this invitation?")) return;
    const toastId = toast.loading("Cancelling invitation...");
    try {
      await cancelTeamInvite(inviteId);
      toast.success("Invitation cancelled.", { id: toastId });
      fetchTeam();
    } catch (error) {
      toast.error("Failed to cancel invitation.", { id: toastId });
    }
  };

  const handleRemoveMember = async (memberId, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the organization? They will instantly lose access.`)) return;
    const toastId = toast.loading("Removing team member...");
    try {
      await removeTeamMember(memberId);
      toast.success("Member removed from team.", { id: toastId });
      fetchTeam();
    } catch (error) {
      toast.error("Failed to remove member.", { id: toastId });
    }
  };

  useEffect(() => {
    if (activeTab === "team" && isCompanyOwnerOrAdmin) {
      fetchTeam();
    }
  }, [activeTab, isCompanyOwnerOrAdmin, fetchTeam]);

  // Open the Provider Selection Modal
  const handleSelectPlan = (plan) => {
    setSelectedPlanForModal(plan);
  };

  // Paystack flow (using direct PaystackPop)
  const handlePaystackUpgrade = useCallback(async (plan) => {
    setSelectedPlanForModal(null);
    setProcessingPlan(plan);
    const toastId = toast.loading("Setting up Paystack checkout...");
    try {
      const res = await apiInitializePayment(plan, "paystack");
      toast.dismiss(toastId);

      const { publicKey, email, amount, reference, currency, metadata } = res.data;
      const key = publicKey || "pk_test_e0d4baa25d66a069e4a300836f2f8fd04691b400";

      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: key,
        email: email,
        amount: Number(amount),
        ref: reference,
        currency: currency || "NGN",
        metadata: metadata || {},
        onSuccess: async (transaction) => {
          const verifyToast = toast.loading("Verifying payment...");
          try {
            const ref = transaction?.reference || reference;
            await verifyPayment(ref);
            toast.success("Upgrade successful! Credits added.", { id: verifyToast });
            await refreshUser();
            await fetchUser();
          } catch (err) {
            toast.error("Payment verification failed.", { id: verifyToast });
          } finally {
            setProcessingPlan(null);
          }
        },
        onCancel: () => {
          toast.error("Payment cancelled.");
          setProcessingPlan(null);
        },
        onClose: () => {
          setProcessingPlan(null);
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message || "Payment initialization failed.", { id: toastId });
      setProcessingPlan(null);
    }
  }, [refreshUser]);

  // Bachs flow (using Bachs Overlay Checkout)
  const handleBachsUpgrade = useCallback(async (plan) => {
    setSelectedPlanForModal(null);
    setProcessingPlan(plan);
    setIsBachsLoading(true);
    const toastId = toast.loading("Setting up Bachs checkout...");
    try {
      const res = await apiInitializePayment(plan, "bachs");
      toast.dismiss(toastId);
      const { checkout_url, reference } = res.data;
      if (!checkout_url) {
        throw new Error("No checkout URL received from Bachs.");
      }

      const Bachs = await loadBachs();
      Bachs.Checkout.open({
        checkoutUrl: checkout_url,
        onEvent: async (event) => {
          if (event.type === "checkout.completed") {
            const verifyToast = toast.loading("Verifying payment...");
            try {
              await verifyPayment(reference);
              toast.success("Upgrade successful! Credits added to your account.", { id: verifyToast });
              await refreshUser();
              await fetchUser();
            } catch (err) {
              toast.success("Payment completed! Updating your account...", { id: verifyToast });
              await refreshUser();
              await fetchUser();
            } finally {
              setProcessingPlan(null);
              setIsBachsLoading(false);
            }
          } else if (event.type === "checkout.failed") {
            toast.error("Payment failed. Please try again.");
            setProcessingPlan(null);
            setIsBachsLoading(false);
          } else if (event.type === "checkout.closed") {
            setProcessingPlan(null);
            setIsBachsLoading(false);
          }
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message || "Failed to initialize Bachs checkout.", { id: toastId });
      setProcessingPlan(null);
      setIsBachsLoading(false);
    }
  }, [refreshUser]);



  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setSignatureFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      toast.error("Please upload a PNG or JPG.");
    }
  };

  const handleSubmitSignature = async (e) => {
    e.preventDefault();
    if (!signatureFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("signature", signatureFile);
    try {
      await uploadUserSignature(formData);
      toast.success("Signature uploaded!");
      refreshUser();
      setSignatureFile(null);
    } catch (error) {
      toast.error("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateApiKey = async () => {
    toast.promise(generateApiKey(), {
      loading: "Generating key...",
      success: (res) => {
        setNewApiKey(res.data.api_key);
        setShowKeyModal(true);
        fetchUser();
        return "API Key generated!";
      },
      error: "Failed to generate key.",
    });
  };

  const handleSwitchToCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return toast.error("Enter company name.");
    setIsSwitching(true);
    try {
      const res = await switchToCompany(newCompanyName);
      toast.success("Account upgraded to Company!");
      if (res.data?.company?.id) {
        localStorage.setItem("workspaceContext", String(res.data.company.id));
      }
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error("Failed to switch.");
    } finally {
      setIsSwitching(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("workspaceContext");
    navigate("/login");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newApiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCanvaConnect = async () => {
    setIsCanvaConnecting(true);
    try {
      const response = await getCanvaAuthUrl();
      window.location.href = response.data.auth_url;
    } catch (error) {
      toast.error("Could not connect to Canva. Please try again.");
      setIsCanvaConnecting(false);
    }
  };

  if (loading)
    return (
      <div className="w-full pb-12 animate-pulse">
        {/* Navigation Header Skeleton */}
        <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3">
          <div className="flex justify-between items-center max-w-[1600px] mx-auto h-8">
            <div className="w-1/3 bg-slate-200 h-4 rounded" />
            <div className="w-1/4 bg-slate-200 h-6 rounded" />
          </div>
        </div>
        {/* Body Skeletons */}
        <div className="max-w-5xl mx-auto space-y-6 px-4">
          <div className="h-10 bg-slate-100 border border-slate-200 rounded-xl" />
          <div className="h-64 bg-slate-100 border border-slate-200 rounded-xl" />
        </div>
      </div>
    );

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "referrals", label: "Referrals", icon: Gift },
    ...(isCompanyOwnerOrAdmin ? [{ id: "team", label: "Team", icon: Building }] : []),
    { id: "billing", label: "Billing", icon: CreditCard },
    {
      id: "developer",
      label: "Developer",
      icon: Shield,
      locked: !hasApiAccess,
    },
  ];

  const navLinks = [
    { name: "Overview", path: "/dashboard" },
    { name: "Templates", path: "/dashboard/templates" },
    { name: "Groups", path: "/dashboard/groups" },
    { name: "Analytics", path: "/dashboard/analytics" },
    { name: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div className="w-full pb-12">
      <Toaster position="top-right" />

      {/* --- 1. Top Navigation Bar (Header - Locked to Top) --- */}
      <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3">
        <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
          {/* Left: Page Title */}
          <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-0">Settings</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="bg-slate-100/80 p-1 rounded-xl inline-flex gap-1 mb-8 border border-slate-200/40">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                disabled={tab.locked}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all decoration-none ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/30"
                    : "text-slate-500 hover:text-slate-800"
                } ${tab.locked ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
                {tab.locked && <Lock size={11} />}
              </button>
            );
          })}
        </div>

      {activeTab === "profile" && (
        <div className="space-y-6">
          <Section title="Public Profile" icon={User}>
            {isCompanyUser && (
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg flex items-start gap-3 mb-6 text-sm">
                <Building size={18} className="mt-0.5" />
                <div>
                  Managed by <strong>{user.company.name}</strong>. Certificates
                  issued under this company name.
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={localUser?.name || ""}
                  disabled
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={localUser?.email || ""}
                  disabled
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </Section>

          {!isCompanyUser && (
            <Section title="Company Workspace" icon={Building}>
              <p className="text-gray-600 mb-4 text-sm">
                Upgrade to a company account to issue certificates under your
                organization's name.
                <span className="text-red-500 ml-1 font-medium">
                  Irreversible action.
                </span>
              </p>
              <form onSubmit={handleSwitchToCompany} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={isSwitching}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap flex items-center"
                >
                  {isSwitching && <Spinner size="sm" className="mr-2" />} Switch
                  to Company
                </button>
              </form>
            </Section>
          )}

          <Section
            title="Signature Management"
            icon={PenTool}
            className="relative overflow-hidden"
          >
            {isFreeUser && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
                <Lock size={40} className="text-yellow-500 mb-2" />
                <h4 className="font-bold text-gray-900">Premium Feature</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Upgrade to Starter or higher to upload custom signatures.
                </p>
                <button
                  onClick={() => setActiveTab("billing")}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  View Plans
                </button>
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-4">
                  Upload a transparent PNG of your signature.
                </p>
                <form onSubmit={handleSubmitSignature} className="space-y-4">
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <button
                    type="submit"
                    disabled={isUploading || !signatureFile}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                  >
                    {isUploading ? (
                      <Spinner size="sm" className="mr-2" />
                    ) : (
                      <UploadCloud size={16} className="mr-2" />
                    )}{" "}
                    Save Signature
                  </button>
                </form>
              </div>
              {preview && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-center min-w-[200px]">
                  <img
                    src={preview}
                    alt="Sig"
                    className="max-h-16 object-contain"
                  />
                </div>
              )}
            </div>
          </Section>

          <Section title="Account Actions" icon={Shield}>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/dashboard/support")}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <span className="flex items-center gap-3 font-medium text-gray-700">
                  <HelpCircle size={18} /> Contact Support
                </span>
              </button>
              <div className="h-px bg-gray-100"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-lg transition-colors text-left text-red-600"
              >
                <span className="flex items-center gap-3 font-medium">
                  <LogOut size={18} /> Logout
                </span>
              </button>
            </div>
          </Section>
        </div>
      )}

      {/* {activeTab === "integrations" && (
        <Section title="External Apps" icon={LinkIcon}>
          // ... content ...
        </Section>
      )} */}

      {activeTab === "referrals" && <ReferralSection />}

      {activeTab === "team" && isCompanyOwnerOrAdmin && (
        <div className="space-y-6">
          <Section title="Invite Team Member" icon={PlusCircle}>
            <p className="text-gray-600 mb-4 text-sm">
              Invite a staff member to join your organization workspace. They will operate using their own email/password but access your company dashboard.
            </p>
            <form onSubmit={handleSendInvite} className="flex gap-3 max-w-lg">
              <input
                type="email"
                placeholder="staff@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={sendingInvite}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap text-sm flex items-center"
              >
                {sendingInvite && <Spinner size="sm" className="mr-2" />} Invite Staff
              </button>
            </form>
          </Section>

          <Section title="Active Team Members" icon={Building}>
            {loadingTeam ? (
              <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
            ) : teamData.members.length === 0 ? (
              <p className="text-slate-500 text-sm">No team members joined yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {teamData.members.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 font-medium text-slate-900 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {member.name.charAt(0)}
                          </div>
                          <span>{member.name}</span>
                        </td>
                        <td className="py-3.5 text-slate-500">{member.email}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                            member.role === "Owner" ? "bg-amber-50 text-amber-700" : "bg-indigo-50 text-indigo-700"
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {member.role !== "Owner" && (
                            <button
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              className="text-red-600 hover:text-red-800 font-medium text-xs flex items-center gap-1 ml-auto"
                            >
                              <UserMinus size={14} className="mr-1" /> Remove Staff
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section title="Pending Invitations" icon={Mail}>
            {loadingTeam ? (
              <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
            ) : teamData.invitations.length === 0 ? (
              <p className="text-slate-500 text-sm">No pending invitations.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Expires At</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {teamData.invitations.map((invite) => (
                      <tr key={invite.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 font-medium text-slate-900">{invite.email}</td>
                        <td className="py-3.5 text-slate-500">
                          {new Date(invite.expires_at).toLocaleString()}
                        </td>
                        <td className="py-3.5">
                          <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 text-xs font-bold rounded-full capitalize">
                            {invite.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleCancelInvite(invite.id)}
                            className="text-slate-500 hover:text-red-600 font-medium text-xs flex items-center gap-1 ml-auto"
                          >
                            <Trash2 size={14} className="mr-1" /> Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>
      )}

      {activeTab === "billing" && (
        <div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8 flex items-start gap-3">
            <Info className="text-indigo-600 mt-0.5" size={20} />
            <div>
              <p className="text-indigo-900 font-medium">
                Current Plan: <span className="uppercase">{user?.role}</span>
              </p>
              <p className="text-indigo-700 text-sm">
                {user?.cert_quota || 0} certificate credits remaining.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PlanCard
              planKey="starter"
              current={user?.role?.toLowerCase() === "starter"}
              onAction={handleSelectPlan}
              loading={processingPlan === "starter"}
            />
            <PlanCard
              planKey="growth"
              current={user?.role?.toLowerCase() === "growth"}
              onAction={handleSelectPlan}
              loading={processingPlan === "growth"}
            />
            <PlanCard
              planKey="pro"
              current={user?.role?.toLowerCase() === "pro"}
              onAction={handleSelectPlan}
              loading={processingPlan === "pro"}
            />
            <PlanCard
              planKey="enterprise"
              current={user?.role?.toLowerCase() === "enterprise"}
              onAction={handleSelectPlan}
              loading={processingPlan === "enterprise"}
            />
          </div>
        </div>
      )}


      {activeTab === "developer" && hasApiAccess && (
        <Section title="API Configuration" icon={Key}>
          <p className="text-gray-600 mb-6">
            Use this key to authenticate requests to the ProofDeck API. Keep it
            secret.
          </p>
          {localUser?.api_key ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="text-green-500 mt-0.5" size={20} />
              <div>
                <h4 className="font-medium text-gray-900">
                  Active API Key Found
                </h4>
                <p className="text-sm text-gray-500">
                  For security, the key is hidden. Regenerate if lost.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <Info className="text-yellow-600 mt-0.5" size={20} />
              <div>
                <h4 className="font-medium text-yellow-900">No API Key</h4>
                <p className="text-sm text-yellow-700">
                  Generate a key to start integrating.
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleGenerateApiKey}
            className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
          >
            <Key size={16} />
            {localUser?.api_key ? "Regenerate Key" : "Generate Key"}
          </button>
          {localUser?.api_key && (
            <p className="text-xs text-red-500 mt-2">
              Warning: Regenerating will stop existing integrations.
            </p>
          )}
        </Section>
      )}

      <Modal
        show={showKeyModal}
        onHide={() => setShowKeyModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-lg font-bold">
            New API Key Generated
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg mb-4 text-sm">
            Please copy this key now. You won't be able to see it again.
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newApiKey}
              readOnly
              className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
            >
              {isCopied ? (
                <Check size={18} className="text-green-600" />
              ) : (
                <Copy size={18} />
              )}
            </button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowKeyModal(false)}>
            I have copied it
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- PAYMENT PROVIDER MODAL --- */}
      <Modal
        show={Boolean(selectedPlanForModal)}
        onHide={() => !processingPlan && !isBachsLoading && setSelectedPlanForModal(null)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton={!processingPlan && !isBachsLoading} className="border-b border-gray-100 pb-3">
          <Modal.Title className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CreditCard size={18} className="text-indigo-600" />
            <span>Select Payment Gateway</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {selectedPlanForModal && PLAN_INFO[selectedPlanForModal] && (
            <div>
              {/* Selected Plan Summary Banner */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Selected Plan</p>
                  <h4 className="text-base font-extrabold text-gray-900 mb-0">{PLAN_INFO[selectedPlanForModal].name} Plan</h4>
                  <p className="text-xs text-indigo-600 font-bold mb-0 mt-0.5">{PLAN_INFO[selectedPlanForModal].certs} Credits Included</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-gray-900">{PLAN_INFO[selectedPlanForModal].priceNGN}</div>
                  <div className="text-xs font-semibold text-gray-500">{PLAN_INFO[selectedPlanForModal].priceUSD}</div>
                </div>
              </div>

              <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">Choose payment method:</p>

              <div className="space-y-3">
                {/* Option 1: Paystack */}
                <button
                  type="button"
                  disabled={Boolean(processingPlan)}
                  onClick={() => handlePaystackUpgrade(selectedPlanForModal)}
                  className="w-full text-left p-3.5 rounded-xl border-2 border-gray-200 hover:border-indigo-600 hover:bg-indigo-50/20 transition-all duration-200 flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 p-2 flex items-center justify-center shrink-0 shadow-xs group-hover:border-indigo-300 transition-colors">
                      <img src="/images/paystack-logo.webp" alt="Paystack" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">Paystack</span>
                        <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                          Nigeria / Local
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 mb-0 leading-relaxed">
                        Pay with Nigerian Cards, Bank Transfer, or USSD in Naira ({PLAN_INFO[selectedPlanForModal].priceNGN}).
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>

                {/* Option 2: Bachs */}
                <button
                  type="button"
                  disabled={Boolean(processingPlan)}
                  onClick={() => handleBachsUpgrade(selectedPlanForModal)}
                  className="w-full text-left p-3.5 rounded-xl border-2 border-gray-200 hover:border-indigo-600 hover:bg-indigo-50/20 transition-all duration-200 flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-black border border-black p-2 flex items-center justify-center shrink-0 shadow-xs group-hover:border-indigo-600 transition-colors">
                      <img src="/images/bachs-logo.png" alt="Bachs" className="w-full h-full object-contain brightness-0 invert" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">Bachs</span>
                        <span className="text-[10px] uppercase font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Globe size={10} /> Global & Local
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 mb-0 leading-relaxed">
                        Pay globally with Card (Visa, Mastercard, Amex), Bank Transfer, or Crypto in USD ({PLAN_INFO[selectedPlanForModal].priceUSD}).
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              </div>

              {processingPlan && (
                <div className="mt-4 p-3 bg-indigo-50 text-indigo-800 rounded-lg flex items-center justify-center gap-2 text-xs font-medium">
                  <Spinner size="sm" />
                  <span>Setting up secure checkout...</span>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-100 py-2">
          <Button
            variant="light"
            size="sm"
            disabled={Boolean(processingPlan)}
            onClick={() => setSelectedPlanForModal(null)}
            className="text-xs font-semibold text-gray-600"
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      </div> {/* close max-w-5xl */}
    </div>
  );
}


export default SettingsPage;
