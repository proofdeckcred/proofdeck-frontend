import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCertificates,
  getTemplates,
  deleteCertificate,
  getCertificatePDF,
  getCertificatePNG,
  sendCertificateEmail,
  sendBulkEmails,
  getCurrentUser,
} from "../api";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Download,
  Mail,
  Trash,
  CheckCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import AppButton from "../components/ui/AppButton";
import EmptyState from "../components/ui/EmptyState";
import KebabMenu from "../components/ui/KebabMenu";

export default function MyCertificatesPage() {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Table State
  const [filterStatus, setFilterStatus] = useState("all"); // all | sent | not_sent
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCertIds, setSelectedCertIds] = useState(new Set());
  const [timeRange, setTimeRange] = useState("week"); // week | month

  // Modal / Action State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const certificatesPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [certRes, tempRes, userRes] = await Promise.all([
        getCertificates(),
        getTemplates(),
        getCurrentUser().catch(() => ({ data: null })),
      ]);

      const certsData = Array.isArray(certRes.data)
        ? certRes.data
        : certRes.data?.certificates || [];
      const templatesData = Array.isArray(tempRes.data)
        ? tempRes.data
        : tempRes.data?.templates || [];

      setCertificates(certsData);
      setTemplates(templatesData);
      if (userRes?.data) setUser(userRes.data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // --- Filtered and Paginated Certificates ---
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const recipient = (cert.recipient_name || "").toLowerCase();
      const course = (cert.course_title || "").toLowerCase();
      const search = searchTerm.toLowerCase();
      const matchesSearch = recipient.includes(search) || course.includes(search);

      if (!matchesSearch) return false;
      if (filterStatus === "sent") return cert.email_sent;
      if (filterStatus === "not_sent") return !cert.email_sent;
      return true;
    });
  }, [certificates, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredCertificates.length / certificatesPerPage) || 1;
  const paginatedCertificates = useMemo(() => {
    const start = (currentPage - 1) * certificatesPerPage;
    return filteredCertificates.slice(start, start + certificatesPerPage);
  }, [filteredCertificates, currentPage]);

  // --- Activity Chart Data ---
  const chartData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    certificates.forEach((cert) => {
      const dateStr = cert.issue_date || cert.created_at;
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
          if (counts[dayName] !== undefined) counts[dayName] += 1;
        }
      }
    });

    return days.map((day) => ({ day, count: counts[day] }));
  }, [certificates]);

  const maxChartCount = Math.max(...chartData.map((d) => d.count), 1);

  // --- Handlers ---
  const handleDeleteCert = async () => {
    if (!selectedCert) return;
    try {
      await deleteCertificate(selectedCert.id);
      setCertificates((prev) => prev.filter((c) => c.id !== selectedCert.id));
      toast.success("Certificate deleted.");
    } catch (err) {
      toast.error("Failed to delete certificate.");
    } finally {
      setShowDeleteModal(false);
      setSelectedCert(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCertIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedCertIds.size} certificates?`)) return;

    setIsBulkDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedCertIds).map((id) => deleteCertificate(id))
      );
      setCertificates((prev) => prev.filter((c) => !selectedCertIds.has(c.id)));
      setSelectedCertIds(new Set());
      toast.success("Certificates deleted.");
    } catch (err) {
      toast.error("Failed to delete some certificates.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDownloadPDF = async (cert) => {
    setDownloadingId(cert.id);
    try {
      const response = await getCertificatePDF(cert.id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cert.recipient_name || "certificate"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadPNG = async (cert) => {
    setDownloadingId(cert.id);
    try {
      const response = await getCertificatePNG(cert.id);
      const blob = new Blob([response.data], { type: "image/png" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cert.recipient_name || "certificate"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download PNG.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSendEmail = async (cert) => {
    if (!cert.recipient_email) {
      toast.error("No recipient email on file.");
      return;
    }
    try {
      await sendCertificateEmail(cert.id);
      toast.success("Email sent.");
      setCertificates((prev) =>
        prev.map((c) => (c.id === cert.id ? { ...c, email_sent: true } : c))
      );
    } catch (err) {
      toast.error("Failed to send email.");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCertIds(new Set(paginatedCertificates.map((c) => c.id)));
    } else {
      setSelectedCertIds(new Set());
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedCertIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 font-sans">
      <Toaster position="top-right" />

      {/* --- Page Header (Title + One Primary Action) --- */}
      <PageHeader
        title="Overview"
        action={
          <AppButton
            variant="primary"
            onClick={() => navigate("/dashboard/create")}
          >
            Issue certificate
          </AppButton>
        }
      />

      {/* --- Stat Cards (Number + Label only, No Badges) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Credits"
          value={user?.cert_quota?.toLocaleString() || 0}
        />
        <StatCard
          label="Issued"
          value={certificates.length.toLocaleString()}
        />
        <StatCard
          label="Templates"
          value={templates.length.toLocaleString()}
        />
      </div>

      {/* --- Activity Chart & Account Quotas Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Activity Chart (Left Column) */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Activity
            </h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-xs font-medium text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 outline-none cursor-pointer"
            >
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>

          {certificates.length === 0 ? (
            <EmptyState message="No certificates issued yet." />
          ) : (
            <div className="flex items-end justify-between h-44 pt-6 px-4 border-b border-slate-100 dark:border-zinc-800">
              {chartData.map((d) => {
                const heightPercent = (d.count / maxChartCount) * 100;
                return (
                  <div key={d.day} className="flex flex-col items-center flex-1 h-full justify-end">
                    <span className="text-[11px] font-semibold text-slate-500 mb-1">
                      {d.count > 0 ? d.count : ""}
                    </span>
                    <div className="w-8 sm:w-10 bg-slate-100 dark:bg-zinc-800 rounded-t h-full flex items-end justify-center">
                      <div
                        style={{ height: `${Math.max(heightPercent, 4)}%` }}
                        className="w-full bg-[#5144E8] rounded-t transition-all duration-300"
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-400 mt-2">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Account Quotas (Right Column) */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-4">
              Quotas
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-medium">
                  <span className="text-slate-500 dark:text-zinc-400">Credits used</span>
                  <span className="text-slate-800 dark:text-zinc-200 font-bold">
                    {certificates.length} / {(certificates.length + (user?.cert_quota || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        (certificates.length / (certificates.length + (user?.cert_quota || 0) || 1)) * 100
                      )}%`,
                    }}
                    className="h-full bg-[#5144E8] rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-medium">
                  <span className="text-slate-500 dark:text-zinc-400">Templates used</span>
                  <span className="text-slate-800 dark:text-zinc-200 font-bold">
                    {templates.length} / 50
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (templates.length / 50) * 100)}%` }}
                    className="h-full bg-[#5144E8] rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 mt-6 flex items-center justify-between text-xs text-slate-500">
            <span>Usage resets on:</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200">
              {user?.subscription_expiry
                ? new Date(user.subscription_expiry).toLocaleDateString()
                : "Lifetime"}
            </span>
          </div>
        </div>
      </div>

      {/* --- Recent Credentials Section --- */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            Recent credentials
          </h2>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-indigo-500 w-44 sm:w-56"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value="all">All statuses</option>
              <option value="sent">Issued</option>
              <option value="not_sent">Draft</option>
            </select>

            {/* Bulk Delete (if selected) */}
            {selectedCertIds.size > 0 && (
              <AppButton
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
              >
                Delete ({selectedCertIds.size})
              </AppButton>
            )}
          </div>
        </div>

        {/* Table of Records */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading...</div>
        ) : filteredCertificates.length === 0 ? (
          <div className="p-6">
            <EmptyState
              message="No certificates found."
              action={
                <AppButton
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/dashboard/create")}
                >
                  Issue certificate
                </AppButton>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-4 w-8">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        paginatedCertificates.length > 0 &&
                        paginatedCertificates.every((c) => selectedCertIds.has(c.id))
                      }
                      className="rounded text-indigo-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-4">Recipient</th>
                  <th className="py-2.5 px-4">Course</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-sm">
                {paginatedCertificates.map((cert) => {
                  const isSelected = selectedCertIds.has(cert.id);
                  const isIssued = cert.email_sent;
                  return (
                    <tr
                      key={cert.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-zinc-800/50 transition-colors ${
                        isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(cert.id)}
                          className="rounded text-indigo-600 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100">
                          {cert.recipient_name || "Untitled"}
                        </div>
                        {cert.recipient_email && (
                          <div className="text-xs text-slate-400">{cert.recipient_email}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                        {cert.course_title || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {cert.issue_date || cert.created_at
                          ? new Date(cert.issue_date || cert.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            isIssued
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700"
                          }`}
                        >
                          {isIssued ? "Issued" : "Draft"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <KebabMenu
                          items={[
                            {
                              label: "View",
                              icon: <Eye size={14} />,
                              onClick: () => navigate(`/dashboard/view/${cert.id}`),
                            },
                            {
                              label: "Edit",
                              icon: <Pencil size={14} />,
                              onClick: () => navigate(`/dashboard/edit/${cert.id}`),
                            },
                            {
                              label: "Download PDF",
                              icon: <Download size={14} />,
                              onClick: () => handleDownloadPDF(cert),
                            },
                            {
                              label: "Download PNG",
                              icon: <Download size={14} />,
                              onClick: () => handleDownloadPNG(cert),
                            },
                            cert.recipient_email
                              ? {
                                  label: "Resend email",
                                  icon: <Mail size={14} />,
                                  onClick: () => handleSendEmail(cert),
                                }
                              : null,
                            { divider: true },
                            {
                              label: "Delete",
                              icon: <Trash size={14} />,
                              danger: true,
                              onClick: () => {
                                setSelectedCert(cert);
                                setShowDeleteModal(true);
                              },
                            },
                          ].filter(Boolean)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredCertificates.length > certificatesPerPage && (
          <div className="p-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {currentPage} of {totalPages} ({filteredCertificates.length} items)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 max-w-sm w-full shadow-lg">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-2">
              Delete certificate
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5 leading-relaxed">
              Are you sure you want to delete the certificate for{" "}
              <strong>{selectedCert?.recipient_name || "this recipient"}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <AppButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCert(null);
                }}
              >
                Cancel
              </AppButton>
              <AppButton
                variant="danger"
                size="sm"
                onClick={handleDeleteCert}
              >
                Delete
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
