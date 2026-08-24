import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Calendar,
  CreditCard,
  Ban,
  CheckCircle,
  ExternalLink,
  Shield,
  Clock,
  Briefcase,
  Award,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  getAdminUserDetails,
  adjustUserQuota,
  revokeAdminCertificate,
} from "../api";

function AdminUserDetailsPage() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quotaAdjustment, setQuotaAdjustment] = useState({
    amount: "",
    reason: "",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const res = await getAdminUserDetails(userId);
      setUserData(res.data);
    } catch (err) {
      setError("Failed to fetch user details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustmentChange = (e) => {
    setQuotaAdjustment({
      ...quotaAdjustment,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    if (!quotaAdjustment.reason) {
      alert("A reason for the adjustment is required.");
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmQuotaAdjustment = async () => {
    setShowConfirmModal(false);
    try {
      const amountInt = parseInt(quotaAdjustment.amount, 10);
      if (isNaN(amountInt)) {
        alert("Please enter a valid number for the adjustment.");
        return;
      }
      await adjustUserQuota(userId, amountInt, quotaAdjustment.reason);
      setQuotaAdjustment({ amount: "", reason: "" }); // Reset form
      fetchUserDetails(); // Refresh data
    } catch (err) {
      alert(
        err.response?.data?.msg || "Failed to adjust quota. Please try again."
      );
    }
  };

  const handleRevoke = async (certId) => {
    if (window.confirm("Are you sure you want to revoke this certificate?")) {
      try {
        await revokeAdminCertificate(certId);
        fetchUserDetails();
      } catch (err) {
        alert("Failed to revoke certificate.");
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
    
  if (error) 
    return (
        <div className="p-4 text-red-600 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
            <AlertTriangle size={20} /> {error}
        </div>
    );

  if (!userData) return <div className="p-4">No user data found.</div>;

  const { user, certificates, payments } = userData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/users"
          className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4 transition-colors p-0"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to User List
        </Link>
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold">
                {user.name.charAt(0)}
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Mail size={14}/> {user.email}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                        user.role === 'pro' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {user.role} Plan
                    </span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Quota */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide"> User Profile</h3>
            </div>
            <div className="p-6 space-y-4 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-500 flex items-center gap-2"><Briefcase size={16}/> Company</span>
                    <span className="font-medium text-gray-900">
                        {user.company ? <Link to={`/admin/companies/${user.company.id}`} className="text-indigo-600 hover:underline">{user.company.name}</Link> : 'N/A'}
                    </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-500 flex items-center gap-2"><Shield size={16}/> Quota</span>
                    <span className="font-bold text-gray-900 text-lg">{user.cert_quota}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-500 flex items-center gap-2"><Calendar size={16}/> Joined</span>
                    <span className="text-gray-900">{new Date(user.signup_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-500 flex items-center gap-2"><Clock size={16}/> Last Login</span>
                    <span className="text-gray-900">{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-2"><CreditCard size={16}/> Expiry</span>
                    <span className="text-gray-900">{user.subscription_expiry ? new Date(user.subscription_expiry).toLocaleDateString() : 'N/A'}</span>
                </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Manual Credit Adjustment</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Adjustment (+/-)</label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="e.g. 50 or -10"
                    value={quotaAdjustment.amount}
                    onChange={handleAdjustmentChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    rows={2}
                    name="reason"
                    placeholder="e.g. Bonus credits for feedback"
                    value={quotaAdjustment.reason}
                    onChange={handleAdjustmentChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                </div>
                <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Adjust Quota
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Tables */}
        <div className="lg:col-span-2 space-y-8">
            {/* Certificates Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Award size={20} className="text-gray-400"/> Issued Certificates
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{certificates.length}</span>
                    </h3>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-gray-500">Recipient</th>
                                <th className="px-6 py-3 font-semibold text-gray-500">Course</th>
                                <th className="px-6 py-3 font-semibold text-gray-500">Status</th>
                                <th className="px-6 py-3 font-semibold text-gray-500">Date</th>
                                <th className="px-6 py-3 font-semibold text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {certificates.map((cert) => (
                                <tr key={cert.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-medium text-gray-900">{cert.recipient_name}</td>
                                    <td className="px-6 py-3 text-gray-600">{cert.course_title}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${cert.status === 'revoked' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {cert.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500">{new Date(cert.issue_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-3 text-right">
                                        <a 
                                            href={`/verify/${cert.verification_id}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-indigo-600 hover:text-indigo-800 mr-3 text-xs font-medium"
                                        >
                                            View
                                        </a>
                                        {cert.status !== "revoked" && (
                                            <button 
                                                onClick={() => handleRevoke(cert.id)}
                                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                                            >
                                                Revoke
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {certificates.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No certificates issued yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <CreditCard size={20} className="text-gray-400"/> Payment History
                         <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{payments.length}</span>
                    </h3>
                </div>
                <div className="overflow-x-auto max-h-[300px]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-gray-500">Plan</th>
                                <th className="px-6 py-3 font-semibold text-gray-500">Amount</th>
                                <th className="px-6 py-3 font-semibold text-gray-500">Status</th>
                                <th className="px-6 py-3 font-semibold text-gray-500">Date</th>
                                <th className="px-6 py-3 font-semibold text-gray-500">Provider</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-medium text-gray-900 capitalize">{p.plan}</td>
                                    <td className="px-6 py-3 text-gray-700 font-mono">{p.amount} {p.currency}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                              p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-3 text-gray-500 capitalize">{p.provider}</td>
                                </tr>
                            ))}
                             {payments.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No payment history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

        {/* Custom Modal Backdrop */}
        {showConfirmModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Adjustment</h3>
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to adjust the quota by <strong className="text-indigo-600">{quotaAdjustment.amount}</strong> credits?
                        <br/>
                        <span className="text-sm italic text-gray-500">Reason: "{quotaAdjustment.reason}"</span>
                    </p>
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setShowConfirmModal(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmQuotaAdjustment}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

export default AdminUserDetailsPage;
