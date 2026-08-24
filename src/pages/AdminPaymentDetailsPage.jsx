import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  User,
  Mail,
  Tag,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import { getAdminTransactionDetails } from "../api";

function AdminPaymentDetailsPage() {
  const { paymentId } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await getAdminTransactionDetails(paymentId);
        setDetails(res.data);
      } catch (err) {
        setError("Failed to fetch payment details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [paymentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
        <div className="p-4 text-red-600 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
            <AlertTriangle size={20} /> {error}
        </div>
    );
  }

  if (!details) {
    return <div className="p-4">No payment details found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/payments"
          className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4 transition-colors p-0"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Payments List
        </Link>
        <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center text-green-700 text-2xl font-bold">
                <Receipt size={32}/>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Transaction #{details.id}
                     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium
                        ${details.status === 'paid' ? 'bg-green-100 text-green-700' : 
                          details.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                        {details.status === 'paid' && <CheckCircle size={14}/>}
                        {details.status === 'failed' && <XCircle size={14}/>}
                        {details.status}
                     </span>
                </h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                    <Calendar size={14}/> {new Date(details.date).toLocaleString()}
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <CreditCard size={18} className="text-gray-400"/>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Payment Information</h3>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Amount</span>
                    <span className="text-xl font-bold text-gray-900 font-mono">{details.amount} {details.currency}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm flex items-center gap-2"><Tag size={16}/> Plan</span>
                    <span className="font-medium text-gray-900 uppercase">{details.plan}</span>
                </div>
                 <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm flex items-center gap-2"><Globe size={16}/> Provider</span>
                    <span className="font-medium text-gray-900 capitalize">{details.provider}</span>
                </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-sm">Reference ID</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 font-mono break-all">
                        {details.transaction_ref}
                    </code>
                </div>
            </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <User size={18} className="text-gray-400"/>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Customer Details</h3>
            </div>
            <div className="p-6 space-y-4">
                 <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Name</span>
                    <Link to={`/admin/users/${details.user_id}`} className="font-medium text-indigo-600 hover:underline">
                        {details.user_name}
                    </Link>
                </div>
                 <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm flex items-center gap-2"><Mail size={16}/> Email</span>
                    <span className="text-gray-900">{details.user_email}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPaymentDetailsPage;
