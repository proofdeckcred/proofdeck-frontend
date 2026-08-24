import React, { useState, useEffect } from "react";
import {
  getGroups,
  createGroup,
  getGroupDetails,
  deleteGroup,
  sendGroupBulkEmail,
  downloadGroupBulkPDF,
} from "../api";
import toast, { Toaster } from "react-hot-toast";
import {
  Container,
  Button,
  Modal,
  Form,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  Folder,
  Plus,
  Trash2,
  Send,
  ChevronLeft,
  Mail,
  CheckCircle,
  Download,
  Lock,
  MoreVertical,
  Users,
  Search,
} from "lucide-react";
import { useUser } from "../context/UserContext";

function GroupsPage() {
  const { user } = useUser();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [viewingGroup, setViewingGroup] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  const isFreeUser = user && user.role === "free";

  const fetchGroups = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getGroups(page);
      setGroups(res.data.groups);
      setCurrentPage(res.data.current_page);
      setTotalPages(res.data.pages);
    } catch (error) {
      toast.error("Could not fetch groups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!viewingGroup) {
      fetchGroups(currentPage);
    }
  }, [currentPage, viewingGroup]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      return toast.error("Group name cannot be empty.");
    }
    const promise = createGroup(newGroupName);
    toast.promise(promise, {
      loading: "Creating group...",
      success: (res) => {
        setShowCreateModal(false);
        setNewGroupName("");
        fetchGroups(1);
        return res.data.msg;
      },
      error: (err) => err.response?.data?.msg || "Failed to create group.",
    });
  };

  const handleViewGroup = async (group) => {
    setViewingGroup(group);
    setLoadingDetails(true);
    try {
      const res = await getGroupDetails(group.id);
      setGroupDetails(res.data);
    } catch (error) {
      toast.error("Could not fetch group details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteGroup = async (groupId, groupName, certCount) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${groupName}"? This will delete all ${certCount} certificates inside it.`
      )
    ) {
      const promise = deleteGroup(groupId);
      toast.promise(promise, {
        loading: "Deleting group...",
        success: (res) => {
          setViewingGroup(null);
          setGroupDetails(null);
          fetchGroups(1);
          return res.data.msg;
        },
        error: (err) => err.response?.data?.msg || "Failed to delete group.",
      });
    }
  };

  const handleSendBulkEmail = async (groupId) => {
    const promise = sendGroupBulkEmail(groupId);
    toast.promise(promise, {
      loading: "Sending emails...",
      success: (res) => {
        handleViewGroup(viewingGroup);
        return res.data.msg;
      },
      error: (err) => err.response?.data?.msg || "Failed to send emails.",
    });
  };

  const handleBulkDownload = () => {
    setIsBulkDownloading(true);
    const promise = downloadGroupBulkPDF(viewingGroup.id);
    toast.promise(promise, {
      loading: "Generating zip file... This may take a moment.",
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
      error: (err) => err.response?.data?.msg || "Failed to download zip file.",
    });
    promise.finally(() => setIsBulkDownloading(false));
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
          <Spinner size="sm" className="me-2" />
        ) : (
          <Download size={16} className="me-2" />
        )}
        Download All
      </>
    );

    if (isFreeUser) {
      return (
        <OverlayTrigger placement="top" overlay={renderDownloadTooltip}>
          <span className="d-inline-block">
            <Button
              variant="outline-secondary"
              className="d-flex align-items-center opacity-75"
              disabled
              style={{ pointerEvents: "none" }}
            >
              {buttonContent}
            </Button>
          </span>
        </OverlayTrigger>
      );
    }

    return (
      <Button
        variant="outline-secondary"
        className="d-flex align-items-center"
        onClick={handleBulkDownload}
        disabled={isBulkDownloading}
      >
        {buttonContent}
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // --- SINGLE GROUP VIEW ---
  if (viewingGroup) {
    return (
      <Container fluid className="px-4 py-4">
        <Toaster position="top-right" />
        <button
          onClick={() => setViewingGroup(null)}
          className="mb-6 flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium bg-transparent border-0 p-0"
        >
          <ChevronLeft size={20} className="mr-1" /> Back to All Groups
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {viewingGroup.name}
              </h1>
              <div className="flex items-center text-gray-500 text-sm">
                <Folder size={14} className="mr-2" />
                <span>
                  {viewingGroup.certificate_count} certificate
                  {viewingGroup.certificate_count !== 1 ? "s" : ""}
                </span>
                <span className="mx-2">•</span>
                <span>
                  Created on{" "}
                  {new Date(viewingGroup.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <DownloadButton />
              <Button
                variant="primary"
                className="d-flex align-items-center"
                onClick={() => handleSendBulkEmail(viewingGroup.id)}
              >
                <Send size={16} className="me-2" /> Send to Unsent
              </Button>
              <Button
                variant="outline-danger"
                className="d-flex align-items-center"
                onClick={() =>
                  handleDeleteGroup(
                    viewingGroup.id,
                    viewingGroup.name,
                    viewingGroup.certificate_count
                  )
                }
              >
                <Trash2 size={16} className="me-2" /> Delete
              </Button>
            </div>
          </div>
        </div>

        {loadingDetails ? (
          <div className="text-center py-12">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-gray-500">Loading certificates...</p>
          </div>
        ) : (
          <>
            {groupDetails?.certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupDetails.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-gray-900 mb-0 truncate pr-2">
                          {cert.recipient_name}
                        </h5>
                        {cert.sent_at ? (
                          <div className="bg-green-100 text-green-700 p-1 rounded-full">
                            <CheckCircle size={14} />
                          </div>
                        ) : (
                          <div className="bg-gray-100 text-gray-500 p-1 rounded-full">
                            <Mail size={14} />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1 truncate">
                        {cert.recipient_email}
                      </p>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">
                        {cert.course_title}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                      <span>
                        Issued: {new Date(cert.issue_date).toLocaleDateString()}
                      </span>
                      <span
                        className={
                          cert.sent_at
                            ? "text-green-600 font-medium"
                            : "text-gray-400"
                        }
                      >
                        {cert.sent_at ? "Emailed" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Folder size={48} className="text-gray-300 mx-auto mb-3" />
                <h4 className="text-gray-600 font-medium">Empty Group</h4>
                <p className="text-gray-400 text-sm">
                  This group doesn't have any certificates yet.
                </p>
              </div>
            )}
          </>
        )}
      </Container>
    );
  }

  // --- GROUPS LIST VIEW ---
  return (
    <Container fluid className="px-4 py-4">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Certificate Groups
          </h2>
          <p className="text-gray-500 mt-1">
            Organize your certificates into batches.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="d-flex align-items-center shadow-sm"
        >
          <Plus size={20} className="me-2" /> New Group
        </Button>
      </div>

      {groups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => handleViewGroup(group)}
              className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft size={16} className="rotate-180 text-indigo-500" />
              </div>

              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Folder size={24} />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                {group.name}
              </h3>

              <p className="text-gray-500 text-sm mb-4">
                {group.certificate_count} certificate
                {group.certificate_count !== 1 ? "s" : ""}
              </p>

              <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 flex items-center">
                Created {new Date(group.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No groups yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6">
            Groups help you organize certificates for specific events, cohorts,
            or courses.
          </p>
          <Button
            variant="outline-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create your first group
          </Button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            {[...Array(totalPages).keys()].map((num) => (
              <button
                key={num + 1}
                onClick={() => setCurrentPage(num + 1)}
                className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                  currentPage === num + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {num + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="font-bold text-gray-900">
            Create New Group
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-4">
          <Form.Group>
            <Form.Label className="font-medium text-gray-700">
              Group Name
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Summer 2025 Bootcamp"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="py-2.5"
              autoFocus
            />
            <Form.Text className="text-muted">
              Use a descriptive name to easily find this batch later.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="light"
            onClick={() => setShowCreateModal(false)}
            className="text-gray-600"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateGroup}
            className="px-4"
          >
            Create Group
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default GroupsPage;
