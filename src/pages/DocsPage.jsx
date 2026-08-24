import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { motion } from "motion/react";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import {
  Book,
  Key,
  Terminal,
  AlertOctagon,
  Menu,
  X,
  ChevronRight,
  Copy,
  CheckCircle2,
  Globe,
  Code2
} from "lucide-react";

// --- Styled Code Block Component ---
const CodeSnippet = ({ lang, code, title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden bg-[#0F172A] border border-gray-800 my-6 shadow-2xl ring-1 ring-white/10 group">
        <div className="flex justify-between items-center px-4 py-3 bg-[#1E293B]/50 border-b border-gray-800 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                {title && <span className="text-xs font-medium text-gray-400 ml-2">{title}</span>}
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-medium text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded">
                    {lang}
                </span>
                <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
                    title="Copy to clipboard"
                >
                    {copied ? <CheckCircle2 size={16} className="text-indigo-400" /> : <Copy size={16} />}
                </button>
            </div>
        </div>
        <div className="p-5 overflow-x-auto custom-scrollbar">
            <pre className="text-sm font-mono leading-relaxed text-indigo-100/90 font-ligatures">
                <code>{code}</code>
            </pre>
        </div>
    </div>
  );
};

const NavItem = ({ href, icon: Icon, label, active, onClick }) => (
  <a
    href={href}
    onClick={onClick}
    className={`group flex items-center gap-3 py-2 px-4 text-[14px] font-medium border-l-2 transition-all duration-150 no-underline ${
      active
        ? "text-indigo-600 border-indigo-600 bg-indigo-50/40"
        : "text-gray-500 hover:text-gray-900 border-transparent hover:border-gray-200 hover:bg-gray-50/50"
    }`}
  >
    <Icon size={16} className={active ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-600 transition-colors"} />
    {label}
  </a>
);

const MintlifyCard = ({ title, description, link, svgPath }) => (
  <a
    href={link}
    className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-150 bg-white hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-300 transition-all duration-300 no-underline"
  >
    {/* Visual Grid Header */}
    <div className="relative h-32 bg-indigo-50/30 flex items-center justify-center border-b border-gray-100 overflow-hidden">
      {/* Repeating radial grid pattern like Mintlify but Indigo */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#4f46e5_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>
      
      {/* Icon Graphic */}
      <div className="relative text-indigo-500 group-hover:scale-110 transition-transform duration-300">
        {svgPath}
      </div>
    </div>
    {/* Description Info */}
    <div className="p-5 flex-1 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-1.5 flex items-center gap-1.5 group-hover:text-indigo-600 transition-colors">
          {title}
          <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  </a>
);

function DocsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("intro");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Scroll spy for active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["intro", "auth", "create", "errors"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Code Examples ---
  const curlExample = `curl -X POST 'https://certifyme.pythonanywhere.com/api/v1/certificates' \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: sk_live_xxxxxxxx' \\
  -d '{
    "template_id": 1,
    "recipient_name": "Bolaji Ayodele",
    "recipient_email": "bolaji@example.com",
    "course_title": "React Mastery",
    "issue_date": "2025-01-15",
    "extra_fields": {
      "Grade": "A+"
    }
  }'`;

  const jsExample = `const issueCert = async () => {
  const res = await fetch('https://certifyme.pythonanywhere.com/api/v1/certificates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'sk_live_xxxxxxxx'
    },
    body: JSON.stringify({
      template_id: 1,
      recipient_name: "Bolaji Ayodele",
      course_title: "React Mastery",
      issue_date: "2025-01-15"
    })
  });
  
  const data = await res.json();
  console.log(data);
};`;

  const pythonExample = `import requests

url = "https://certifyme.pythonanywhere.com/api/v1/certificates"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "sk_live_xxxxxxxx"
}
payload = {
    "template_id": 1,
    "recipient_name": "Bolaji Ayodele",
    "recipient_email": "bolaji@example.com",
    "course_title": "Python for Data Science",
    "issue_date": "2025-01-15"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;

  const successResponse = `{
  "msg": "Certificate created and dispatched successfully.",
  "certificate_id": 842,
  "verification_id": "a1b2c3d4-e5f6-7890",
  "status": "sent",
  "url": "https://certify.me/verify/a1b2c3d4"
}`;

  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen flex flex-col">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <PublicHeader />

      <div className="flex-grow w-full relative">
        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-2xl z-50 hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-300"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar Navigation */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-100 
            transform transition-transform duration-300 ease-in-out
            lg:translate-x-0 lg:fixed lg:top-[81px] lg:bottom-0 lg:left-0 lg:z-30
            pb-20 lg:pb-0 overflow-y-auto custom-scrollbar
            ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"}
          `}
        >
            <div className="p-6 md:p-7 space-y-7 min-h-full flex flex-col justify-between">
                <div>
                    {/* Mintlify Mock Search Bar */}
                    <div className="relative mb-6">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search... Ctrl K"
                            readOnly
                            className="w-full pl-9 pr-12 py-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/20 cursor-not-allowed font-medium"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[9px] font-mono text-gray-400">
                            ⌘K
                        </span>
                    </div>

                    {/* Group: GET STARTED */}
                    <div className="mb-6">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">
                            Get Started
                        </h4>
                        <nav className="space-y-0.5">
                            <NavItem
                                href="#intro"
                                icon={Globe}
                                label="Introduction"
                                active={activeSection === "intro"}
                                onClick={() => { closeSidebar(); setActiveSection("intro"); }}
                            />
                            <NavItem
                                href="#auth"
                                icon={Key}
                                label="Authentication"
                                active={activeSection === "auth"}
                                onClick={() => { closeSidebar(); setActiveSection("auth"); }}
                            />
                        </nav>
                    </div>

                    {/* Group: API REFERENCE */}
                    <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">
                            API Reference
                        </h4>
                        <nav className="space-y-0.5">
                            <NavItem
                                href="#create"
                                icon={Terminal}
                                label="Create Certificate"
                                active={activeSection === "create"}
                                onClick={() => { closeSidebar(); setActiveSection("create"); }}
                            />
                            <NavItem
                                href="#errors"
                                icon={AlertOctagon}
                                label="Error Handling"
                                active={activeSection === "errors"}
                                onClick={() => { closeSidebar(); setActiveSection("errors"); }}
                            />
                        </nav>
                    </div>
                </div>

                {/* Nice Sidebar Contact Box */}
                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-900">
                    <h5 className="font-bold text-sm mb-1 text-indigo-950">
                        Need specific help?
                    </h5>
                    <p className="text-[11px] text-indigo-800/80 mb-3.5 leading-relaxed font-medium">
                        Our engineering team is available to help with your custom integrations.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center justify-center w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 px-3 py-2.5 rounded-lg transition-colors text-white no-underline shadow-sm"
                    >
                        Contact Support <ChevronRight size={12} className="ml-1" />
                    </Link>
                </div>
            </div>
        </aside>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-xs z-30 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Main Content */}
        <main className="flex-grow min-w-0 py-12 px-6 lg:px-16 xl:px-24 lg:ml-72">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-14">
                    <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 font-semibold text-xs uppercase tracking-wide">
                        <Code2 size={13} className="text-indigo-500" /> API Version 1.0
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight leading-tight">
                    Documentation
                    </h1>
                    <p className="text-lg text-gray-500 leading-relaxed font-normal max-w-3xl">
                    Seamlessly integrate credential generation and verification into your existing workflows. 
                    Our implementation-first API follows RESTful conventions and returns JSON-encoded responses.
                    </p>
                </div>

                {/* Intro */}
                <section id="intro" className="mb-20 scroll-mt-24">
                    <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                        Introduction
                        <div className="h-px flex-1 bg-gray-100 ml-4"></div>
                    </h2>
                    <div className="prose prose-lg text-gray-600 mb-8 leading-relaxed font-normal text-sm sm:text-base">
                        <p>
                            The ProofDeck API is organized around REST. Our API has
                            predictable resource-oriented URLs, accepts <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold text-sm">application/json</code> request
                            bodies, returns JSON-encoded responses, and uses standard HTTP
                            response codes to indicate API errors.
                        </p>
                        <p className="mt-4">
                            Base URL: <code className="text-xs bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg select-all font-mono font-medium text-gray-800">https://certifyme.pythonanywhere.com/api/v1</code>
                        </p>
                    </div>

                    {/* Mintlify Card Grid */}
                    <div className="grid md:grid-cols-2 gap-6 my-10">
                        <MintlifyCard 
                            title="Quickstart"
                            description="Create templates and design layouts to issue your first credentials in minutes with our guide."
                            link="#create"
                            svgPath={
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.61 3.75a14.98 14.98 0 00-6.16 12.12A14.98 14.98 0 009.61 19.5c.34 0 .67-.01 1-.03m5.84-5.1a12.04 12.04 0 01-5.84-1.92m0 0l-5.84-1.93" />
                                </svg>
                            }
                        />
                        <MintlifyCard 
                            title="API Integration"
                            description="Integrate credential verification and programmatic generation directly into your application code."
                            link="#auth"
                            svgPath={
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                                </svg>
                            }
                        />
                    </div>
                </section>

                {/* Auth */}
                <section id="auth" className="mb-20 scroll-mt-24">
                    <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                        Authentication
                        <div className="h-px flex-1 bg-gray-100 ml-4"></div>
                    </h2>
                    <p className="text-gray-600 mb-5 text-sm sm:text-base leading-relaxed">
                        Authenticate your API requests by including your secret key in the{" "}
                        <code className="text-indigo-600 font-mono font-bold text-sm bg-indigo-50 px-1.5 py-0.5 rounded">X-API-Key</code> header of every request. You can manage your API keys in the Dashboard settings.
                    </p>
                    
                    <div className="bg-yellow-50/50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertOctagon className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <p className="text-xs sm:text-sm text-yellow-800 font-medium">
                                    Your API keys carry many privileges, so be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, or front-end client repositories.
                                </p>
                            </div>
                        </div>
                    </div>

                    <CodeSnippet lang="HTTP Header" title="Authentication Header" code="X-API-Key: sk_live_51M..." />
                </section>

                {/* Create Certificate */}
                <section id="create" className="mb-20 scroll-mt-24">
                    <div className="flex items-center flex-wrap gap-4 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 m-0">
                            Create Certificate
                        </h2>
                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md text-xs font-bold font-mono border border-indigo-100">
                            POST /certificates
                        </span>
                    </div>
                
                    <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
                        Generate a new certificate dynamically from a pre-defined template layout. The certificate will be emailed directly to the recipient immediately upon creation.
                    </p>

                    <div className="space-y-10">
                        {/* cURL */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-2">cURL Request</h3>
                            <CodeSnippet lang="bash" title="Terminal" code={curlExample} />
                        </div>

                        {/* JS */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-2">JavaScript Request</h3>
                            <CodeSnippet lang="javascript" title="Fetch" code={jsExample} />
                        </div>
                        
                        {/* Python */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-2">Python Request</h3>
                            <CodeSnippet lang="python" title="Requests" code={pythonExample} />
                        </div>
                    </div>

                    <div className="mt-10">
                         <h3 className="text-sm font-bold text-gray-900 mb-2">Success Response</h3>
                         <p className="text-xs text-gray-500 mb-3">Returns a 201 Created response containing the dispatch and verification URL.</p>
                         <CodeSnippet lang="json" title="JSON Response" code={successResponse} />
                    </div>
                </section>

                {/* Errors */}
                <section id="errors" className="mb-20 scroll-mt-24">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        Error Handling
                        <div className="h-px flex-1 bg-gray-100 ml-4"></div>
                    </h2>
                    <div className="grid gap-3">
                        <ErrorRow
                        code="400"
                        title="Bad Request"
                        desc="The request was unacceptable, often due to missing a required parameter."
                        />
                        <ErrorRow
                        code="401"
                        title="Unauthorized"
                        desc="No valid API key provided."
                        />
                        <ErrorRow
                        code="402"
                        title="Request Failed"
                        desc="The parameters were valid but the request failed."
                        />
                        <ErrorRow
                        code="403"
                        title="Forbidden"
                        desc="The API key doesn't have permissions to perform the request."
                        />
                        <ErrorRow
                        code="404"
                        title="Not Found"
                        desc="The requested resource (e.g. template) doesn't exist."
                        />
                    </div>
                </section>
            </div>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}

// --- Local Helpers ---
const ErrorRow = ({ code, title, desc }) => (
  <div className="group flex flex-col sm:flex-row sm:items-center p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
    <div className="flex items-center mb-1 sm:mb-0">
        <span className="font-mono font-bold text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 w-12 text-center mr-4">{code}</span>
        <span className="font-bold text-gray-900 text-sm mr-4 min-w-[120px]">{title}</span>
    </div>
    <span className="text-gray-500 text-xs sm:text-sm font-medium">{desc}</span>
  </div>
);

export default DocsPage;