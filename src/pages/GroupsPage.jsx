import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGroups,
  createGroup,
  updateGroup,
  getGroupDetails,
  deleteGroup,
  sendGroupBulkEmail,
  downloadGroupBulkPDF,
  getCertificates,
  sendCertificateEmail,
  getCertificatePDF,
  getCertificatePNG,
  deleteCertificate,
  getGroupAnalytics,
  addCertificatesToGroup,
  exportGroupToLocalFolder,
  pickDesktopFolder,
} from "../api";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Download,
  Mail,
  Trash,
  FolderOpen,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import AppButton from "../components/ui/AppButton";
import EmptyState from "../components/ui/EmptyState";
import KebabMenu from "../components/ui/KebabMenu";
import { useUser } from "../context/UserContext";

export default function GroupsPage() {
  const navigate = useNavigate();
  const { isDesktopMode } = useUser();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Group Creation / Editing
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupDesc, setEditGroupDesc] = useState("");
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(null);

  // Group Detail View State
  const [viewingGroup, setViewingGroup] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [groupAnalytics, setGroupAnalytics] = useState(null);
  const [detailViewMode, setDetailViewMode] = useState("table"); // table | grid

  // Search & Filters in Detail View
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | sent | not_sent
  const [selectedCertIds, setSelectedCertIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const certsPerPage = 10;

  // Add Certificates Modal
  const [showAddCertsModal, setShowAddCertsModal] = useState(false);
  const [availableCerts, setAvailableCerts] = useState([]);
  const [selectedToAddIds, setSelectedToAddIds] = useState(new Set());
  const [addSearch, setAddSearch] = useState("");
  const [isAddingCerts, setIsAddingCerts] = useState(false);

  // Action Loading States
  const [isSendingGroup, setIsSendingGroup] = useState(false);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [isExportingFolder, setIsExportingFolder] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await getGroups();
      const data = Array.isArray(res.data) ? res.data : res.data?.groups || [];
      setGroups(data);
    } catch (err) {
      toast.error("Failed to load groups.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewGroup = async (group) => {
    setViewingGroup(group);
    setLoadingDetails(true);
    setSelectedCertIds(new Set());
    setSearchTerm("");
    setFilterStatus("all");
    setCurrentPage(1);

    try {
      const [detailRes, analyticsRes] = await Promise.all([
        getGroupDetails(group.id),
        getGroupAnalytics(group.id).catch(() => ({ data: null })),
      ]);
      setGroupDetails(detailRes.data);
      if (analyticsRes?.data) setGroupAnalytics(analyticsRes.data);
    } catch (err) {
      toast.error("Failed to load group details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const res = await createGroup({
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
      });
      const created = res.data;
      setGroups((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewGroupName("");
      setNewGroupDesc("");
      toast.success("Group created.");
    } catch (err) {
      toast.error("Failed to create group.");
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!editingGroup || !editGroupName.trim()) return;

    try {
      await updateGroup(editingGroup.id, {
        name: editGroupName.trim(),
        description: editGroupDesc.trim(),
      });
      setGroups((prev) =>
        prev.map((g) =>
          g.id === editingGroup.id
            ? { ...g, name: editGroupName.trim(), description: editGroupDesc.trim() }
            : g
        )
      );
      if (viewingGroup?.id === editingGroup.id) {
        setViewingGroup((prev) => ({
          ...prev,
          name: editGroupName.trim(),
          description: editGroupDesc.trim(),
        }));
      }
      setShowEditModal(false);
      setEditingGroup(null);
      toast.success("Group updated.");
    } catch (err) {
      toast.error("Failed to update group.");
    }
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;

    try {
      await deleteGroup(deletingGroup.id);
      setGroups((prev) => prev.filter((g) => g.id !== deletingGroup.id));
      if (viewingGroup?.id === deletingGroup.id) {
        setViewingGroup(null);
        setGroupDetails(null);
      }
      setShowDeleteGroupModal(false);
      setDeletingGroup(null);
      toast.success("Group deleted.");
    } catch (err) {
      toast.error("Failed to delete group.");
    }
  };

  const handleSendUnsent = async () => {
    if (!viewingGroup) return;
    setIsSendingGroup(true);
    try {
      await sendGroupBulkEmail(viewingGroup.id);
      toast.success("Certificates sent.");
      handleViewGroup(viewingGroup);
    } catch (err) {
      toast.error("Failed to send certificates.");
    } finally {
      setIsSendingGroup(false);
    }
  };

  const handleDownloadAllPDF = async () => {
    if (!viewingGroup) return;
    setIsBulkDownloading(true);
    try {
      const response = await downloadGroupBulkPDF(viewingGroup.id);
      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${viewingGroup.name}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download started.");
    } catch (err) {
      toast.error("Failed to download certificates.");
    } finally {
      setIsBulkDownloading(false);
    }
  };

  const handleSaveToFolder = async () => {
    if (!viewingGroup) return;
    setIsExportingFolder(true);
    try {
      const folderPick = await pickDesktopFolder();
      if (folderPick.data?.cancelled) {
        setIsExportingFolder(false);
        return;
      }
      const targetPath = folderPick.data?.folder_path;
      await exportGroupToLocalFolder(viewingGroup.id, targetPath);
      toast.success(`Exported to ${targetPath}`);
    } catch (err) {
      toast.error("Failed to save to folder.");
    } finally {
      setIsExportingFolder(false);
    }
  };

  // Add Certificates Modal Handlers
  const handleOpenAddCerts = async () => {
    setShowAddCertsModal(true);
    setSelectedToAddIds(new Set());
    setAddSearch("");
    try {
      const res = await getCertificates();
      const allCerts = Array.isArray(res.data) ? res.data : res.data?.certificates || [];
      const currentIds = new Set((groupDetails?.certificates || []).map((c) => c.id));
      setAvailableCerts(allCerts.filter((c) => !currentIds.has(c.id)));
    } catch (err) {
      toast.error("Failed to load certificates.");
    }
  };

  const handleConfirmAddCerts = async () => {
    if (selectedToAddIds.size === 0 || !viewingGroup) return;
    setIsAddingCerts(true);
    try {
      await addCertificatesToGroup(viewingGroup.id, Array.from(selectedToAddIds));
      toast.success("Certificates added to group.");
      setShowAddCertsModal(false);
      handleViewGroup(viewingGroup);
    } catch (err) {
      toast.error("Failed to add certificates.");
    } finally {
      setIsAddingCerts(false);
    }
  };

  // Filter Group Certificates in Detail View
  const groupCertificates = useMemo(() => {
    return groupDetails?.certificates || [];
  }, [groupDetails]);

  const filteredCertificates = useMemo(() => {
    return groupCertificates.filter((cert) => {
      const recipient = (cert.recipient_name || "").toLowerCase();
      const course = (cert.course_title || "").toLowerCase();
      const s = searchTerm.toLowerCase();
      const matchesSearch = recipient.includes(s) || course.includes(s);

      if (!matchesSearch) return false;
      if (filterStatus === "sent") return cert.email_sent;
      if (filterStatus === "not_sent") return !cert.email_sent;
      return true;
    });
  }, [groupCertificates, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredCertificates.length / certsPerPage) || 1;
  const paginatedCertificates = useMemo(() => {
    const start = (currentPage - 1) * certsPerPage;
    return filteredCertificates.slice(start, start + certsPerPage);
  }, [filteredCertificates, currentPage]);

  const unsentCount = useMemo(() => {
    return groupCertificates.filter((c) => !c.email_sent).length;
  }, [groupCertificates]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 font-sans">
      <Toaster position="top-right" />

      {/* ========================================================================= */}
      {/* VIEW 1: GROUPS LIST VIEW                                                  */}
      {/* ========================================================================= */}
      {!viewingGroup ? (
        <div>
          <PageHeader
            title="Groups"
            action={
              <AppButton
                variant="primary"
                onClick={() => {
                  setNewGroupName("");
                  setNewGroupDesc("");
                  setShowCreateModal(true);
                }}
              >
                New group
              </AppButton>
            }
          />

          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading...</div>
          ) : groups.length === 0 ? (
            <EmptyState
              message="No groups created yet."
              action={
                <AppButton
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                >
                  New group
                </AppButton>
              }
            />
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Group</th>
                    <th className="py-3 px-4">Certificates</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-sm">
                  {groups.map((group) => {
                    const count = group.certificate_count || 0;
                    return (
                      <tr
                        key={group.id}
                        onClick={() => handleViewGroup(group)}
                        className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                            <FolderOpen size={16} className="text-[#5144E8] shrink-0" />
                            <span>{group.name}</span>
                          </div>
                          {group.description && (
                            <div className="text-xs text-slate-400 mt-0.5 pl-6 truncate max-w-md">
                              {group.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-300">
                          {count} {count === 1 ? "certificate" : "certificates"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {group.created_at ? new Date(group.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <KebabMenu
                            items={[
                              {
                                label: "Open",
                                onClick: () => handleViewGroup(group),
                              },
                              {
                                label: "Rename",
                                onClick: () => {
                                  setEditingGroup(group);
                                  setEditGroupName(group.name);
                                  setEditGroupDesc(group.description || "");
                                  setShowEditModal(true);
                                },
                              },
                              {
                                label: "Bulk edit",
                                onClick: () =>
                                  navigate("/dashboard/bulk-create", {
                                    state: { preselectedGroupId: group.id },
                                  }),
                              },
                              { divider: true },
                              {
                                label: "Delete",
                                danger: true,
                                onClick: () => {
                                  setDeletingGroup(group);
                                  setShowDeleteGroupModal(true);
                                },
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 2: GROUP DETAIL VIEW                                                 */
        /* ========================================================================= */
        <div>
          {/* Header with back link, name, count, actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewingGroup(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Back to Groups"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                    {viewingGroup.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                    {groupCertificates.length}
                  </span>
                </div>
                {groupAnalytics?.stats?.total_views > 0 && (
                  <p className="text-xs text-slate-400 mt-1 mb-0">
                    {groupAnalytics.stats.total_views} scans in 7 days • {groupAnalytics.stats.send_rate}% sent
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AppButton
                variant="primary"
                onClick={handleOpenAddCerts}
              >
                Add certificates
              </AppButton>

              <AppButton
                variant="secondary"
                onClick={handleSendUnsent}
                disabled={isSendingGroup || unsentCount === 0}
              >
                {isSendingGroup ? "Sending..." : `Send (${unsentCount})`}
              </AppButton>

              <KebabMenu
                items={[
                  {
                    label: "Bulk edit",
                    onClick: () =>
                      navigate("/dashboard/bulk-create", {
                        state: { preselectedGroupId: viewingGroup.id },
                      }),
                  },
                  {
                    label: "Download all",
                    onClick: handleDownloadAllPDF,
                  },
                  isDesktopMode
                    ? {
                        label: "Save to folder",
                        onClick: handleSaveToFolder,
                      }
                    : null,
                  {
                    label: "Rename group",
                    onClick: () => {
                      setEditingGroup(viewingGroup);
                      setEditGroupName(viewingGroup.name);
                      setEditGroupDesc(viewingGroup.description || "");
                      setShowEditModal(true);
                    },
                  },
                  { divider: true },
                  {
                    label: "Delete group",
                    danger: true,
                    onClick: () => {
                      setDeletingGroup(viewingGroup);
                      setShowDeleteGroupModal(true);
                    },
                  },
                ].filter(Boolean)}
              />
            </div>
          </div>

          {/* Group Content Container */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search in group..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>

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
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDetailViewMode("table")}
                  className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                    detailViewMode === "table"
                      ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Table view"
                >
                  <TableIcon size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setDetailViewMode("grid")}
                  className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                    detailViewMode === "grid"
                      ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid size={14} />
                </button>
              </div>
            </div>

            {/* List / Table Content */}
            {loadingDetails ? (
              <div className="py-16 text-center text-xs text-slate-400">Loading certificates...</div>
            ) : filteredCertificates.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  message="No certificates in this group."
                  action={
                    <AppButton
                      variant="primary"
                      size="sm"
                      onClick={handleOpenAddCerts}
                    >
                      Add certificates
                    </AppButton>
                  }
                />
              </div>
            ) : detailViewMode === "table" ? (
              /* --- Default Table View --- */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <th className="py-2.5 px-4 w-8">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCertIds(new Set(paginatedCertificates.map((c) => c.id)));
                            } else {
                              setSelectedCertIds(new Set());
                            }
                          }}
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
                              onChange={() => {
                                setSelectedCertIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(cert.id)) next.delete(cert.id);
                                  else next.add(cert.id);
                                  return next;
                                });
                              }}
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
                                  onClick: async () => {
                                    const res = await getCertificatePDF(cert.id);
                                    const blob = new Blob([res.data], { type: "application/pdf" });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `${cert.recipient_name || "certificate"}.pdf`;
                                    a.click();
                                  },
                                },
                                { divider: true },
                                {
                                  label: "Delete",
                                  icon: <Trash size={14} />,
                                  danger: true,
                                  onClick: async () => {
                                    if (!window.confirm("Delete this certificate?")) return;
                                    await deleteCertificate(cert.id);
                                    handleViewGroup(viewingGroup);
                                  },
                                },
                              ]}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* --- Optional Grid View --- */
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {paginatedCertificates.map((cert) => {
                  const isIssued = cert.email_sent;
                  return (
                    <div
                      key={cert.id}
                      onClick={() => navigate(`/dashboard/view/${cert.id}`)}
                      className="border border-slate-200 dark:border-zinc-800 rounded-xl p-3 bg-white dark:bg-zinc-900 hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="aspect-[1.414/1] bg-slate-50 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-slate-400 mb-2.5 overflow-hidden">
                        {cert.preview_url ? (
                          <img
                            src={cert.preview_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-semibold">{cert.recipient_name}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-zinc-100 truncate">
                          {cert.recipient_name}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                          <span className="truncate">{cert.course_title || "Certificate"}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold shrink-0 ml-1 ${
                              isIssued ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {isIssued ? "Issued" : "Draft"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Footer */}
            {filteredCertificates.length > certsPerPage && (
              <div className="p-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateGroup}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 max-w-sm w-full shadow-lg"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-4">
              New group
            </h3>
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Graduating Class 2026"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Optional notes"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <AppButton
                variant="secondary"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </AppButton>
              <AppButton
                variant="primary"
                size="sm"
                type="submit"
              >
                Create group
              </AppButton>
            </div>
          </form>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateGroup}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 max-w-sm w-full shadow-lg"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-4">
              Edit group
            </h3>
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editGroupDesc}
                  onChange={(e) => setEditGroupDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <AppButton
                variant="secondary"
                size="sm"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </AppButton>
              <AppButton
                variant="primary"
                size="sm"
                type="submit"
              >
                Save
              </AppButton>
            </div>
          </form>
        </div>
      )}

      {/* Delete Group Modal */}
      {showDeleteGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 max-w-sm w-full shadow-lg">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-2">
              Delete group
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5 leading-relaxed">
              Delete <strong>{deletingGroup?.name}</strong>? Certificates inside the group will not be deleted.
            </p>
            <div className="flex justify-end gap-2">
              <AppButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowDeleteGroupModal(false);
                  setDeletingGroup(null);
                }}
              >
                Cancel
              </AppButton>
              <AppButton
                variant="danger"
                size="sm"
                onClick={handleDeleteGroup}
              >
                Delete
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* Add Certificates Modal */}
      {showAddCertsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 max-w-lg w-full shadow-lg flex flex-col max-h-[80vh]">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-3">
              Add certificates to {viewingGroup?.name}
            </h3>

            <input
              type="text"
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              placeholder="Filter certificates..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-indigo-500 mb-3"
            />

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg">
              {availableCerts
                .filter((c) =>
                  (c.recipient_name || "").toLowerCase().includes(addSearch.toLowerCase())
                )
                .map((cert) => {
                  const isChecked = selectedToAddIds.has(cert.id);
                  return (
                    <label
                      key={cert.id}
                      className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedToAddIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(cert.id)) next.delete(cert.id);
                            else next.add(cert.id);
                            return next;
                          });
                        }}
                        className="rounded text-indigo-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {cert.recipient_name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {cert.course_title || "Certificate"}
                        </div>
                      </div>
                    </label>
                  );
                })}
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-xs text-slate-500">
                {selectedToAddIds.size} selected
              </span>
              <div className="flex gap-2">
                <AppButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddCertsModal(false)}
                >
                  Cancel
                </AppButton>
                <AppButton
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmAddCerts}
                  disabled={isAddingCerts || selectedToAddIds.size === 0}
                >
                  {isAddingCerts ? "Adding..." : "Add"}
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
