import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import {
  Terminal,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Copy,
  CheckCircle2,
  Code2,
  UserCheck,
  Layers,
  Send,
  FileText,
  Search,
  ExternalLink,
  Check,
  Download,
  Smartphone
} from "lucide-react";

// --- Documentation Markdown Generator (for LLMs & Plain Text) ---
const getDocsMarkdown = (baseUrl) => {
  return `# ProofDeck REST API Documentation (v1.0)

Base URL: ${baseUrl}
Production Status: Active
Authentication: X-API-Key HTTP Header

---

## 1. Overview
ProofDeck provides a high-performance REST API for issuing, managing, and verifying tamper-proof digital credentials with dynamic PDF templates, cryptographic QR codes, and automated email delivery.

---

## 2. Authentication
Every API request must be authenticated with your secret API key passed via the \`X-API-Key\` header:

\`\`\`bash
X-API-Key: pk_live_xxxxxxxxxxxxxxxx
\`\`\`

*Keep your API keys secret. Never expose them in frontend or client-side code.*

---

## 3. Endpoints

### GET /account
Fetch authenticated organization details, active plan role, remaining quota, and personal quotas.

**Headers:**
\`\`\`bash
X-API-Key: pk_live_xxxxxxxx
\`\`\`

**Example Request:**
\`\`\`bash
curl -X GET '${baseUrl}/account' \\
  -H 'X-API-Key: pk_live_xxxxxxxx'
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "user_id": 42,
  "name": "Alex Johnson",
  "email": "alex@proofdeck.app",
  "plan_role": "business_owner",
  "available_quota": 150,
  "personal_quota": 50,
  "operating_context": "team"
}
\`\`\`

---

### GET /templates
Retrieve all approved certificate templates available in your workspace.

**Headers:**
\`\`\`bash
X-API-Key: pk_live_xxxxxxxx
\`\`\`

**Example Request:**
\`\`\`bash
curl -X GET '${baseUrl}/templates' \\
  -H 'X-API-Key: pk_live_xxxxxxxx'
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "templates": [
    {
      "id": 1,
      "title": "Standard Completion Certificate",
      "layout_style": "modern",
      "is_public": true,
      "created_at": "2026-08-15T10:30:00"
    }
  ]
}
\`\`\`

---

### POST /certificates
Issue a single certificate, trigger dynamic PDF generation, and dispatch delivery email to the recipient.

**Headers:**
\`\`\`bash
Content-Type: application/json
X-API-Key: pk_live_xxxxxxxx
\`\`\`

**Request Body:**
\`\`\`json
{
  "template_id": 1,
  "recipient_name": "Jane Doe",
  "recipient_email": "jane.doe@example.com",
  "course_title": "Full-Stack Web Development",
  "issue_date": "2026-09-04",
  "extra_fields": {
    "Grade": "Distinction",
    "Duration": "12 Weeks"
  }
}
\`\`\`

**Example Request:**
\`\`\`bash
curl -X POST '${baseUrl}/certificates' \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: pk_live_xxxxxxxx' \\
  -d '{
    "template_id": 1,
    "recipient_name": "Jane Doe",
    "recipient_email": "jane.doe@example.com",
    "course_title": "Full-Stack Web Development",
    "extra_fields": {
      "Grade": "Distinction",
      "Duration": "12 Weeks"
    }
  }'
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "msg": "Certificate created and dispatched successfully.",
  "certificate_id": 1042,
  "verification_id": "df849a29-3440-477d-826c-5e996932e123",
  "verification_url": "https://www.proofdeck.app/verify/df849a29-3440-477d-826c-5e996932e123"
}
\`\`\`

---

### GET /certificates/{verification_id}
Look up verified certificate details and metadata by unique verification UUID.

**Headers:**
\`\`\`bash
X-API-Key: pk_live_xxxxxxxx
\`\`\`

**Example Request:**
\`\`\`bash
curl -X GET '${baseUrl}/certificates/df849a29-3440-477d-826c-5e996932e123' \\
  -H 'X-API-Key: pk_live_xxxxxxxx'
\`\`\`

---

### POST /certificates/{verification_id}/revoke
Revoke a previously issued certificate immediately.

**Headers:**
\`\`\`bash
X-API-Key: pk_live_xxxxxxxx
\`\`\`

**Example Request:**
\`\`\`bash
curl -X POST '${baseUrl}/certificates/df849a29-3440-477d-826c-5e996932e123/revoke' \\
  -H 'X-API-Key: pk_live_xxxxxxxx'
\`\`\`

---

## 4. HTTP Status Codes
- **200 OK**: Request completed successfully.
- **201 Created**: Credential created and dispatched.
- **400 Bad Request**: Missing required parameters.
- **401 Unauthorized**: Missing or invalid \`X-API-Key\`.
- **402 Payment Required**: Insufficient credential credits.
- **404 Not Found**: Specified certificate or template does not exist.
- **429 Too Many Requests**: Rate limit reached (100 req/min).
- **500 Server Error**: Internal system error.
`;
};

