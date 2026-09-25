import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  getGroups,
  createGroup,
  updateGroup,
  getGroupDetails,
  deleteGroup,
  sendGroupBulkEmail,
  downloadGroupBulkPDF,
  getCertificates,
  getTemplates,
  sendCertificateEmail,
  getCertificatePDF,
  getCertificatePNG,
  deleteCertificate,
  getGroupAnalytics,
  addCertificatesToGroup,
} from "../api";
import toast, { Toaster } from "react-hot-toast";
import { Modal, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  Folder,
  Plus,
  Trash2,
  Send,
  ChevronLeft,
  ChevronRight,
  Mail,
  CheckCircle,
  Download,
  Lock,
  MoreVertical,
  Users,
  Search,
  Filter,
  Eye,
  Pencil,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Award,
  Upload,
  LayoutTemplate,
  Bell,
  X,
  BarChart2,
  Sparkles,
  Check,
  CheckSquare,
  Square,
  RefreshCw,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { SERVER_BASE_URL } from "../config";

const FolderSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex flex-col animate-pulse">
        <div className="aspect-[1.5/1] bg-gray-100 border border-gray-100 rounded-xl" />
        <div className="h-3 bg-gray-200 rounded mt-2.5 w-2/3 mx-auto" />
      </div>
    ))}
  </div>
);

const CardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex flex-col animate-pulse">
        <div className="aspect-[1.414/1] bg-gray-100 border border-gray-100 rounded-xl" />
        <div className="h-3.5 bg-gray-200 rounded mt-2.5 w-3/4" />
        <div className="h-3 bg-gray-200 rounded mt-1.5 w-1/2" />
      </div>
    ))}
  </div>
);

const MiniGroupSparkline = ({ data = [], color = "#5B4CF5" }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 100;
  const height = 26;
  const padding = 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / Math.max(data.length - 1, 1)) * (width - 2 * padding);
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polylinePoints = points.join(" ");
  const areaPoints = `${padding},${height} ${polylinePoints} ${width - padding},${height}`;

  return (
    <svg className="w-24 h-7 shrink-0 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="groupMiniGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#groupMiniGrad)" />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylinePoints}
      />
    </svg>
  );
};

const GroupAnalyticsWidget = ({ isFreeUser, analytics, loading, onUpgradeClick }) => {
  if (isFreeUser) {
    return (
      <div
        onClick={onUpgradeClick}
        className="group/lock cursor-pointer relative overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50/90 hover:bg-slate-100/90 p-2 sm:px-3 sm:py-2 flex items-center gap-2.5 transition-all shadow-2xs"
        title="Group performance analytics (Pro)"
      >
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
          <Lock size={13} />
        </div>
        <div className="pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-800">Group Analytics</span>
            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-[#5B4CF5] text-white">PRO</span>
          </div>
          <span className="text-[9px] text-slate-400 font-medium">Click to unlock live scans</span>
        </div>
        <div className="opacity-30 blur-[1px] hidden sm:block">
          <MiniGroupSparkline data={[2, 5, 8, 4, 9, 12, 14]} color="#5B4CF5" />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-2.5 px-3 flex items-center gap-3 animate-pulse h-12 shadow-2xs">
        <div className="w-16 h-3 bg-slate-200 rounded" />
        <div className="w-20 h-6 bg-slate-100 rounded" />
      </div>
    );
  }

  const stats = analytics?.stats || { total_views: 0, send_rate: 0, total_certs: 0 };
  const viewsTrend = analytics?.chart?.views || [0, 0, 0, 0, 0, 0, 0];

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-2 sm:px-3 sm:py-2 flex items-center gap-3 shadow-2xs">
      <div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">External Scans</span>
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
            {stats.total_views}
          </span>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded-full">
            {stats.send_rate}% sent
          </span>
        </div>
      </div>
      <div className="pl-2 border-l border-slate-100 hidden sm:block">
        <div className="text-[9px] text-slate-400 font-semibold mb-0.5">7-Day Activity</div>
        <MiniGroupSparkline data={viewsTrend} color="#5B4CF5" />
      </div>
    </div>
  );
};

function GroupsPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [groups, setGroups] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [viewingGroup, setViewingGroup] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  // Group Editing State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupDesc, setEditGroupDesc] = useState("");
  const [updatingGroup, setUpdatingGroup] = useState(false);

  // Group Analytics State
  const [groupAnalytics, setGroupAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Add Certificates to Group State
  const [showAddCertsModal, setShowAddCertsModal] = useState(false);
  const [selectedCertIds, setSelectedCertIds] = useState(new Set());
  const [addCertsSearch, setAddCertsSearch] = useState("");
  const [addingCertsLoading, setAddingCertsLoading] = useState(false);

  // Pro Upgrade Prompt Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeatureText, setUpgradeFeatureText] = useState("");

  // Search & Filtering States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, emailed, draft
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, name

  // Individual Actions States
  const [sendingId, setSendingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadFormatCert, setDownloadFormatCert] = useState(null);

  // Custom Delete Modal State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'group' | 'cert', id, name, certCount }

  const isFreeUser = user && user.role === "free";

  const navLinks = [
    { name: "Overview", path: "/dashboard" },
    { name: "Templates", path: "/dashboard/templates" },
    { name: "Groups", path: "/dashboard/groups" },
    { name: "Analytics", path: "/dashboard/analytics" },
    { name: "Settings", path: "/dashboard/settings" },
  ];

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const [groupsRes, certsRes, templatesRes] = await Promise.all([
        getGroups(page),
        getCertificates(),
        getTemplates()
      ]);
      setGroups(groupsRes.data.groups);
      setCurrentPage(groupsRes.data.current_page);
      setTotalPages(groupsRes.data.pages);
      setCertificates(certsRes.data);
      setTemplates(templatesRes.data.templates);
    } catch (error) {
      toast.error("Could not fetch groups page data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!viewingGroup) {
      fetchData(currentPage);
    }
  }, [currentPage, viewingGroup]);

  const fetchGroupAnalytics = async (groupId) => {
    if (isFreeUser) return;
    setLoadingAnalytics(true);
    try {
      const res = await getGroupAnalytics(groupId);
      if (!res.data.upgrade_required) {
        setGroupAnalytics(res.data);
      }
    } catch (err) {
      console.warn("Could not load group analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      return toast.error("Group name cannot be empty.");
    }
    const promise = createGroup(newGroupName.trim(), newGroupDesc.trim());
    toast.promise(promise, {
      loading: "Creating group...",
      success: (res) => {
        setShowCreateModal(false);
        setNewGroupName("");
        setNewGroupDesc("");
        fetchData(1);
        return res.data.msg;
      },
      error: (err) => err.response?.data?.msg || "Failed to create group.",
    });
  };

  const handleViewGroup = async (group) => {
    setViewingGroup(group);
    setLoadingDetails(true);
    setGroupAnalytics(null);
    try {
      const res = await getGroupDetails(group.id);
      setGroupDetails(res.data);
      if (!isFreeUser) {
        fetchGroupAnalytics(group.id);
      }
    } catch (error) {
      toast.error("Could not fetch group details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenEditGroup = (group) => {
    setEditGroupName(group.name || "");
    setEditGroupDesc(group.description || groupDetails?.description || "");
    setShowEditModal(true);
  };

  const handleUpdateGroupSubmit = async () => {
    if (!editGroupName.trim()) {
      return toast.error("Group name cannot be empty.");
    }
    setUpdatingGroup(true);
    try {
      const res = await updateGroup(viewingGroup.id, {
        name: editGroupName.trim(),
        description: editGroupDesc.trim()
      });
      toast.success(res.data.msg || "Group updated successfully.");
      setShowEditModal(false);
      setViewingGroup(prev => ({
        ...prev,
        name: editGroupName.trim(),
        description: editGroupDesc.trim()
      }));
      setGroupDetails(prev => prev ? ({
        ...prev,
        name: editGroupName.trim(),
        description: editGroupDesc.trim()
      }) : null);
      setGroups(prev => prev.map(g => g.id === viewingGroup.id ? {
        ...g,
        name: editGroupName.trim(),
        description: editGroupDesc.trim()
      } : g));
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update group.");
    } finally {
      setUpdatingGroup(false);
    }
  };

  const handleOpenAddCertsModal = () => {
    if (isFreeUser) {
      setUpgradeFeatureText("Adding existing certificates to groups is an exclusive Pro feature. Upgrade your plan to organize certificates into batches at any time.");
      setShowUpgradeModal(true);
      return;
    }
    setSelectedCertIds(new Set());
    setAddCertsSearch("");
    setShowAddCertsModal(true);
  };

  const availableCertsForAdding = useMemo(() => {
    if (!certificates || !viewingGroup) return [];
    return certificates.filter((c) => {
      const alreadyInGroup = groupDetails?.certificates?.some((gc) => gc.id === c.id) || c.group_id === viewingGroup.id;
      if (alreadyInGroup) return false;
      if (!addCertsSearch.trim()) return true;
      const s = addCertsSearch.toLowerCase();
      return (
        (c.recipient_name && c.recipient_name.toLowerCase().includes(s)) ||
        (c.recipient_email && c.recipient_email.toLowerCase().includes(s)) ||
        (c.course_title && c.course_title.toLowerCase().includes(s)) ||
        (c.id && c.id.toString().includes(s))
      );
    });
  }, [certificates, viewingGroup, groupDetails, addCertsSearch]);

  const handleToggleCertSelection = (certId) => {
    setSelectedCertIds((prev) => {
      const next = new Set(prev);
      if (next.has(certId)) {
        next.delete(certId);
      } else {
        next.add(certId);
      }
      return next;
    });
  };

  const handleSelectAllCerts = () => {
    if (selectedCertIds.size === availableCertsForAdding.length) {
      setSelectedCertIds(new Set());
    } else {
      setSelectedCertIds(new Set(availableCertsForAdding.map((c) => c.id)));
    }
  };

  const handleAddCertificatesSubmit = async () => {
    if (selectedCertIds.size === 0) {
      return toast.error("Please select at least one certificate.");
    }
    setAddingCertsLoading(true);
    try {
      const ids = Array.from(selectedCertIds);
      const res = await addCertificatesToGroup(viewingGroup.id, ids);
      toast.success(res.data.msg || "Certificates added successfully!");
      setShowAddCertsModal(false);
      setSelectedCertIds(new Set());

      // Refresh group details
      const detailsRes = await getGroupDetails(viewingGroup.id);
      setGroupDetails(detailsRes.data);
      setViewingGroup((prev) => ({
        ...prev,
        certificate_count: detailsRes.data.certificates?.length || 0,
      }));

      // Update local certificates state
      setCertificates((prev) =>
        prev.map((c) => (ids.includes(c.id) ? { ...c, group_id: viewingGroup.id } : c))
      );

      // Refresh group analytics
      if (!isFreeUser) {
        fetchGroupAnalytics(viewingGroup.id);
      }

      // Update groups list
      setGroups((prev) =>
        prev.map((g) =>
          g.id === viewingGroup.id
            ? { ...g, certificate_count: detailsRes.data.certificates?.length || 0 }
            : g
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to add certificates to group.");
    } finally {
      setAddingCertsLoading(false);
    }
  };

  const confirmDeleteAction = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "group") {
      const promise = deleteGroup(deleteTarget.id);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      toast.promise(promise, {
        loading: "Deleting group...",
        success: (res) => {
          setViewingGroup(null);
          setGroupDetails(null);
          fetchData(1);
          return res.data.msg;
        },
        error: (err) => err.response?.data?.msg || "Failed to delete group.",
      });
    } else if (deleteTarget.type === "cert") {
      const promise = deleteCertificate(deleteTarget.id);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      toast.promise(promise, {
        loading: "Deleting certificate...",
        success: () => {
          setCertificates(prev => prev.filter(c => c.id !== deleteTarget.id));
          if (groupDetails) {
            setGroupDetails(prev => ({
              ...prev,
              certificates: prev.certificates.filter(c => c.id !== deleteTarget.id)
            }));
          }
          return "Certificate deleted successfully.";
        },
        error: (err) => err.response?.data?.msg || "Failed to delete certificate.",
      });
    }
  };

  const handleSendBulkEmail = async (groupId) => {
    const promise = sendGroupBulkEmail(groupId);
    toast.promise(promise, {
      loading: "Queueing background email dispatch...",
      success: (res) => {
        const jobId = res.data?.job_id;
        if (jobId) {
          localStorage.setItem("proofdeck_active_job_id", jobId.toString());
          window.dispatchEvent(
            new CustomEvent("proofdeck-job-started", { detail: { jobId } })
          );
        }
        setTimeout(() => handleViewGroup(viewingGroup), 1000);
        return res.data.msg || "Emails are being sent in the background!";
      },
      error: (err) => err.response?.data?.msg || "Failed to send emails.",
    });
  };

  const handleBulkDownload = () => {
    setIsBulkDownloading(true);
    const promise = downloadGroupBulkPDF(viewingGroup.id);
    toast.promise(promise, {
      loading: "Generating ZIP file... This may take a moment.",
      success: (response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        const filename = `${viewingGroup.name
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase()}_certificates.zip`;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        return "Download started!";
      },
      error: (err) => err.response?.data?.msg || "Failed to download ZIP file.",
    });
    promise.finally(() => setIsBulkDownloading(false));
  };

  // --- Individual Certificate Handlers ---
  const handleSendEmail = (certId) => {
    setSendingId(certId);
    const promise = sendCertificateEmail(certId);
    toast.promise(promise, {
      loading: "Sending email...",
      success: (res) => {
        const updateStatus = (certs) => certs.map((c) => c.id === certId ? { ...c, sent_at: new Date().toISOString() } : c);
        setCertificates(updateStatus);
        if (groupDetails) {
          setGroupDetails(prev => ({
            ...prev,
            certificates: updateStatus(prev.certificates)
          }));
        }
        return res.data.msg || "Email sent successfully!";
      },
      error: (err) => err.response?.data?.msg || "Failed to send email.",
    });
    promise.finally(() => setSendingId(null));
  };

  const handleDownload = (cert) => {
    setDownloadingId(cert.id);
    const promise = getCertificatePDF(cert.id);
    toast.promise(promise, {
      loading: "Generating PDF...",
      success: (response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        const saneName = cert.recipient_name?.replace(/[\W_]+/g, "_").replace(/^_+|_+$/g, "");
        const filename = saneName ? `${saneName}.pdf` : `doc_${cert.verification_id || cert.id}.pdf`;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        return "Download started!";
      },
      error: (err) => err.response?.data?.msg || "Failed to download PDF.",
    });
    promise.finally(() => setDownloadingId(null));
  };

  const handleDownloadPNG = (cert) => {
    setDownloadingId(cert.id);
    const promise = getCertificatePNG(cert.id);
    toast.promise(promise, {
      loading: "Generating PNG image...",
      success: (response) => {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: "image/png" }));
        const link = document.createElement("a");
        link.href = url;
        const saneName = cert.recipient_name?.replace(/[\W_]+/g, "_").replace(/^_+|_+$/g, "");
        const filename = saneName ? `${saneName}.png` : `doc_${cert.verification_id || cert.id}.png`;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        return "PNG download started!";
      },
      error: (err) => {
        if (err.response?.status === 403 && err.response?.data?.upgrade_required) {
          return "PNG downloads are exclusively available on Enterprise.";
        }
        return err.response?.data?.msg || "Failed to download PNG.";
      },
    });
    promise.finally(() => setDownloadingId(null));
  };

  const isEnterpriseUser = Boolean(user?.is_enterprise || user?.role === 'enterprise' || user?.effective_role === 'enterprise');

  const onDownloadClick = (cert) => {
    if (isEnterpriseUser) {
      setDownloadFormatCert(cert);
    } else {
      handleDownload(cert);
    }
  };

  // --- Mappings & Filtering ---
  const getCertLayoutStyle = (cert) => {
    const globalCert = certificates.find(c => c.id === cert.id);
    const templateId = globalCert ? globalCert.template_id : cert.template_id;
    if (!templateId) return "modern";
    const template = templates.find(t => String(t.id) === String(templateId));
    return template ? template.layout_style : "modern";
  };

  const filteredGroups = useMemo(() => {
    return groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [groups, searchTerm]);

  const filteredCertificates = useMemo(() => {
    const baseCerts = viewingGroup ? (groupDetails?.certificates || []) : certificates;
    return baseCerts.filter((cert) => {
      const name = (cert.recipient_name || "").toLowerCase();
      const course = (cert.course_title || "").toLowerCase();
      const term = (searchTerm || "").toLowerCase().trim();
      const matchesSearch = !term || name.includes(term) || course.includes(term);

      const matchesType =
        filterType === "all"
          ? true
          : filterType === "emailed"
          ? !!cert.sent_at
          : !cert.sent_at;

      return matchesSearch && matchesType;
    }).sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.issue_date || b.created_at).getTime() - new Date(a.issue_date || a.created_at).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.issue_date || a.created_at).getTime() - new Date(b.issue_date || b.created_at).getTime();
      } else if (sortBy === "name") {
        return (a.recipient_name || "").localeCompare(b.recipient_name || "");
      }
      return 0;
    });
  }, [certificates, groupDetails, viewingGroup, searchTerm, filterType, sortBy]);

  // --- SVG Mini-mockup Previews ---
  const renderMiniMockup = (layoutStyle) => {
    switch (layoutStyle) {
      case "classic":
        return (
          <svg className="w-full h-full bg-[#fdfdfd]" viewBox="0 0 140 100">
            <rect x="5" y="5" width="130" height="90" fill="none" stroke="#1e3a8a" strokeWidth="1.5" />
            <rect x="8" y="8" width="124" height="84" fill="none" stroke="#d97706" strokeWidth="0.5" />
            <line x1="30" y1="30" x2="110" y2="30" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="45" y1="50" x2="95" y2="50" stroke="#1e3a8a" strokeWidth="2.5" />
            <line x1="50" y1="65" x2="90" y2="65" stroke="#cbd5e1" strokeWidth="1" />
          </svg>
        );
      case "modern":
        return (
          <svg className="w-full h-full bg-slate-50" viewBox="0 0 140 100">
            <rect x="0" y="0" width="8" height="100" fill="#2563eb" />
            <circle cx="25" cy="20" r="6" fill="#facc15" />
            <line x1="40" y1="20" x2="110" y2="20" stroke="#e2e8f0" strokeWidth="2" />
            <line x1="20" y1="45" x2="80" y2="45" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="20" y1="60" x2="100" y2="60" stroke="#64748b" strokeWidth="1" />
          </svg>
        );
      case "receipt":
        return (
          <svg className="w-full h-full bg-white" viewBox="0 0 140 100">
            <rect x="5" y="5" width="130" height="90" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="15" y1="18" x2="55" y2="18" stroke="#475569" strokeWidth="2" />
            <line x1="15" y1="35" x2="125" y2="35" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="15" y1="50" x2="70" y2="50" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="15" y1="65" x2="80" y2="65" stroke="#94a3b8" strokeWidth="1.5" />
          </svg>
        );
      case "elegant_serif":
        return (
          <svg className="w-full h-full bg-[#fbfbf8]" viewBox="0 0 140 100">
            <rect x="6" y="6" width="128" height="88" fill="none" stroke="#27272a" strokeWidth="0.75" />
            <rect x="10" y="10" width="120" height="80" fill="none" stroke="#991b1b" strokeWidth="0.25" strokeDasharray="2,1" />
            <line x1="30" y1="35" x2="110" y2="35" stroke="#1f2937" strokeWidth="1.5" />
            <line x1="45" y1="55" x2="95" y2="55" stroke="#991b1b" strokeWidth="1" />
          </svg>
        );
      default:
        return (
          <svg className="w-full h-full bg-slate-50" viewBox="0 0 140 100">
            <rect x="8" y="8" width="124" height="84" fill="none" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="25" y1="30" x2="115" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="30" y1="50" x2="110" y2="50" stroke="#64748b" strokeWidth="2.5" />
            <line x1="40" y1="70" x2="100" y2="70" stroke="#cbd5e1" strokeWidth="1" />
          </svg>
        );
    }
  };

  const renderCertificateCardPreview = (cert) => {
    const globalCert = certificates.find(c => c.id === cert.id);
    const templateId = globalCert ? globalCert.template_id : cert.template_id;
    const template = templateId ? templates.find(t => String(t.id) === String(templateId)) : null;

    if (template && (template.layout_style === "visual" || template.background_url)) {
      const bg = template.background_url || template.layout_data?.background?.image;
      const bgUrl = bg
        ? (bg.startsWith("data:") || bg.startsWith("blob:") || bg.startsWith("http"))
          ? bg
          : `${SERVER_BASE_URL}${bg}`
        : "";
      return (
        <div
          className="w-full h-full bg-white"
          style={{
            backgroundImage: bgUrl ? `url("${bgUrl}")` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      );
    }

    const layoutStyle = template ? template.layout_style : "modern";
    return renderMiniMockup(layoutStyle);
  };

  const renderDownloadTooltip = (props) => (
    <Tooltip id="download-tooltip" {...props}>
      <div className="flex items-center gap-1">
        <Lock size={12} />
        <span>Upgrade to download all as ZIP</span>
      </div>
    </Tooltip>
  );

  const DownloadButton = () => {
    const buttonContent = (
      <>
        {isBulkDownloading ? (
          <div className="animate-spin h-3.5 w-3.5 border-2 border-slate-600 border-t-transparent rounded-full mr-1.5" />
        ) : (
          <Download size={13} className="mr-1.5" />
        )}
        <span>Download All</span>
      </>
    );

    if (isFreeUser) {
      return (
        <OverlayTrigger placement="top" overlay={renderDownloadTooltip}>
          <span className="inline-block">
            <button
              className="inline-flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-lg py-1.5 px-3 opacity-60 cursor-not-allowed text-xs font-semibold shadow-sm"
              disabled
              style={{ pointerEvents: "none" }}
            >
              {buttonContent}
            </button>
          </span>
        </OverlayTrigger>
      );
    }

    return (
      <button
        className="inline-flex items-center justify-center bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg py-1.5 px-3 transition-colors font-semibold text-xs shadow-sm"
        onClick={handleBulkDownload}
        disabled={isBulkDownloading}
      >
        {buttonContent}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="w-full pb-20">
        {/* Navigation Header Skeleton */}
        <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 px-4 py-3 rounded-b-lg animate-pulse">
          <div className="flex justify-between items-center max-w-[1600px] mx-auto h-8">
            <div className="w-1/3 bg-gray-200 h-4 rounded" />
            <div className="w-1/4 bg-gray-250 h-6 rounded bg-gray-200" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="border border-slate-200/80 bg-white rounded-xl shadow-sm p-6 space-y-8">
          <div>
            <div className="mb-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
            <FolderSkeleton />
          </div>
          <div className="pt-6 border-t border-slate-100">
            <div className="mb-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      <Toaster position="top-right" />

      {/* --- 1. Top Navigation Bar (Header - Locked to Top) --- */}
      <div className="border-b border-slate-200/80 bg-white mb-4 sm:mb-6 -mt-6 px-4 py-3 rounded-b-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1600px] mx-auto">
          {/* Row 1: Page Title & Mobile Action */}
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-0 truncate">
              {viewingGroup ? `Batch: ${viewingGroup.name}` : "Batches"}
            </h1>

            {!viewingGroup && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="sm:hidden inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-1 px-2.5 font-semibold text-xs shadow-sm"
              >
                <Plus size={13} className="mr-1 text-white" />
                New Group
              </button>
            )}
          </div>

          {/* Row 2: Search, Filters, Desktop Create Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder={viewingGroup ? "Search certificates..." : "Search batches..."}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-lg focus:bg-white focus:border-slate-400 transition-all text-xs outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-1.5">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 sm:flex-none px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 outline-none shadow-sm cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="emailed">Emailed</option>
                <option value="draft">Pending</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 outline-none shadow-sm cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
              </select>

              {!viewingGroup && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="hidden sm:inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-1.5 px-3.5 transition-all font-semibold text-xs shadow-sm"
                >
                  <Plus size={14} className="mr-1.5 text-white" />
                  New Group
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. Main Cohesive Grid Panel --- */}
      <div className="border border-slate-200/80 bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-8">
        
        {/* --- VIEW 1: EXPLORER DASHBOARD (viewingGroup === null) --- */}
        {!viewingGroup ? (
          <>
            {/* Section A: Batches (Folders) */}
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800">Certificate Batches</h3>
                <p className="text-[10px] text-slate-400">Organize your issued certificates in folder batches</p>
              </div>

              {filteredGroups.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                  {filteredGroups.map((group) => (
                    <div key={group.id} className="flex flex-col group/folder">
                      {/* Folder Box */}
                      <div
                        onClick={() => handleViewGroup(group)}
                        className="aspect-[1.5/1] bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all rounded-xl flex flex-col justify-between p-3 sm:p-4 cursor-pointer relative"
                      >
                        <Folder className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500 fill-indigo-100/30 group-hover/folder:fill-indigo-100/60 transition-colors" />
                        
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users size={11} /> {group.certificate_count} cert{group.certificate_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      
                      {/* Folder Name underneath */}
                      <span className="text-xs font-bold text-slate-800 text-center mt-2.5 truncate w-full px-1 group-hover/folder:text-indigo-650 transition-colors">
                        {group.name}
                      </span>
                      {group.description && (
                        <span className="text-[10px] text-slate-400 text-center truncate w-full px-1 mt-0.5" title={group.description}>
                          {group.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <Folder size={32} className="text-slate-300 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-700">No batches match your search</h4>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-3 bg-white border border-slate-200 text-slate-700 rounded-lg py-1 px-3.5 hover:bg-slate-50 transition-all font-semibold text-xs shadow-sm"
                  >
                    Create a group
                  </button>
                </div>
              )}
            </div>

            {/* Section B: All Certificates (Files Grid) */}
            <div className="pt-6 border-t border-slate-100">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800">All Credentials</h3>
                <p className="text-[10px] text-slate-400">Browse individual documents across all folders</p>
              </div>

              {filteredCertificates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredCertificates.map((cert) => {
                    return (
                      <div key={cert.id} className="flex flex-col group/file">
                        {/* File Preview Card */}
                        <div className="aspect-[1.414/1] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm relative flex flex-col justify-between group">
                          {/* Mini Layout Preview Render */}
                          <div className="w-full h-full bg-white flex items-center justify-center select-none pointer-events-none">
                            {renderCertificateCardPreview(cert)}
                          </div>

                          {/* Hover Actions Overlay */}
                          <div className="bg-slate-950/65 opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center gap-1.5 z-10">
                            <button
                              onClick={() => handleSendEmail(cert.id)}
                              className="p-1.5 bg-white/10 hover:bg-white text-white hover:text-indigo-600 border border-white/20 hover:border-white rounded-lg transition-all shadow"
                              title={cert.sent_at ? "Resend Email" : "Send Email"}
                            >
                              {sendingId === cert.id ? <div className="animate-spin h-3.5 w-3.5 border-2 border-indigo-600 border-t-transparent rounded-full" /> : <Mail className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => onDownloadClick(cert)}
                              className="p-1.5 bg-white/10 hover:bg-white text-white hover:text-slate-800 border border-white/20 hover:border-white rounded-lg transition-all shadow"
                              title="Download Certificate"
                            >
                              {downloadingId === cert.id ? <div className="animate-spin h-3.5 w-3.5 border-2 border-slate-600 border-t-transparent rounded-full" /> : <Download className="w-3.5 h-3.5" />}
                            </button>
                            <Link
                              to={`/dashboard/view/${cert.verification_id || cert.id}`}
                              className="p-1.5 bg-white/10 hover:bg-white text-white hover:text-indigo-600 border border-white/20 hover:border-white rounded-lg transition-all shadow"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              to={`/dashboard/edit/${cert.id}`}
                              className="p-1.5 bg-white/10 hover:bg-white text-white hover:text-slate-800 border border-white/20 hover:border-white rounded-lg transition-all shadow"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => {
                                setDeleteTarget({ type: 'cert', id: cert.id, name: cert.recipient_name });
                                setShowDeleteConfirm(true);
                              }}
                              className="p-1.5 bg-white/10 hover:bg-red-650 text-white hover:text-white border border-white/20 hover:border-red-650 rounded-lg transition-all shadow hover:bg-red-600 hover:border-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* File Name underneath */}
                        <span className="text-xs font-semibold text-slate-850 mt-2.5 truncate w-full px-1 group-hover/file:text-indigo-650 transition-colors">
                          {cert.recipient_name.replace(/\s+/g, "_")}.pdf
                        </span>
                        
                        {/* File Info */}
                        <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5 px-1 font-semibold">
                          <span>{new Date(cert.issue_date).toLocaleDateString()}</span>
                          <span className={cert.sent_at ? "text-emerald-650" : "text-slate-400"}>
                            {cert.sent_at ? "Emailed" : "Pending"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  No credentials found.
                </div>
              )}
            </div>
          </>
        ) : (
          /* --- VIEW 2: SINGLE GROUP DETAIL EXPLORER (viewingGroup !== null) --- */
          <div className="space-y-6">
            {/* Header / Toolbar inside panel */}
            <div className="border-b border-slate-100 pb-5">
              <button
                onClick={() => { setViewingGroup(null); setGroupDetails(null); }}
                className="mb-3.5 flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors font-semibold text-[11px] bg-transparent border-0 p-0"
              >
                <ArrowLeft size={13} /> Back to Batches
              </button>

              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="max-w-xl">
                  <h1 className="text-lg font-bold text-slate-850 mb-1 flex items-center gap-2">
                    <Folder size={18} className="text-[#5B4CF5] fill-indigo-100/20" />
                    <span>{viewingGroup.name}</span>
                    <button
                      onClick={() => handleOpenEditGroup(viewingGroup)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                      title="Edit Batch Details"
                    >
                      <Pencil size={13} />
                    </button>
                  </h1>
                  
                  <div className="flex items-center text-slate-400 text-[10px] gap-2 font-medium">
                    <span>Folder</span>
                    <span className="text-slate-300">•</span>
                    <span>
                      {groupDetails?.certificates?.length ?? viewingGroup.certificate_count} certificate{((groupDetails?.certificates?.length ?? viewingGroup.certificate_count) !== 1) ? "s" : ""}
                    </span>
                    <span className="text-slate-350">•</span>
                    <span>Created {new Date(viewingGroup.created_at).toLocaleDateString()}</span>
                  </div>

                  {(groupDetails?.description || viewingGroup.description) && (
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-200/60 mb-0">
                      {groupDetails?.description || viewingGroup.description}
                    </p>
                  )}
                </div>

                {/* Top Right: Graphical Chart & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <GroupAnalyticsWidget
                    isFreeUser={isFreeUser}
                    analytics={groupAnalytics}
                    loading={loadingAnalytics}
                    onUpgradeClick={() => {
                      setUpgradeFeatureText("Live external scans and recipient analytics are exclusive to Pro and Enterprise plans.");
                      setShowUpgradeModal(true);
                    }}
                  />

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenAddCertsModal}
                      className="inline-flex items-center justify-center bg-[#5B4CF5] hover:bg-[#4433E0] text-white rounded-lg py-1.5 px-3 transition-all font-semibold text-xs shadow-xs cursor-pointer"
                      title="Add certificates to this group"
                    >
                      <Plus size={13} className="mr-1 text-white" />
                      Add Certs
                    </button>
                    <DownloadButton />
                    <button
                      onClick={() => handleSendBulkEmail(viewingGroup.id)}
                      className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-1.5 px-3 transition-colors font-semibold text-xs shadow-xs"
                    >
                      <Send size={13} className="mr-1 text-white" />
                      Send to Unsent
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget({ type: 'group', id: viewingGroup.id, name: viewingGroup.name, certCount: viewingGroup.certificate_count });
                        setShowDeleteConfirm(true);
                      }}
                      className="inline-flex items-center justify-center bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg py-1.5 px-2.5 transition-colors font-semibold text-xs shadow-2xs"
                    >
                      <Trash2 size={13} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificates List in selected group */}
            {loadingDetails ? (
              <CardSkeleton />
            ) : (
              <>
                {filteredCertificates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filteredCertificates.map((cert) => {
                      return (
                        <div key={cert.id} className="flex flex-col group/file">
                          {/* File Preview Card */}
                          <div className="aspect-[1.414/1] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm relative flex flex-col justify-between group">
                            {/* Mini Layout Preview Render */}
                            <div className="w-full h-full bg-white flex items-center justify-center select-none pointer-events-none">
                              {renderCertificateCardPreview(cert)}
                            </div>

                            {/* Hover Actions Overlay */}
                            <div className="bg-slate-950/65 opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center gap-1.5 z-10">
                              <button
                                onClick={() => handleSendEmail(cert.id)}
                                className="p-1.5 bg-white/10 hover:bg-white text-white hover:text-indigo-650 border border-white/20 hover:border-white rounded-lg transition-all shadow hover:text-indigo-600 hover:border-white"
                                title={cert.sent_at ? "Resend Email" : "Send Email"}
                              >
                                {sendingId === cert.id ? <div className="animate-spin h-3.5 w-3.5 border-2 border-indigo-600 border-t-transparent rounded-full" /> : <Mail className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => onDownloadClick(cert)}
                                className="p-1.5 bg-white/10 hover:bg-white text-white hover:text-slate-800 border border-white/20 hover:border-white rounded-lg transition-all shadow"
                                title="Download Certificate"
                              >
                                {downloadingId === cert.id ? <div className="animate-spin h-3.5 w-3.5 border-2 border-slate-600 border-t-transparent rounded-full" /> : <Download className="w-3.5 h-3.5" />}
                              </button>
                              <Link
                                to={`/dashboard/view/${cert.verification_id || cert.id}`}
                                className="p-1.5 bg-white/10 hover:bg-white text-white hover:text-indigo-650 border border-white/20 hover:border-white rounded-lg transition-all shadow hover:text-indigo-600 hover:border-white"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <Link
                                to={`/dashboard/edit/${cert.id}`}
                                className="p-1.5 bg-white/10 hover:bg-white text-white hover:text-slate-800 border border-white/20 hover:border-white rounded-lg transition-all shadow"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => {
                                  setDeleteTarget({ type: 'cert', id: cert.id, name: cert.recipient_name });
                                  setShowDeleteConfirm(true);
                                }}
                                className="p-1.5 bg-white/10 hover:bg-red-600 text-white hover:text-white border border-white/20 hover:border-red-650 rounded-lg transition-all shadow hover:border-red-600"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* File Name underneath */}
                          <span className="text-xs font-semibold text-slate-800 mt-2.5 truncate w-full px-1 group-hover/file:text-indigo-600 transition-colors">
                            {(cert.recipient_name || "Certificate").replace(/\s+/g, "_")}.pdf
                          </span>
                          
                          {/* File Info */}
                          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5 px-1 font-semibold">
                            <span>{cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : ""}</span>
                            <span className={cert.sent_at ? "text-emerald-600" : "text-slate-400"}>
                              {cert.sent_at ? "Emailed" : "Pending"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <Folder size={32} className="text-slate-350 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-slate-700">
                      {groupDetails?.certificates?.length > 0 ? "No matching certificates" : "Empty batch"}
                    </h4>
                    <p className="text-slate-400 text-[10px] mt-1 max-w-xs mx-auto">
                      {groupDetails?.certificates?.length > 0 
                        ? "No certificates match the selected status filter or search query." 
                        : "This batch does not have any certificates. Go to dashboard to issue a certificate to this group."}
                    </p>
                    {groupDetails?.certificates?.length > 0 ? (
                      <button
                        onClick={() => { setSearchTerm(""); setFilterType("all"); setSortBy("newest"); }}
                        className="mt-3 inline-flex items-center justify-center bg-white border border-slate-250 text-slate-700 rounded-lg py-1.5 px-3.5 hover:bg-slate-50 transition-all font-semibold text-xs shadow-sm cursor-pointer"
                      >
                        Reset filters
                      </button>
                    ) : (
                      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
                        <button
                          onClick={handleOpenAddCertsModal}
                          className="inline-flex items-center justify-center bg-[#5B4CF5] hover:bg-[#4433E0] text-white rounded-lg py-1.5 px-3.5 transition-all font-semibold text-xs shadow-xs cursor-pointer"
                        >
                          <Plus size={13} className="mr-1.5" />
                          Add certificates to this group
                        </button>
                        <Link
                          to="/dashboard/bulk-create"
                          className="inline-flex items-center justify-center bg-white border border-slate-250 text-slate-700 rounded-lg py-1.5 px-3.5 hover:bg-slate-50 transition-all font-semibold text-xs shadow-sm decoration-none"
                        >
                          Bulk issue to this group
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!viewingGroup && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-1.5">
            {[...Array(totalPages).keys()].map((num) => (
              <button
                key={num + 1}
                onClick={() => setCurrentPage(num + 1)}
                className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                  currentPage === num + 1
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm"
                }`}
              >
                {num + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FOLDER-STYLE BEAUTIFUL CREATE GROUP MODAL */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
        backdrop="static"
        contentClassName="rounded-b-2xl rounded-tr-2xl border-2 border-indigo-650 bg-white p-6 shadow-xl relative overflow-visible mt-8 border-indigo-600"
      >
        {/* Custom Folder Tab */}
        <div className="absolute -top-[30px] left-[-2px] bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-5 py-1.5 rounded-t-xl flex items-center gap-1.5 border-t border-x border-indigo-600">
          <Folder size={11} className="fill-white/20" />
          <span>New Batch</span>
        </div>

        {/* Custom Close Button */}
        <button
          onClick={() => setShowCreateModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
        >
          <X size={15} />
        </button>

        <div className="pt-2">
          <h2 className="font-bold text-sm text-slate-800 mb-4">Create Certificate Batch</h2>
          
          <Form.Group className="mb-4">
            <Form.Label className="font-semibold text-xs text-slate-700 mb-1.5">
              Folder Name
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Summer 2025 Bootcamp"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="py-2 text-xs border-slate-250 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              autoFocus
            />
            <Form.Text className="text-[10px] text-slate-450 mt-1.5 block">
              Use a descriptive name to easily find this batch folder later.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="font-semibold text-xs text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Batch Description</span>
              <span className="text-[10px] text-slate-400 font-normal">Optional</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="e.g., Certificates for Cohort 12 Full-Stack Engineering graduates"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              className="py-2 text-xs border-slate-250 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm resize-none"
            />
          </Form.Group>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateGroup}
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-750 rounded-lg shadow-sm transition-colors hover:bg-indigo-700"
            >
              Create Folder
            </button>
          </div>
        </div>
      </Modal>

      {/* EDIT GROUP MODAL */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        backdrop="static"
        contentClassName="rounded-b-2xl rounded-tr-2xl border-2 border-[#5B4CF5] bg-white p-6 shadow-xl relative overflow-visible mt-8"
      >
        <div className="absolute -top-[30px] left-[-2px] bg-[#5B4CF5] text-white text-[10px] font-extrabold uppercase tracking-widest px-5 py-1.5 rounded-t-xl flex items-center gap-1.5 border-t border-x border-[#5B4CF5]">
          <Pencil size={11} className="fill-white/20" />
          <span>Edit Batch</span>
        </div>

        <button
          onClick={() => setShowEditModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
        >
          <X size={15} />
        </button>

        <div className="pt-2">
          <h2 className="font-bold text-sm text-slate-800 mb-4">Edit Batch Details</h2>
          
          <Form.Group className="mb-3">
            <Form.Label className="font-semibold text-xs text-slate-700 mb-1.5">
              Folder Name
            </Form.Label>
            <Form.Control
              type="text"
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              className="py-2 text-xs border-slate-250 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="font-semibold text-xs text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Batch Description</span>
              <span className="text-[10px] text-slate-400 font-normal">Optional</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="e.g., Cohort 12 Full-Stack Engineering graduation"
              value={editGroupDesc}
              onChange={(e) => setEditGroupDesc(e.target.value)}
              className="py-2 text-xs border-slate-250 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm resize-none"
            />
          </Form.Group>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateGroupSubmit}
              disabled={updatingGroup}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#5B4CF5] hover:bg-[#4433E0] rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {updatingGroup ? <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" /> : <Check size={13} />}
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* ADD CERTIFICATES TO GROUP MODAL */}
      <Modal
        show={showAddCertsModal}
        onHide={() => setShowAddCertsModal(false)}
        centered
        size="lg"
        contentClassName="rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 m-0 flex items-center gap-2">
              <Plus size={16} className="text-[#5B4CF5]" />
              <span>Add Certificates to "{viewingGroup?.name}"</span>
            </h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Select existing certificates from your workspace to organize into this batch.
            </p>
          </div>
          <button
            onClick={() => setShowAddCertsModal(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {/* Search bar & Select All */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={addCertsSearch}
                onChange={(e) => setAddCertsSearch(e.target.value)}
                placeholder="Search by recipient name, email, or course..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4CF5]/20 focus:border-[#5B4CF5] bg-white"
              />
            </div>
            {availableCertsForAdding.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllCerts}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                {selectedCertIds.size === availableCertsForAdding.length ? (
                  <>
                    <CheckSquare size={13} className="text-[#5B4CF5]" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square size={13} className="text-slate-400" />
                    Select All ({availableCertsForAdding.length})
                  </>
                )}
              </button>
            )}
          </div>

          {/* Certificate Selection Table/List */}
          <div className="max-h-[360px] overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
            {availableCertsForAdding.length > 0 ? (
              availableCertsForAdding.map((cert) => {
                const isSelected = selectedCertIds.has(cert.id);
                return (
                  <div
                    key={cert.id}
                    onClick={() => handleToggleCertSelection(cert.id)}
                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                      isSelected ? "bg-indigo-50/50 hover:bg-indigo-50/70" : "bg-white hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#5B4CF5] border-[#5B4CF5] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <span>{cert.recipient_name || "Unnamed"}</span>
                          {cert.group_id ? (
                            <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/50 px-1.5 py-0.2 rounded-full">
                              In another batch
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full">
                              Ungrouped
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {cert.course_title || "Certificate"} • {cert.recipient_email || "No email"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Award size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-bold text-slate-700 m-0">No certificates available to add</p>
                <p className="text-[11px] text-slate-400 mt-1 m-0">
                  {certificates.length === 0
                    ? "You haven't issued any certificates yet."
                    : "All existing certificates are already in this batch, or no search results match."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            {selectedCertIds.size} certificate{selectedCertIds.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddCertsModal(false)}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedCertIds.size === 0 || addingCertsLoading}
              onClick={handleAddCertificatesSubmit}
              className="px-4 py-2 text-xs font-bold text-white bg-[#5B4CF5] hover:bg-[#4433E0] rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {addingCertsLoading ? (
                <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Plus size={14} />
              )}
              Add to Batch
            </button>
          </div>
        </div>
      </Modal>

      {/* PRO UPGRADE PROMPT MODAL */}
      <Modal
        show={showUpgradeModal}
        onHide={() => setShowUpgradeModal(false)}
        centered
        contentClassName="rounded-2xl border border-indigo-100 bg-white p-6 shadow-2xl overflow-hidden"
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#5B4CF5] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Sparkles size={24} />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 mb-1">
            Upgrade to Pro for Advanced Batches
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
            {upgradeFeatureText || "Organizing existing certificates into batches and monitoring live verification performance is available on Pro and Enterprise accounts."}
          </p>

          <div className="space-y-2 text-left bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 mb-5">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <Check size={14} className="text-emerald-600 shrink-0" />
              <span>Add & re-organize certificates into custom groups at any time</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <Check size={14} className="text-emerald-600 shrink-0" />
              <span>Real-time external verification scans and employer analytics</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <Check size={14} className="text-emerald-600 shrink-0" />
              <span>Bulk email re-dispatch with custom branded email domains</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
            <Link
              to="/dashboard/settings"
              onClick={() => setShowUpgradeModal(false)}
              className="px-5 py-2 text-xs font-bold text-white bg-[#5B4CF5] hover:bg-[#4433E0] rounded-xl shadow-xs transition-all hover:scale-105 no-underline flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} />
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        show={showDeleteConfirm}
        onHide={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
        centered
        contentClassName="rounded-xl border border-slate-200/80 shadow-lg overflow-hidden"
      >
        <Modal.Body className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-full shrink-0">
              <AlertCircle size={22} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 mb-1.5">
                Confirm Deletion
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {deleteTarget?.type === "group" ? (
                  <>
                    Are you sure you want to delete the batch <strong>{deleteTarget.name}</strong>? 
                    This will permanently delete <strong>all {deleteTarget.certCount} certificates</strong> inside it. This action is irreversible.
                  </>
                ) : (
                  <>
                    Are you sure you want to delete the certificate for <strong>{deleteTarget?.name}</strong>? 
                    This action is irreversible.
                  </>
                )}
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 bg-slate-50/50 p-4">
          <button
            type="button"
            onClick={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDeleteAction}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-red-650 hover:bg-red-700 rounded-lg shadow-sm transition-colors bg-red-600 hover:bg-red-700"
          >
            Confirm Delete
          </button>
        </Modal.Footer>
      </Modal>

      {/* Download Format Modal (Enterprise Only) */}
      {downloadFormatCert && isEnterpriseUser && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl p-5 max-w-xs w-full border border-slate-100 relative">
            <div className="text-center mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2 text-indigo-600 border border-indigo-100">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Download Format</h3>
              <p className="text-slate-500 text-[11px] mt-1">
                Choose format for <strong>{downloadFormatCert.recipient_name}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const c = downloadFormatCert;
                  setDownloadFormatCert(null);
                  handleDownload(c);
                }}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 rounded-lg flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600 group-hover:text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">PDF Document</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Standard</span>
              </button>

              <button
                onClick={() => {
                  const c = downloadFormatCert;
                  setDownloadFormatCert(null);
                  handleDownloadPNG(c);
                }}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 rounded-lg flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-800 group-hover:text-purple-600">PNG Image</span>
                </div>
                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                  Enterprise
                </span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDownloadFormatCert(null)}
                className="w-full py-1.5 text-center text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupsPage;
