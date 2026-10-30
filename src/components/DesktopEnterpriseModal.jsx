import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import {
  ShieldCheck,
  Database,
  FolderOpen,
  KeyRound,
  Building2,
  QrCode,
  CheckCircle2,
  ExternalLink,
  HardDrive,
  RefreshCw,
  Save,
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

export default function DesktopEnterpriseModal({ show, onHide }) {
  const { desktopConfig, setDesktopConfig, desktopStorage, refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [testingDb, setTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState(null);

  const [formState, setFormState] = useState({
    institution_name: "Nile University — Academic Division",
    signatory_name: "Prof. Academic Registrar",
    license_key: "PD-ENT-NILE-2026-ANNUAL-PRO",
    verification_mode: "university_portal",
    custom_verification_url: "https://verify.nileuniversity.edu.ng/credential",
    default_export_folder: "",
    db_engine: "sqlite_demo",
    connection_uri: "",
    table_or_view: "student_records",
    id_column: "student_id",
  });

  useEffect(() => {
    if (desktopConfig) {
      setFormState({
        institution_name: desktopConfig.institution_name || "Nile University — Academic Division",
        signatory_name: desktopConfig.signatory_name || "Prof. Academic Registrar",
        license_key: desktopConfig.license_key || "PD-ENT-NILE-2026-ANNUAL-PRO",
        verification_mode: desktopConfig.verification_mode || "university_portal",
        custom_verification_url:
          desktopConfig.custom_verification_url || "https://verify.nileuniversity.edu.ng/credential",
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
      toast.error("Could not open native folder picker.");
    }
  };

  const handleOpenExplorer = async () => {
    try {
      await openDesktopFolder(formState.default_export_folder);
    } catch (err) {
      toast.error("Folder will be created automatically on your first batch export.");
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
      toast.success(`Connected! Found student records in '${formState.table_or_view}'.`);
    } catch (err) {
      setDbTestResult({
        success: false,
        error: err.response?.data?.msg || "Could not connect to database.",
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
          ...(formState.db_engine !== "sqlite_demo" && formState.connection_uri
            ? { connection_uri: formState.connection_uri }
            : {}),
          table_or_view: formState.table_or_view,
          id_column: formState.id_column,
        },
      };
      const res = await saveDesktopSettings(payload);
      if (res.data?.config) {
        setDesktopConfig(res.data.config);
      }
      await refreshUser();
      toast.success("Enterprise Desktop settings saved locally!");
      onHide();
    } catch (err) {
      toast.error("Failed to save desktop settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      contentClassName="rounded-2xl border border-slate-200 shadow-2xl overflow-hidden bg-white"
    >
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <HardDrive size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight mb-0 text-white">
                ProofDeck Enterprise Desktop Control Center
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                Offline Vault Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-0">
              100% On-Premise Student Data Sovereignty &bull; Local Database &amp; Folder Export
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onHide}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 flex gap-2 pt-2.5">
        {[
          { id: "overview", label: "Institution & License", icon: KeyRound },
          { id: "verification", label: "Data Sovereignty & QR", icon: QrCode },
          { id: "database", label: "University DB Connector", icon: Database },
          { id: "export", label: "Local PC Folder Export", icon: FolderOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                active
                  ? "bg-white text-indigo-700 border-indigo-600 shadow-2xs"
                  : "text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave}>
        <Modal.Body className="p-6 space-y-4 max-h-[68vh] overflow-y-auto">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 mb-0.5">
                      Annual Enterprise License Active (Offline Verified)
                    </h4>
                    <p className="text-xs text-emerald-800 mb-1">
                      Valid until <strong>{desktopConfig?.license_expires_at || "2027-10-30"}</strong> &bull; Unlimited Local Credential &amp; Document Issuance
                    </p>
                    <p className="text-[11px] text-emerald-700 mb-0">
                      Storage Engine: <strong>{desktopStorage?.engine || "Local SQLite Vault (Offline)"}</strong> — Zero student records are transmitted to ProofDeck cloud servers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institution / Division Name
                  </label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={formState.institution_name}
                      onChange={(e) =>
                        setFormState((p) => ({ ...p, institution_name: e.target.value }))
                      }
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. Nile University — Academic Division"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Authorized Signatory
                  </label>
                  <input
                    type="text"
                    value={formState.signatory_name}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, signatory_name: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Prof. Academic Registrar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enterprise Annual License Key
                </label>
                <input
                  type="text"
                  value={formState.license_key}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, license_key: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500"
                />
                <span className="block text-[10px] text-slate-400 mt-1">
                  Renewed annually. Works 100% offline once activated on this workstation.
                </span>
              </div>
            </div>
          )}

          {activeTab === "verification" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 mb-2">
                Choose how documents generated on this workstation handle QR verification so student data remains 100% under your institution&apos;s control:
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    id: "university_portal",
                    title: "Institution Self-Hosted Verification Portal (Recommended)",
                    desc: "QR codes point directly to your university's own domain (e.g. verify.nileuniversity.edu.ng) backed by your internal database.",
                  },
                  {
                    id: "no_qr",
                    title: "Internal Document Mode (No External Verification URL)",
                    desc: "For internal A4 letters, memos, transcripts, or physically stamped documents that do not require external online verification.",
                  },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formState.verification_mode === opt.id
                        ? "border-indigo-600 bg-indigo-50/40"
                        : "border-slate-200 hover:border-slate-300 bg-white"
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
                        className="mt-0.5"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-900">
                          {opt.title}
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-0.5">
                          {opt.desc}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {formState.verification_mode === "university_portal" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institution Verification Base URL
                  </label>
                  <input
                    type="text"
                    value={formState.custom_verification_url}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, custom_verification_url: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="https://verify.nileuniversity.edu.ng/credential"
                  />
                  <span className="block text-[10px] text-slate-400 mt-1">
                    Generated QR codes will encode: <code>{formState.custom_verification_url}/&lt;document_id&gt;</code>
                  </span>
                </div>
              )}
            </div>
          )}

          {activeTab === "database" && (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-950">
                <strong>Direct SIS Database Connector:</strong> Pull student records directly by{" "}
                <code>student_id</code>, Faculty, or Department into the Bulk Spreadsheet without exporting CSVs manually.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Database Source
                </label>
                <select
                  value={formState.db_engine}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, db_engine: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="sqlite_demo">
                    Built-In Demo University SIS Database (20 Sample Nile Students: 20220001–20220020)
                  </option>
                  <option value="mssql">Microsoft SQL Server (Campus Intranet / Active Directory)</option>
                  <option value="postgresql">PostgreSQL Database</option>
                  <option value="mysql">MySQL / MariaDB Database</option>
                  <option value="sqlite_custom">Custom Local SQLite Database File</option>
                </select>
              </div>

              {formState.db_engine !== "sqlite_demo" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SQLAlchemy Connection URI (Read-Only User Recommended)
                  </label>
                  <input
                    type="text"
                    value={formState.connection_uri}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, connection_uri: e.target.value }))
                    }
                    placeholder="e.g. mssql+pyodbc://readonly_user:pass@10.0.1.25/nile_sis_db?driver=ODBC+Driver+17+for+SQL+Server"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Table or View Name
                  </label>
                  <input
                    type="text"
                    value={formState.table_or_view}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, table_or_view: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student ID Lookup Column
                  </label>
                  <input
                    type="text"
                    value={formState.id_column}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, id_column: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTestDatabase}
                  disabled={testingDb}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} className={testingDb ? "animate-spin" : ""} />
                  <span>{testingDb ? "Testing Connection..." : "Test Database Connection"}</span>
                </button>
              </div>

              {dbTestResult && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    dbTestResult.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  {dbTestResult.success ? (
                    <div>
                      <div className="font-bold flex items-center gap-1.5 mb-1">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>Connection Verified! Sample records preview:</span>
                      </div>
                      <div className="space-y-1 font-mono text-[11px] bg-white/80 p-2 rounded border border-emerald-200/60">
                        {dbTestResult.sample.map((s, i) => (
                          <div key={i}>
                            [{s.student_id}] {s.recipient_name} — {s.course_title} (CGPA: {s.cgpa})
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>{dbTestResult.error}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "export" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                When you export a batch of certificates or A4 documents in Desktop Mode, files are saved directly to your computer&apos;s hard drive (named <code>{"{student_id}_{recipient_name}.pdf"}</code>) — 100% offline.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Default Local Export Directory
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formState.default_export_folder}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, default_export_folder: e.target.value }))
                    }
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={handleBrowseFolder}
                    className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <FolderOpen size={14} />
                    <span>Browse PC...</span>
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleOpenExplorer}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink size={13} />
                  <span>Open Export Folder in Windows File Explorer</span>
                </button>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center">
          <span className="text-[11px] text-slate-500">
            ProofDeck Desktop Enterprise v1.0 &bull; Local SQLite &amp; Native File System
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onHide}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={13} />
              <span>{saving ? "Saving..." : "Save Desktop Settings"}</span>
            </button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