// --- Copy Page Dropdown Component (Matches Image 1) ---
const CopyPageDropdown = ({ onCopyMarkdown, onViewMarkdown }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = () => {
    onCopyMarkdown();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Main split button matching Image 1 */}
      <div className="inline-flex rounded-xl shadow-2xs border border-slate-200 bg-white overflow-hidden">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Copy page as Markdown"
        >
          {copied ? (
            <Check size={14} className="text-emerald-500" />
          ) : (
            <Copy size={14} className="text-slate-500" />
          )}
          <span>{copied ? "Copied!" : "Copy page"}</span>
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 py-1.5 border-l border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          title="More options"
        >
          <ChevronDown
            size={13}
            className={`transform transition-transform duration-200 ${
              isOpen ? "rotate-180 text-indigo-600" : ""
            }`}
          />
        </button>
      </div>

      {/* Floating popover dropdown matching Image 1 */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
          {/* Option 1: Copy page */}
          <button
            onClick={() => {
              handleCopy();
              setIsOpen(false);
            }}
            className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-3 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5 group-hover:border-slate-300 group-hover:bg-white shadow-2xs">
              <Copy size={14} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Copy page</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Copy page as Markdown for LLMs
              </p>
            </div>
          </button>

          {/* Option 2: View as Markdown */}
          <button
            onClick={() => {
              setIsOpen(false);
              onViewMarkdown();
            }}
            className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-start gap-3 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5 group-hover:border-slate-300 group-hover:bg-white shadow-2xs">
              <FileText size={14} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                View as Markdown <ExternalLink size={11} className="text-slate-400" />
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                View this page as plain text
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

// --- Markdown Viewer Modal ---
const MarkdownModal = ({ isOpen, onClose, markdownContent }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    toast.success("Markdown copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "proofdeck-api-docs.md";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded proofdeck-api-docs.md");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="font-bold text-sm text-slate-900 font-mono">
              proofdeck-api-docs.md
            </h3>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              LLM Ready
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Download as .md file"
            >
              <Download size={13} />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors ml-1 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-grow custom-scrollbar bg-[#0B0F17]">
          <pre className="text-xs font-mono leading-relaxed text-slate-200 select-all whitespace-pre-wrap">
            <code>{markdownContent}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

// --- Multi-language Code Snippet Viewer (Matches Image 2 Style: Matte Charcoal #0B0F17, clean underline tabs, NO macOS dots) ---
const CodeSnippetTabs = ({ snippetGroup, title }) => {
  const [activeLang, setActiveLang] = useState("curl");
  const [copied, setCopied] = useState(false);

  const activeCode = snippetGroup[activeLang] || snippetGroup["curl"] || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const languages = [
    { id: "curl", label: "cURL" },
    { id: "js", label: "JavaScript" },
    { id: "python", label: "Python" }
  ];

  return (
    <div className="rounded-2xl overflow-hidden bg-[#0B0F17] border border-white/10 my-6 shadow-2xl">
      {/* Top Tab Bar matching Image 2 */}
      <div className="flex items-center justify-between px-5 pt-3.5 pb-0 border-b border-white/10 bg-[#0B0F17]">
        {/* Language Tabs */}
        <div className="flex items-center gap-6">
          {languages.map((lang) => {
            const isActive = activeLang === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => setActiveLang(lang.id)}
                className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative cursor-pointer ${
                  isActive
                    ? "text-[#00A3FF] font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {lang.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00A3FF] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Minimal Copy Icon on Right (Image 2) */}
        <div className="flex items-center gap-3 pb-3">
          {title && (
            <span className="hidden sm:inline text-xs font-mono text-slate-500">
              {title}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            title="Copy code"
          >
            {copied ? (
              <Check size={16} className="text-emerald-400" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="p-5 sm:p-6 overflow-x-auto custom-scrollbar bg-[#0B0F17]">
        <pre className="text-xs sm:text-sm font-mono leading-relaxed text-slate-200 selection:bg-[#00A3FF]/30">
          <code>{activeCode}</code>
        </pre>
      </div>
    </div>
  );
};

// --- Single JSON Response Viewer (Matches Image 2 Style: Matte Charcoal #0B0F17, clean badge, NO macOS dots) ---
const JSONResponseBlock = ({ code, status = "200 OK", title = "Response Payload" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Response copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuccess = status.startsWith("2");

  return (
    <div className="rounded-2xl overflow-hidden bg-[#0B0F17] border border-white/10 my-4 shadow-xl">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#0B0F17] text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <span className="text-slate-300 font-medium">{title}</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isSuccess
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
            }`}
          >
            {status}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
          title="Copy JSON"
        >
          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
        </button>
      </div>
      <div className="p-5 overflow-x-auto custom-scrollbar bg-[#0B0F17]">
        <pre className="text-xs sm:text-sm font-mono text-emerald-400/95 leading-relaxed selection:bg-emerald-500/30">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

// --- API Parameter Row ---
const ParamRow = ({ name, type, required, description }) => (
  <div className="py-3 border-b border-gray-100 last:border-0 flex flex-col sm:flex-row sm:items-start gap-2">
    <div className="sm:w-1/3 flex items-center gap-2">
      <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
        {name}
      </span>
      <span className="font-mono text-[11px] text-indigo-600 font-medium">{type}</span>
      {required ? (
        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
          Required
        </span>
      ) : (
        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
          Optional
        </span>
      )}
    </div>
    <div className="sm:w-2/3 text-xs text-gray-600 leading-relaxed font-normal">
      {description}
    </div>
  </div>
);

// --- Endpoint Header ---
const EndpointHeader = ({ method, path, title, description }) => {
  const isPost = method === "POST";
  const isGet = method === "GET";

  return (
    <div className="mb-6">
      <div className="flex items-center flex-wrap gap-3 mb-2">
        <span
          className={`px-3 py-1 rounded-lg font-mono text-xs font-bold uppercase tracking-wider border ${
            isPost
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : isGet
              ? "bg-sky-50 text-sky-700 border-sky-200"
              : "bg-purple-50 text-purple-700 border-purple-200"
          }`}
        >
          {method}
        </span>
        <span className="font-mono text-sm sm:text-base font-semibold text-gray-800 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg select-all">
          {path}
        </span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mt-3 mb-2">{title}</h2>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

// --- Sidebar Item ---
const SidebarItem = ({ href, method, label, active, onClick }) => (
  <a
    href={href}
    onClick={onClick}
    className={`group flex items-center justify-between py-2 px-3 text-xs font-medium rounded-lg transition-all duration-150 no-underline ${
      active
        ? "text-[var(--pd-indigo)] bg-[var(--pd-indigo)]/5"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }`}
  >
    <span className="truncate">{label}</span>
    {method && (
      <span
        className={`ml-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
          method === "POST"
            ? "bg-emerald-100 text-emerald-800"
            : method === "GET"
            ? "bg-sky-100 text-sky-800"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {method}
      </span>
    )}
  </a>
);

function DocsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("intro");
  const [searchQuery, setSearchQuery] = useState("");
  const [baseUrlCopied, setBaseUrlCopied] = useState(false);
  const [showMarkdownModal, setShowMarkdownModal] = useState(false);

  const prodBaseUrl = "https://api.proofdeck.app/api/v1";

  const copyBaseUrl = () => {
    navigator.clipboard.writeText(prodBaseUrl);
    setBaseUrlCopied(true);
    toast.success("Production Base URL copied!");
    setTimeout(() => setBaseUrlCopied(false), 2000);
  };

  const handleCopyAllMarkdown = () => {
    const md = getDocsMarkdown(prodBaseUrl);
    navigator.clipboard.writeText(md);
    toast.success("Documentation copied as Markdown for LLMs!");
  };

  // Scroll spy
  useEffect(() => {
    const sections = [
      "intro",
      "auth",
      "postman",
      "get-account",
      "get-templates",
      "create-cert",
      "get-cert",
      "revoke-cert",
      "errors"
    ];
    const handleScroll = () => {
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 250) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Snippet Code Definitions ---
  const snippets = {
    account: {
      curl: `curl -X GET '${prodBaseUrl}/account' \\\n  -H 'X-API-Key: pk_live_xxxxxxxx'`,
      js: `const response = await fetch('${prodBaseUrl}/account', {\n  method: 'GET',\n  headers: {\n    'X-API-Key': 'pk_live_xxxxxxxx'\n  }\n});\nconst data = await response.json();\nconsole.log(data);`,
      python: `import requests\n\nresponse = requests.get(\n    '${prodBaseUrl}/account',\n    headers={'X-API-Key': 'pk_live_xxxxxxxx'}\n)\nprint(response.json())`
    },
    templates: {
      curl: `curl -X GET '${prodBaseUrl}/templates' \\\n  -H 'X-API-Key: pk_live_xxxxxxxx'`,
      js: `const response = await fetch('${prodBaseUrl}/templates', {\n  method: 'GET',\n  headers: {\n    'X-API-Key': 'pk_live_xxxxxxxx'\n  }\n});\nconst templates = await response.json();\nconsole.log(templates);`,
      python: `import requests\n\nresponse = requests.get(\n    '${prodBaseUrl}/templates',\n    headers={'X-API-Key': 'pk_live_xxxxxxxx'}\n)\nprint(response.json())`
    },
    createCert: {
      curl: `curl -X POST '${prodBaseUrl}/certificates' \\\n  -H 'Content-Type: application/json' \\\n  -H 'X-API-Key: pk_live_xxxxxxxx' \\\n  -d '{\n    "template_id": 1,\n    "recipient_name": "Jane Doe",\n    "recipient_email": "jane.doe@example.com",\n    "course_title": "Full-Stack Web Development",\n    "issue_date": "2026-09-04",\n    "extra_fields": {\n      "Grade": "Distinction",\n      "Duration": "12 Weeks"\n    }\n  }'`,
      js: `const payload = {\n  template_id: 1,\n  recipient_name: "Jane Doe",\n  recipient_email: "jane.doe@example.com",\n  course_title: "Full-Stack Web Development",\n  extra_fields: { Grade: "Distinction", Duration: "12 Weeks" }\n};\n\nconst res = await fetch('${prodBaseUrl}/certificates', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json',\n    'X-API-Key': 'pk_live_xxxxxxxx'\n  },\n  body: JSON.stringify(payload)\n});\nconst cert = await res.json();\nconsole.log(cert);`,
      python: `import requests\n\npayload = {\n    "template_id": 1,\n    "recipient_name": "Jane Doe",\n    "recipient_email": "jane.doe@example.com",\n    "course_title": "Full-Stack Web Development",\n    "extra_fields": {"Grade": "Distinction", "Duration": "12 Weeks"}\n}\n\nresponse = requests.post(\n    '${prodBaseUrl}/certificates',\n    headers={\n        "Content-Type": "application/json",\n        "X-API-Key": "pk_live_xxxxxxxx"\n    },\n    json=payload\n)\nprint(response.json())`
    },
    getCert: {
      curl: `curl -X GET '${prodBaseUrl}/certificates/df849a29-3440-477d-826c-5e996932e123' \\\n  -H 'X-API-Key: pk_live_xxxxxxxx'`,
      js: `const verificationId = "df849a29-3440-477d-826c-5e996932e123";\nconst res = await fetch(\`\${prodBaseUrl}/certificates/\${verificationId}\`, {\n  headers: { 'X-API-Key': 'pk_live_xxxxxxxx' }\n});\nconst record = await res.json();\nconsole.log(record);`,
      python: `import requests\n\nverification_id = "df849a29-3440-477d-826c-5e996932e123"\nresponse = requests.get(\n    f"${prodBaseUrl}/certificates/{verification_id}",\n    headers={"X-API-Key": "pk_live_xxxxxxxx"}\n)\nprint(response.json())`
    },
    revokeCert: {
      curl: `curl -X POST '${prodBaseUrl}/certificates/df849a29-3440-477d-826c-5e996932e123/revoke' \\\n  -H 'X-API-Key: pk_live_xxxxxxxx'`,
      js: `const verificationId = "df849a29-3440-477d-826c-5e996932e123";\nconst res = await fetch(\`\${prodBaseUrl}/certificates/\${verificationId}/revoke\`, {\n  method: 'POST',\n  headers: { 'X-API-Key': 'pk_live_xxxxxxxx' }\n});\nconst result = await res.json();\nconsole.log(result);`,
      python: `import requests\n\nverification_id = "df849a29-3440-477d-826c-5e996932e123"\nresponse = requests.post(\n    f"${prodBaseUrl}/certificates/{verification_id}/revoke",\n    headers={"X-API-Key": "pk_live_xxxxxxxx"}\n)\nprint(response.json())`
    }
  };

  // --- Response Objects ---
  const responses = {
    account: `{\n  "user_id": 42,\n  "name": "Alex Johnson",\n  "email": "alex@proofdeck.app",\n  "plan_role": "business_owner",\n  "available_quota": 150,\n  "personal_quota": 50,\n  "operating_context": "team"\n}`,
    templates: `{\n  "templates": [\n    {\n      "id": 1,\n      "title": "Standard Completion Certificate",\n      "layout_style": "modern",\n      "is_public": true,\n      "created_at": "2026-08-15T10:30:00"\n    },\n    {\n      "id": 5,\n      "title": "Executive AI Leadership Award",\n      "layout_style": "classic",\n      "is_public": false,\n      "created_at": "2026-09-01T14:12:00"\n    }\n  ]\n}`,
    createCert: `{\n  "msg": "Certificate created and dispatched successfully.",\n  "certificate_id": 1042,\n  "verification_id": "df849a29-3440-477d-826c-5e996932e123",\n  "verification_url": "https://www.proofdeck.app/verify/df849a29-3440-477d-826c-5e996932e123"\n}`,
    getCert: `{\n  "certificate_id": 1042,\n  "verification_id": "df849a29-3440-477d-826c-5e996932e123",\n  "recipient_name": "Jane Doe",\n  "recipient_email": "jane.doe@example.com",\n  "course_title": "Full-Stack Web Development",\n  "issuer_name": "ProofDeck Academy",\n  "issue_date": "2026-09-04T00:00:00",\n  "status": "valid",\n  "verification_url": "https://www.proofdeck.app/verify/df849a29-3440-477d-826c-5e996932e123",\n  "extra_fields": {\n    "Grade": "Distinction",\n    "Duration": "12 Weeks"\n  }\n}`,
    revokeCert: `{\n  "msg": "Certificate df849a29-3440-477d-826c-5e996932e123 has been revoked successfully.",\n  "status": "revoked"\n}`
  };

  const menuSections = [
    {
      title: "Get Started",
      items: [
        { id: "intro", label: "Introduction" },
        { id: "auth", label: "Authentication" },
        { id: "postman", label: "Postman Collection" }
      ]
    },
    {
      title: "Account & Templates",
      items: [
        { id: "get-account", label: "Get Account Info", method: "GET" },
        { id: "get-templates", label: "List Templates", method: "GET" }
      ]
    },
    {
      title: "Certificates API",
      items: [
        { id: "create-cert", label: "Issue Certificate", method: "POST" },
        { id: "get-cert", label: "Get Certificate", method: "GET" },
        { id: "revoke-cert", label: "Revoke Certificate", method: "POST" }
      ]
    },
    {
      title: "Resources",
      items: [{ id: "errors", label: "Error Codes & Limits" }]
    }
  ];

  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <PublicHeader />

      <div className="flex-grow w-full relative">
        {/* Mobile Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed bottom-6 right-6 bg-indigo-600 text-white p-3.5 rounded-full shadow-2xl z-50 hover:bg-indigo-700 transition-transform active:scale-95"
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-72 bg-[var(--pd-paper)] border-r border-slate-200/80 
            transform transition-transform duration-300 ease-in-out
            lg:translate-x-0 lg:fixed lg:top-[81px] lg:bottom-0 lg:left-0 lg:z-30
            overflow-y-auto custom-scrollbar flex flex-col justify-between
            ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"}
          `}
        >
          <div className="p-5 space-y-6">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search API docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder-slate-400 shadow-xs"
              />
            </div>

            {/* Menu Items */}
            {menuSections.map((sec) => {
              const filteredItems = sec.items.filter((item) =>
                item.label.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (searchQuery && filteredItems.length === 0) return null;

              return (
                <div key={sec.title}>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 font-mono">
                    {sec.title}
                  </h4>
                  <nav className="space-y-1">
                    {filteredItems.map((item) => (
                      <SidebarItem
                        key={item.id}
                        href={`#${item.id}`}
                        label={item.label}
                        method={item.method}
                        active={activeSection === item.id}
                        onClick={() => {
                          setIsSidebarOpen(false);
                          setActiveSection(item.id);
                        }}
                      />
                    ))}
                  </nav>
                </div>
              );
            })}
          </div>

          {/* Support Widget */}
          <div className="p-4 m-4 bg-[var(--pd-ink)] rounded-2xl text-white shadow-lg border border-indigo-800/40">
            <div className="flex items-center gap-2 text-indigo-400 mb-1.5">
              <h5 className="font-bold text-xs">Production VPS</h5>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
              Need custom webhooks or enterprise API keys?
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 py-2 rounded-xl transition-colors text-white no-underline shadow-sm"
            >
              Contact Engineering
            </Link>
          </div>
        </aside>

        {/* Backdrop overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-grow min-w-0 py-10 px-6 sm:px-10 lg:px-16 xl:px-20 lg:ml-72">
          <div className="max-w-4xl mx-auto">
            {/* Header Hero Banner */}
            <div className="mb-12 border-b border-slate-100 pb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-mono text-xs font-bold border border-indigo-100">
                  REST API v1.0
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-mono text-xs font-bold border border-emerald-100">
                  <Check size={13} /> Production Active
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Developer API Guide
                </h1>
                <CopyPageDropdown
                  onCopyMarkdown={handleCopyAllMarkdown}
                  onViewMarkdown={() => setShowMarkdownModal(true)}
                />
              </div>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-3xl">
                Integrate automated credential generation, PDF certificate creation, bulk email dispatch, and instant verification into your platforms.
              </p>

              {/* Base URL Box */}
              <div className="mt-6 p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block mb-1">
                    Production API Base URL
                  </span>
                  <code className="text-xs sm:text-sm font-mono text-emerald-300 font-semibold select-all">
                    {prodBaseUrl}
                  </code>
                </div>
                <button
                  onClick={copyBaseUrl}
                  className="flex items-center gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl transition-all shadow-md self-stretch sm:self-auto justify-center"
                >
                  {baseUrlCopied ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Base URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* --- SECTION: INTRODUCTION --- */}
            <section id="intro" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-[var(--pd-ink)] mb-4">
                Introduction
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
                The ProofDeck Developer API is organized around REST architecture. Standard HTTP request methods (`GET`, `POST`) are used with JSON-formatted request bodies and standard HTTP status response codes.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 my-6">
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-600" /> Automated Emails
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    When issuing certificates via API, ProofDeck automatically renders custom PDF templates and sends direct email notifications.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
                    <UserCheck size={16} className="text-indigo-600" /> Multi-Tenant Quotas
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    API actions automatically respect your personal or team workspace context, drawing from your active quota pool.
                  </p>
                </div>
              </div>
            </section>

            {/* --- SECTION: AUTHENTICATION --- */}
            <section id="auth" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-[var(--pd-ink)] mb-4">
                Authentication
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
                Authenticate all requests by including your secret API Key in the HTTP Header:
              </p>
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-800 mb-4 inline-block">
                X-API-Key: pk_live_your_key_here
              </div>

              <div className="border-t border-b border-[var(--pd-line)] py-4 my-4">
                <p className="text-xs text-[var(--pd-ink)] leading-relaxed">
                  <strong>Caution</strong> — Keep your API keys secret. Never expose secret API keys in client-side code, public GitHub repositories, or browser scripts.
                </p>
              </div>
            </section>

            {/* --- SECTION: POSTMAN COLLECTION --- */}
            <section id="postman" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-[var(--pd-ink)] mb-4">
                Postman Testing
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
                To test the API instantly in <strong>Postman</strong>:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                <li>Create a new request in Postman.</li>
                <li>Set the URL to <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">{prodBaseUrl}/certificates/df849a29-3440-477d-826c-5e996932e123</code>.</li>
                <li>Under the <strong>Headers</strong> tab, add key <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">X-API-Key</code> with your key.</li>
                <li>Click <strong>Send</strong> to view certificate metadata!</li>
              </ol>
            </section>

            {/* --- ENDPOINT: GET ACCOUNT INFO --- */}
            <section id="get-account" className="mb-20 scroll-mt-24 border-t border-slate-100 pt-12">
              <EndpointHeader
                method="GET"
                path="/api/v1/account"
                title="Get Account Info & Quota"
                description="Fetch authenticated account details, user ID, personal quota, and active team workspace quota."
              />
              <CodeSnippetTabs snippetGroup={snippets.account} title="Get Account Request" />
              <JSONResponseBlock code={responses.account} status="200 OK" title="Response (200 OK)" />
            </section>

            {/* --- ENDPOINT: LIST TEMPLATES --- */}
            <section id="get-templates" className="mb-20 scroll-mt-24 border-t border-slate-100 pt-12">
              <EndpointHeader
                method="GET"
                path="/api/v1/templates"
                title="List Available Templates"
                description="Retrieve all certificate design templates accessible by your account, including public system designs and team custom layouts."
              />
              <CodeSnippetTabs snippetGroup={snippets.templates} title="List Templates Request" />
              <JSONResponseBlock code={responses.templates} status="200 OK" title="Response (200 OK)" />
            </section>

            {/* --- ENDPOINT: CREATE CERTIFICATE --- */}
            <section id="create-cert" className="mb-20 scroll-mt-24 border-t border-slate-100 pt-12">
              <EndpointHeader
                method="POST"
                path="/api/v1/certificates"
                title="Issue New Certificate"
                description="Generate a digital credential, deduct 1 credit, render the PDF, and automatically send an email notification to the recipient."
              />

              <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider font-mono">
                Request Body Parameters
              </h3>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs">
                <ParamRow name="template_id" type="integer" required={true} description="ID of the template layout to render." />
                <ParamRow name="recipient_name" type="string" required={true} description="Full name of recipient printed on certificate." />
                <ParamRow name="recipient_email" type="string" required={true} description="Email address where PDF notification will be sent." />
                <ParamRow name="course_title" type="string" required={true} description="Title of course, workshop, or achievement." />
                <ParamRow name="issue_date" type="string" required={true} description="Date of issue (e.g. YYYY-MM-DD or human readable date)." />
                <ParamRow name="issuer_name" type="string" required={false} description="Organization or issuer name (defaults to account name)." />
                <ParamRow name="extra_fields" type="object" required={false} description="Key-value pairs for extra fields (e.g. Grade, Duration, Credential ID)." />
              </div>

              <CodeSnippetTabs snippetGroup={snippets.createCert} title="Issue Certificate Request" />
              <JSONResponseBlock code={responses.createCert} status="201 Created" title="Response (201 Created)" />
            </section>

            {/* --- ENDPOINT: GET CERTIFICATE DETAILS --- */}
            <section id="get-cert" className="mb-20 scroll-mt-24 border-t border-slate-100 pt-12">
              <EndpointHeader
                method="GET"
                path="/api/v1/certificates/:verification_id"
                title="Get Certificate Details"
                description="Fetch status, recipient details, and public verification link for a certificate using its unique verification ID."
              />
              <CodeSnippetTabs snippetGroup={snippets.getCert} title="Get Certificate Request" />
              <JSONResponseBlock code={responses.getCert} status="200 OK" title="Response (200 OK)" />
            </section>

            {/* --- ENDPOINT: REVOKE CERTIFICATE --- */}
            <section id="revoke-cert" className="mb-20 scroll-mt-24 border-t border-slate-100 pt-12">
              <EndpointHeader
                method="POST"
                path="/api/v1/certificates/:verification_id/revoke"
                title="Revoke Certificate"
                description="Revoke an issued certificate. Verification queries will display a revoked warning badge."
              />
              <CodeSnippetTabs snippetGroup={snippets.revokeCert} title="Revoke Request" />
              <JSONResponseBlock code={responses.revokeCert} status="200 OK" title="Response (200 OK)" />
            </section>

            {/* --- SECTION: ERROR CODES --- */}
            <section id="errors" className="mb-20 scroll-mt-24 border-t border-slate-100 pt-12">
              <h2 className="text-2xl font-bold text-[var(--pd-ink)] mb-6">
                Error Handling
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                  <span className="font-mono font-bold text-xs bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-1 rounded-md">
                    400
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Bad Request</h4>
                    <p className="text-xs text-slate-500">Missing required request parameters or invalid payload format.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                  <span className="font-mono font-bold text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md">
                    401
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Unauthorized</h4>
                    <p className="text-xs text-slate-500">Invalid or missing `X-API-Key` header.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                  <span className="font-mono font-bold text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-md">
                    403
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Quota Exceeded / Forbidden</h4>
                    <p className="text-xs text-slate-500">Insufficient certificate quota remaining or permission denied.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md">
                    404
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Not Found</h4>
                    <p className="text-xs text-slate-500">Target template ID or certificate verification ID does not exist.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Markdown Viewer Modal */}
      <MarkdownModal
        isOpen={showMarkdownModal}
        onClose={() => setShowMarkdownModal(false)}
        markdownContent={getDocsMarkdown(prodBaseUrl)}
      />

      {/* Footer aligned next to fixed sidebar on desktop */}
      <div className="lg:ml-72 border-t border-slate-100 bg-white">
        <PublicFooter />
      </div>
    </div>
  );
}

export default DocsPage;