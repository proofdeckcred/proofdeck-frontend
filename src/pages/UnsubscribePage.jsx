import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { getEmailPreferences, updateEmailPreferences } from '../api';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState({
    email: '',
    name: '',
    weekly_digest_opt_in: true,
    promotions_opt_in: true,
    unsubscribed_all: false,
  });

  useEffect(() => {
    if (!token) {
      setError('No preferences token provided in the link.');
      setLoading(false);
      return;
    }

    const fetchPrefs = async () => {
      try {
        const res = await getEmailPreferences(token);
        setUserData(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Unable to load email preferences. The link may be invalid.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrefs();
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await updateEmailPreferences({
        token,
        weekly_digest_opt_in: userData.weekly_digest_opt_in,
        promotions_opt_in: userData.promotions_opt_in,
        unsubscribed_all: userData.unsubscribed_all,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribeAll = () => {
    setUserData(prev => ({
      ...prev,
      weekly_digest_opt_in: false,
      promotions_opt_in: false,
      unsubscribed_all: true,
    }));
  };

  return (
    <div className="min-h-screen bg-[#F7F7FA] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/logo.png" alt="ProofDeck" className="h-9 mx-auto object-contain" />
          </Link>
          <h1 className="mt-6 text-2xl font-extrabold text-[#0B0B12] tracking-tight">
            Email Notification Preferences
          </h1>
          <p className="mt-2 text-sm text-[#6B6B7C]">
            Customize what updates you receive from ProofDeck.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E7E5F0] shadow-sm p-6 sm:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#5B4CF5] animate-spin mb-3" />
              <p className="text-sm text-[#6B6B7C]">Loading your preferences...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#0B0B12] mb-2">Preferences Unavailable</h2>
              <p className="text-sm text-red-600 mb-6">{error}</p>
              <Link
                to="/"
                className="inline-flex items-center text-sm font-semibold text-[#5B4CF5] hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to ProofDeck
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {userData.email && (
                <div className="flex items-center gap-3 p-3.5 bg-[#F7F7FA] rounded-xl border border-[#E7E5F0]">
                  <Mail className="w-5 h-5 text-[#5B4CF5] flex-shrink-0" />
                  <div className="text-xs text-[#6B6B7C] truncate">
                    Preferences for: <strong className="text-[#0B0B12]">{userData.email}</strong>
                  </div>
                </div>
              )}

              {success && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm font-medium">Your email preferences have been updated.</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Option 1: Weekly Digest */}
                <label className="flex items-start gap-3.5 p-4 rounded-xl border border-[#E7E5F0] hover:border-indigo-200 transition-colors cursor-pointer bg-white">
                  <input
                    type="checkbox"
                    checked={userData.weekly_digest_opt_in}
                    disabled={userData.unsubscribed_all}
                    onChange={(e) =>
                      setUserData(prev => ({
                        ...prev,
                        weekly_digest_opt_in: e.target.checked,
                        unsubscribed_all: false,
                      }))
                    }
                    className="mt-1 w-4 h-4 text-[#5B4CF5] rounded border-gray-300 focus:ring-[#5B4CF5]"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[#0B0B12]">
                      Weekly Digest & Performance Recap
                    </div>
                    <p className="text-xs text-[#6B6B7C] mt-0.5 leading-relaxed">
                      Sent Monday mornings with a recap of your certificates issued, live employer verifications, and available quota.
                    </p>
                  </div>
                </label>

                {/* Option 2: Promotions & Feature Announcements */}
                <label className="flex items-start gap-3.5 p-4 rounded-xl border border-[#E7E5F0] hover:border-indigo-200 transition-colors cursor-pointer bg-white">
                  <input
                    type="checkbox"
                    checked={userData.promotions_opt_in}
                    disabled={userData.unsubscribed_all}
                    onChange={(e) =>
                      setUserData(prev => ({
                        ...prev,
                        promotions_opt_in: e.target.checked,
                        unsubscribed_all: false,
                      }))
                    }
                    className="mt-1 w-4 h-4 text-[#5B4CF5] rounded border-gray-300 focus:ring-[#5B4CF5]"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[#0B0B12]">
                      Product Announcements & Promotions
                    </div>
                    <p className="text-xs text-[#6B6B7C] mt-0.5 leading-relaxed">
                      Occasional emails regarding major platform updates, new designer templates, and issuer perks.
                    </p>
                  </div>
                </label>
              </div>

              {/* Unsubscribe All Fast Action */}
              <div className="pt-2 border-t border-[#E7E5F0]">
                <button
                  type="button"
                  onClick={handleUnsubscribeAll}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  Unsubscribe from all promotional and digest emails
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  to="/"
                  className="text-xs font-medium text-[#6B6B7C] hover:text-[#0B0B12] flex items-center"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to ProofDeck
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-[#5B4CF5] hover:bg-[#4433E0] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Preferences'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#6B6B7C]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Your preferences are encrypted and honored instantly across all systems.</span>
        </div>
      </div>
    </div>
  );
}
