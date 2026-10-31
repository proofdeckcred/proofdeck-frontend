import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import {
  FolderOpen,
  RefreshCw,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  saveDesktopSettings,
  pickDesktopFolder,
  openDesktopFolder,
  pullStudentsFromUniversityDb,
} from "../api";
import { useUser } from "../context/UserContext";
import AppButton from "./ui/AppButton";

export default function DesktopEnterpriseModal({ show, onHide }) {
  const { desktopConfig, setDesktopConfig, refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState("institution");
  const [saving, setSaving] = useState(false);
  const [testingDb, setTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState(null);
  const [showLicenseKey, setShowLicenseKey] = useState(false);

  const [formState, setFormState] = useState({
    institution_name: "",
    signatory_name: "",
    license_key: "",
    verification_mode: "university_portal",
    custom_verification_url: "",
    default_export_folder: "",
    db_engine: "sqlite_demo",
    connection_uri: "",
    table_or_view: "student_records",
    id_column: "student_id",
  });

  useEffect(() => {
    if (desktopConfig) {
      setFormState({
        institution_name: desktopConfig.institution_name || "",
        signatory_name: desktopConfig.signatory_name || "",
        license_key: desktopConfig.license_key || "",
        verification_mode: desktopConfig.verification_mode || "university_portal",
        custom_verification_url: desktopConfig.custom_verification_url || "",
        default_export_folder: desktopConfig.default_export_folder || "",
        db_engine: desktopConfig.db_connector?.engine || "sqlite_demo",
        connection_uri: desktopConfig.db_connector?.connection_uri || "",
        table_or_view: desktopConfig.db_connector?.table_or_view || "student_records",
        id_column: desktopConfig.db_connector?.id_column || "student_id",
      });
    }
  }, [desktopConfig, show]);

  const handleBrowseFolder = async () => {
    try {
      const res = await pickDesktopFolder();
      if (res.data?.folder && !res.data?.cancelled) {
        setFormState((prev) => ({ ...prev, default_export_folder: res.data.folder }));
        toast.success(`Selected folder: ${res.data.folder}`);
      }
    } catch (err) {
      toast.error("Could not open folder picker.");
    }
  };

  const handleOpenExplorer = async () => {
    try {
      await openDesktopFolder(formState.default_export_folder);
    } catch (err) {
      toast.error("Could not open folder.");
    }
  };

  const handleTestDatabase = async () => {
    setTestingDb(true);
    setDbTestResult(null);
    try {
      const res = await pullStudentsFromUniversityDb({
        connection_uri: formState.db_engine === "sqlite_demo" ? undefined : formState.connection_uri,
        table_or_view: formState.table_or_view,
        id_column: formState.id_column,
        limit: 5,
      });
      setDbTestResult({
        success: true,
        count: res.data?.total_pulled || 0,
        sample: res.data?.rows?.slice(0, 3) || [],
      });
      toast.success("Database connected.");
    } catch (err) {
      setDbTestResult({
        success: false,
        error: err.response?.data?.msg || "Connection failed.",
      });
      toast.error(err.response?.data?.msg || "Database connection test failed.");
    } finally {
      setTestingDb(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        institution_name: formState.institution_name,
        signatory_name: formState.signatory_name,
        license_key: formState.license_key,
        verification_mode: formState.verification_mode,
        custom_verification_url: formState.custom_verification_url,
        default_export_folder: formState.default_export_folder,
        db_connector: {
          engine: formState.db_engine,
          connection_uri: formState.connection_uri,
          table_or_view: formState.table_or_view,
          id_column: formState.id_column,
        },
      };
      const res = await saveDesktopSettings(payload);
      if (res.data?.config) {
        setDesktopConfig(res.data.config);
      }
      await refreshUser();
      toast.success("Settings saved");
      onHide();
    } catch (err) {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "institution", label: "Institution" },
    { id: "license", label: "License" },
    { id: "data_qr", label: "Data/QR" },
    { id: "database", label: "Database connector" },
    { id: "export", label: "Export folder" },
  ];

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      contentClassName="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
    >
      <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-3.5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0">
          Workstation settings
        </h3>
        <button
          type="button"
          onClick={onHide}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={16} />
        </button>
      </div>

      <div className="border-b border-slate-100 dark:border-slate-800 px-5 flex gap-4 overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors cursor-pointer shrink-0 ${
                active
                  ? "text-slate-900 dark:text-slate-100 border-indigo-600"
                  : "text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave}>
        <Modal.Body className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Tab 1: Institution */}
          {activeTab === "institution" && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institution name
                </label>
                <input
                  type="text"
                  value={formState.institution_name}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, institution_name: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default signatory
                </label>
                <input
                  type="text"
                  value={formState.signatory_name}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, signatory_name: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Tab 2: License */}
          {activeTab === "license" && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  License key
                </label>
                <div className="flex gap-2">
                  <input
                    type={showLicenseKey ? "text" : "password"}
                    value={formState.license_key}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, license_key: e.target.value }))
                    }
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <AppButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowLicenseKey(!showLicenseKey)}
                  >
                    {showLicenseKey ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showLicenseKey ? "Hide" : "Show"}</span>
                  </AppButton>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Data/QR */}
          {activeTab === "data_qr" && (
            <div className="space-y-3.5">
              <div className="space-y-2">
                {[
                  {
                    id: "university_portal",
                    title: "Custom verification URL",
                    desc: "QR codes link to your custom domain verification page.",
                  },
                  {
                    id: "no_qr",
                    title: "No verification QR",
                    desc: "Documents do not encode verification links.",
                  },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`block p-3 rounded border cursor-pointer transition-colors ${
                      formState.verification_mode === opt.id
                        ? "border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="verification_mode"
                        checked={formState.verification_mode === opt.id}
                        onChange={() =>
                          setFormState((p) => ({ ...p, verification_mode: opt.id }))
                        }
                        className="mt-0.5 text-indigo-600"
                      />
                      <div>
                        <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {opt.title}
                        </span>
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {opt.desc}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {formState.verification_mode === "university_portal" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Verification base URL
                  </label>
                  <input
                    type="text"
                    value={formState.custom_verification_url}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, custom_verification_url: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="https://verify.example.edu/credential"
                  />
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Database Connector */}
          {activeTab === "database" && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Database source
                </label>
                <select
                  value={formState.db_engine}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, db_engine: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="sqlite_demo">Demo database (Local SQLite)</option>
                  <option value="mssql">Microsoft SQL Server</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="sqlite_custom">Custom SQLite file</option>
                </select>
              </div>

              {formState.db_engine !== "sqlite_demo" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Connection URI
                  </label>
                  <input
                    type="text"
                    value={formState.connection_uri}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, connection_uri: e.target.value }))
                    }
                    placeholder="mssql+pyodbc://user:pass@host/db"
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Table or view
                  </label>
                  <input
                    type="text"
                    value={formState.table_or_view}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, table_or_view: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ID column
                  </label>
                  <input
                    type="text"
                    value={formState.id_column}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, id_column: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={handleTestDatabase}
                  disabled={testingDb}
                >
                  <RefreshCw size={13} className={testingDb ? "animate-spin" : ""} />
                  <span>{testingDb ? "Testing..." : "Test connection"}</span>
                </AppButton>
              </div>

              {dbTestResult && (
                <div
                  className={`p-3 rounded text-xs ${
                    dbTestResult.success
                      ? "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300"
                  }`}
                >
                  {dbTestResult.success ? (
                    <div>Found {dbTestResult.count} records.</div>
                  ) : (
                    <div>{dbTestResult.error}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Export Folder */}
          {activeTab === "export" && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default export folder
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formState.default_export_folder}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, default_export_folder: e.target.value }))
                    }
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                  <AppButton
                    type="button"
                    variant="secondary"
                    onClick={handleBrowseFolder}
                  >
                    <FolderOpen size={14} />
                    <span>Browse</span>
                  </AppButton>
                </div>
              </div>

              <div>
                <AppButton
                  type="button"
                  variant="ghost"
                  onClick={handleOpenExplorer}
                >
                  Open in Explorer
                </AppButton>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-t border-slate-100 dark:border-slate-800 px-5 py-3 flex justify-end gap-2">
          <AppButton
            type="button"
            variant="secondary"
            onClick={onHide}
          >
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            variant="primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save settings"}
          </AppButton>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
