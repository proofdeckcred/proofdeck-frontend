import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building,
  Mail,
  Users,
  Calendar,
  Award,
  Loader2,
  AlertTriangle,
  User,
  Shield,
} from "lucide-react";
import { getAdminCompanyDetails, adjustCompanyQuota } from "../api";

function AdminCompanyDetailsPage() {
  const { companyId } = useParams();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quotaAdjustment, setQuotaAdjustment] = useState({ amount: "", reason: "" });
  const [isAdjusting, setIsAdjusting] = useState(false);

  useEffect(() => {
    fetchCompanyDetails();
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      const res = await getAdminCompanyDetails(companyId);
      setCompanyData(res.data);
    } catch (err) {
      setError("Failed to fetch company details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustmentChange = (e) => {
    const { name, value } = e.target;
    setQuotaAdjustment((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    const amountInt = parseInt(quotaAdjustment.amount, 10);
    if (isNaN(amountInt)) {
      alert("Please enter a valid number.");
      return;
    }
    if (!quotaAdjustment.reason.trim()) {
      alert("A reason for the adjustment is required.");
      return;
    }

    const confirmMsg = `Are you sure you want to adjust the quota for "${companyData.name}" by ${amountInt} credits?\n\nReason: "${quotaAdjustment.reason}"`;
    if (window.confirm(confirmMsg)) {
      setIsAdjusting(true);
      try {
        const res = await adjustCompanyQuota(companyId, amountInt, quotaAdjustment.reason);
        alert(res.data.msg || "Quota adjusted successfully!");
        setQuotaAdjustment({ amount: "", reason: "" });
        // Refresh details to show updated quota
        const refreshed = await getAdminCompanyDetails(companyId);
        setCompanyData(refreshed.data);
      } catch (err) {
        alert(err.response?.data?.msg || "Failed to adjust quota. Please try again.");
      } finally {
        setIsAdjusting(false);
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

  if (!companyData) return <div className="p-4">No company data found.</div>;

  const { name, owner, members, recent_certificates, created_at, cert_quota } = companyData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/companies"
          className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4 transition-colors p-0"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Company List
        </Link>
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
                <Building size={32}/>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={14}/> Created {new Date(created_at).toLocaleDateString()}</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                        <Users size={12}/> {members.length} Members
                    </span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Column: Info & Quota Adjustment */}
         <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                     <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Company Info</h3>
                </div>
                <div className="p-6 space-y-4 text-sm">
                    <div className="flex flex-col gap-1 pb-3 border-b border-gray-100">
                        <span className="text-gray-500 text-xs uppercase font-semibold">Owner</span>
                        <Link to={`/admin/users/${owner.id}`} className="font-medium text-indigo-600 hover:underline flex items-center gap-2">
                            <User size={16}/> {owner.name}
                        </Link>
                    </div>
                    <div className="flex flex-col gap-1 pb-3 border-b border-gray-100">
                        <span className="text-gray-500 text-xs uppercase font-semibold">Contact Email</span>
                        <div className="text-gray-900 flex items-center gap-2">
                            <Mail size={16}/> {owner.email}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-gray-500 text-xs uppercase font-semibold flex items-center gap-1">
                            <Shield size={14} className="text-gray-400"/> Certificate Quota
                        </span>
                        <div className="text-lg font-bold text-gray-900">
                            {cert_quota}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quota Adjustment Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                     <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Manual Credit Adjustment</h3>
                </div>
                <div className="p-6 space-y-4">
                     <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
                          <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Adjustment (+/-)</label>
                              <input
                                  type="number"
                                  name="amount"
                                  placeholder="e.g. 100 or -50"
                                  value={quotaAdjustment.amount}
                                  onChange={handleAdjustmentChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                              <input
                                  type="text"
                                  name="reason"
                                  placeholder="e.g. Invoice paid, Promo quota"
                                  value={quotaAdjustment.reason}
                                  onChange={handleAdjustmentChange}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                          </div>
                          <button
                              type="submit"
                              disabled={isAdjusting}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                          >
                              {isAdjusting ? "Adjusting..." : "Adjust Quota"}
                          </button>
                     </form>
                </div>
            </div>
         </div>

         {/* Right Column: Members and Certs */}
         <div className="lg:col-span-2 space-y-8">
            {/* Members Table */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Users size={20} className="text-gray-400"/> Members
                    </h3>
                </div>
                <div className="overflow-x-auto max-h-[300px]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-gray-500">Name</th>
                                <th className="px-6 py-3 font-semibold text-gray-500">Email</th>
                                <th className="px-6 py-3 font-semibold text-gray-500">Role</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-gray-100">
                             {members.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-medium text-indigo-600">
                                        <Link to={`/admin/users/${member.id}`}>{member.name}</Link>
                                    </td>
                                    <td className="px-6 py-3 text-gray-600">{member.email}</td>
                                    <td className="px-6 py-3">
                                         <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase
                                            ${member.role === 'pro' ? 'bg-indigo-100 text-indigo-800' : 
                                              member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {member.role}
                                         </span>
                                    </td>
                                </tr>
                             ))}
                              {members.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No members found.</td>
                                </tr>
                            )}
                         </tbody>
                    </table>
                </div>
             </div>

              {/* Recent Certificates Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Award size={20} className="text-gray-400"/> Recent Certificates
                         <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{recent_certificates.length}</span>
                    </h3>
                </div>
                <div className="overflow-x-auto max-h-[300px]">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-gray-500">Recipient</th>
                                <th className="px-6 py-3 font-semibold text-gray-500">Course</th>
                                <th className="px-6 py-3 font-semibold text-gray-500">Status</th>
                                <th className="px-6 py-3 font-semibold text-gray-500">Issued</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-gray-100">
                            {recent_certificates.map((cert) => (
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
                                </tr>
                            ))}
                             {recent_certificates.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No recent certificates.</td>
                                </tr>
                            )}
                         </tbody>
                     </table>
                </div>
              </div>
         </div>
      </div>
    </div>
  );
}

export default AdminCompanyDetailsPage;
