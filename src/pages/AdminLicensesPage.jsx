import React, { useState, useEffect, useCallback } from "react";
import {
  getAdminLicenses,
  createAdminLicense,
  updateAdminLicense,
  updateAdminLicenseStatus,
  extendAdminLicense
} from "../api";
import {
  KeyRound,
  Plus,
  Search,
  Building2,
  Calendar,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Clock,
  ChevronRight,
  Database,
  QrCode
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function AdminLicensesPage() {
  const [licenses, setLicenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [copiedKey, setCopiedKey] = useState("");

  // Form states for creating a license
  const [formData, setFormData] = useState({
    institution_name: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    plan_tier: "enterprise_academic",
    max_workstations: 5,
    duration_days: 365,
    enable_sis_connector: true,
    enable_custom_qr: true,
    enable_bulk_documents: true,
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminLicenses({
        page,
        limit: 12,
        search,
        status: statusFilter
      });
      setLicenses(res.data.licenses || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to load licenses");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success("License key copied to clipboard!");
    setTimeout(() => setCopiedKey(""), 2500);
  };

  const handleCreateLicense = async (e) => {
    e.preventDefault();
    if (!formData.institution_name.trim()) {
      return toast.error("Please enter the Institution Name");
    }
    setIsSubmitting(true);
    try {
      const res = await createAdminLicense(formData);
      toast.success(res.data.msg || "Enterprise license issued!");
      setShowCreateModal(false);
      setFormData({
        institution_name: "",
        contact_person: "",
        contact_email: "",
        contact_phone: "",
        plan_tier: "enterprise_academic",
        max_workstations: 5,
        duration_days: 365,
        enable_sis_connector: true,
        enable_custom_qr: true,
        enable_bulk_documents: true,
        notes: ""
      });
      fetchLicenses();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to issue license");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (licenseId, newStatus) => {
    try {
      await updateAdminLicenseStatus(licenseId, newStatus);
      toast.success(`License status updated to ${newStatus}`);
      fetchLicenses();
      if (selectedLicense && selectedLicense.id === licenseId) {
        setSelectedLicense((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Could not update status");
    }
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [editLicenseId, setEditLicenseId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    institution_name: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    plan_tier: "enterprise_academic",
    max_workstations: 5,
    enable_sis_connector: true,
    enable_custom_qr: true,
    enable_bulk_documents: true,
    notes: ""
  });

  const handleOpenEdit = (lic) => {
    setEditLicenseId(lic.id);
    setEditFormData({
      institution_name: lic.institution_name || "",
      contact_person: lic.contact_person || "",
      contact_email: lic.contact_email || "",
      contact_phone: lic.contact_phone || "",
      plan_tier: lic.plan_tier || "enterprise_academic",
      max_workstations: lic.max_workstations || 5,
      enable_sis_connector: lic.enable_sis_connector !== false,
      enable_custom_qr: lic.enable_custom_qr !== false,
      enable_bulk_documents: lic.enable_bulk_documents !== false,
      notes: lic.notes || ""
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.institution_name.trim()) {
      return toast.error("Institution Name is required.");
    }
    setIsSubmitting(true);
    try {
      const res = await updateAdminLicense(editLicenseId, editFormData);
      toast.success(res.data.msg || "Enterprise license updated!");
      setShowEditModal(false);
      fetchLicenses();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update license");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtendYear = async (licenseId) => {
    try {
      const res = await extendAdminLicense(licenseId, 365);
      toast.success(res.data.msg || "Extended for 1 year!");
      fetchLicenses();
    } catch (err) {
      toast.error("Failed to extend license");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <KeyRound size={16} /> Enterprise Desktop Licensing
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Institutional License Fleet
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Issue, track, and manage on-premise desktop licenses for universities and polytechnics.
            Monitors active campus workstations, module permissions, and annual renewals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-200"
          >
            <Plus size={16} /> Issue New License
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by institution, license key, contact name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
          <option value="revoked">Revoked</option>
        </select>
        <button
          onClick={fetchLicenses}
          className="p-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-600 hover:text-slate-900 transition-colors"
          title="Refresh table"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-indigo-600" : ""} />
        </button>
      </div>

      {/* Licenses Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading && licenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading enterprise licenses...</div>
        ) : licenses.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">No Enterprise Licenses Found</p>
            <p className="text-xs text-slate-400 mt-1">
              Issue your first license to Nile University, Babcock, or other institutions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Institution & Contact</th>
                  <th className="py-3 px-4">License Key</th>
                  <th className="py-3 px-4">Workstations</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {licenses.map((lic) => {
                  const isExpired = lic.is_expired;
                  return (
                    <tr key={lic.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Building2 size={14} className="text-indigo-600 shrink-0" />
                          <span>{lic.institution_name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {lic.contact_person || lic.contact_email ? (
                            <span>{lic.contact_person} {lic.contact_email && `(${lic.contact_email})`}</span>
                          ) : (
                            <span>Annual Enterprise Plan</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded text-[11px] font-semibold text-slate-800">
                          <span>{lic.license_key}</span>
                          <button
                            onClick={() => handleCopyKey(lic.license_key)}
                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Copy key"
                          >
                            {copiedKey === lic.license_key ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Monitor size={14} className="text-slate-400" />
                          <span>
                            {lic.active_workstations_count} / {lic.max_workstations} Seats
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{lic.expires_at?.split("T")[0]}</div>
                        <div className="text-[10px] text-slate-400">
                          {isExpired ? (
                            <span className="text-red-500 font-bold">Expired</span>
                          ) : (
                            <span>365-day cycle</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            lic.status === "active" && !isExpired
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : lic.status === "suspended"
                              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                              : "bg-red-50 text-red-700 border border-red-200/60"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              lic.status === "active" && !isExpired
                                ? "bg-emerald-500"
                                : lic.status === "suspended"
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                          />
                          {lic.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(lic)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit License & Seats"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleExtendYear(lic.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Add 1 Year"
                          >
                            +1 Year
                          </button>
                          {lic.status === "active" ? (
                            <button
                              onClick={() => handleStatusChange(lic.id, "suspended")}
                              className="px-2 py-1 text-[11px] font-semibold text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(lic.id, "active")}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Issue New License */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound size={20} className="text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 mb-0">Issue Enterprise License</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateLicense} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Institution Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nile University — Academic Division"
                  value={formData.institution_name}
                  onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Contact Officer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. Academic Registrar"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Official Email</label>
                  <input
                    type="email"
                    placeholder="registrar@nileuniversity.edu.ng"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Max Workstations (Seats)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.max_workstations}
                    onChange={(e) => setFormData({ ...formData, max_workstations: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Validity Period (Days)</label>
                  <input
                    type="number"
                    min="30"
                    max="1825"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 365 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Module Toggles */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200/60">
                <span className="block font-bold text-slate-700">Enterprise Modules Enabled</span>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enable_sis_connector}
                    onChange={(e) => setFormData({ ...formData, enable_sis_connector: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Campus SIS SQL Database Connector (Live Pull)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enable_custom_qr}
                    onChange={(e) => setFormData({ ...formData, enable_custom_qr: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Custom Verification Portal & Air-Gapped No-QR Mode</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enable_bulk_documents}
                    onChange={(e) => setFormData({ ...formData, enable_bulk_documents: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Bulk Academic Letters & Transcript Issuance (A4 Portrait)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Generating..." : "Issue License"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Edit License & Seats */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound size={20} className="text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 mb-0">Edit Enterprise License &amp; Seats</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Institution Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nile University — Academic Division"
                  value={editFormData.institution_name}
                  onChange={(e) => setEditFormData({ ...editFormData, institution_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Contact Officer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. Academic Registrar"
                    value={editFormData.contact_person}
                    onChange={(e) => setEditFormData({ ...editFormData, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Official Email</label>
                  <input
                    type="email"
                    placeholder="registrar@nileuniversity.edu.ng"
                    value={editFormData.contact_email}
                    onChange={(e) => setEditFormData({ ...editFormData, contact_email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Workstations / Seats
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={editFormData.max_workstations}
                    onChange={(e) => setEditFormData({ ...editFormData, max_workstations: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Campus computers authorized to use this key
                  </span>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+234..."
                    value={editFormData.contact_phone}
                    onChange={(e) => setEditFormData({ ...editFormData, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Module Toggles */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200/60">
                <span className="block font-bold text-slate-700">Enterprise Modules Enabled</span>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.enable_sis_connector}
                    onChange={(e) => setEditFormData({ ...editFormData, enable_sis_connector: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Campus SIS SQL Database Connector (Live Pull)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.enable_custom_qr}
                    onChange={(e) => setEditFormData({ ...editFormData, enable_custom_qr: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Custom Verification Portal &amp; Air-Gapped No-QR Mode</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.enable_bulk_documents}
                    onChange={(e) => setEditFormData({ ...editFormData, enable_bulk_documents: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Bulk Academic Letters &amp; Transcript Issuance (A4 Portrait)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLicensesPage;
