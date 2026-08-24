import React, { useState, useEffect } from "react";
import { Shield, Lock, FileText, Server, Globe, Key, ArrowLeft } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

const LegalPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("privacy");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["privacy", "terms", "security"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  const tabs = [
    { id: "privacy", label: "Privacy Policy", icon: Lock },
    { id: "terms", label: "Terms of Service", icon: FileText },
    { id: "security", label: "Security & Compliance", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-500 hover:text-gray-900 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors" title="Back to Home">
                <ArrowLeft size={20} />
              </Link>
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="ProofDeck" className="h-8 w-8 rounded-lg object-contain" />
                <span className="font-bold text-lg text-gray-900">ProofDeck</span>
                <span className="text-gray-400 font-medium px-1">/</span>
                <span className="font-semibold text-lg text-gray-600">Legal</span>
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
               {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-indigo-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <tab.icon size={16} className="mr-2" />
                    {tab.label}
                  </button>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Mobile Tab Select */}
          <div className="block md:hidden mb-6 lg:col-span-3">
             <select 
               value={activeTab} 
               onChange={(e) => setActiveTab(e.target.value)}
               className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
             >
                {tabs.map((tab) => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
             </select>
          </div>

          <div className="bg-white shadow rounded-lg lg:col-span-12 xl:col-span-12 p-8 md:p-12 min-h-[60vh] prose prose-indigo max-w-none">
            {activeTab === "privacy" && <PrivacyPolicy />}
            {activeTab === "terms" && <TermsOfService />}
            {activeTab === "security" && <SecurityPolicy />}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CONTENT COMPONENTS ---

const PrivacyPolicy = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-4">Privacy Policy</h1>
    <p className="text-sm text-gray-500">Last Updated: January 22, 2026</p>

    <section>
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">1. Data Ingestion and Telemetry</h2>
      <p className="text-gray-600 leading-relaxed">
        At ProofDeck, we utilize advanced heuristic algorithms to parse, sanitize, and ingest user telemetry data for the purposes of improving our asynchronous microservices architecture. All personally identifiable information (PII) is encrypted at rest using AES-256-GCM standards and in transit via TLS 1.3 protocols. We rigorously adhere to the principle of least privilege regarding data access, ensuring that only authenticated ephemeral processes within our Kubernetes clusters can interact with user shards.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">2. Cookies and Local Storage Persistence</h2>
      <p className="text-gray-600 leading-relaxed">
        We employ JWT (JSON Web Tokens) for stateless authentication and store session identifiers in HttpOnly, Secure cookies to mitigate XSS (Cross-Site Scripting) vectors. LocalStorage is utilized solely for non-sensitive UI state persistence (e.g., theme preferences, sidebar collapse state). By navigating our platform, you consent to the serialization of such state vectors onto your local device's non-volatile memory.
      </p>
    </section>
    
    <section>
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">3. Third-Party API Integrations</h2>
      <p className="text-gray-600 leading-relaxed">
        Our system interoperates with downstream payment gateways (e.g., Stripe, Paystack) via idempotent webhook events. We do not store raw PAN (Primary Account Number) data; instead, we rely on tokenized references returned by PCI-DSS Level 1 compliant processors. Your transactional metadata is aggregated for analytical heuristics but remains anonymized in our OLAP data warehouse.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">4. GDPR and CCPA Compliance Framework</h2>
      <p className="text-gray-600 leading-relaxed">
        Pursuant to Article 17 of the GDPR (Right to Erasure), users may request the rigorous purging of their relational database entries. Our distributed ledger (if applicable in future iterations) ensures cryptographic immutability of issued certificates, which constitutes a legitimate interest exception under data retention statutes.
      </p>
    </section>
  </div>
);

const TermsOfService = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-4">Terms of Service</h1>
    <p className="text-sm text-gray-500">Effective Date: January 1, 2024</p>

    <section>
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">1. Service Level Agreement (SLA) & Uptime</h2>
      <p className="text-gray-600 leading-relaxed">
        ProofDeck guarantees a 99.9% uptime availability for our RESTful API endpoints, calculated on a monthly rolling window. Downtime resulting from scheduled maintenance windows, force majeure events, or upstream provider outages (e.g., AWS availability zone failures) is excluded from SLA calculations. Rate limiting is enforced via a token bucket algorithm to prevent DDoS attacks and ensure fair resource allocation across tenants.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">2. User Liability and Indemnification</h2>
      <p className="text-gray-600 leading-relaxed">
        By utilizing our SaaS platform, you agree to indemnify and hold harmless ProofDeck, its subsidiaries, and affiliates from any claims arising out of your misuse of the certificate generation engine—including but not limited to the issuance of fraudulent credentials, copyright infringement within custom SVG templates, or violation of local regulatory compliance mandates.
      </p>
    </section>

    <section>
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">3. Intellectual Property Rights</h2>
      <p className="text-gray-600 leading-relaxed">
        All source code, proprietary algorithms, and UI/UX paradigms remain the exclusive intellectual property of ProofDeck. Users retain ownership of the data injected into our system (the "Payload"), but grant ProofDeck a worldwide, non-exclusive, royalty-free license to host, parse, and render said Payload for the purpose of service delivery.
      </p>
    </section>
  </div>
);

const SecurityPolicy = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-4">Security Infrastructure</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border">
            <Server className="text-indigo-600 shrink-0" />
            <div>
                <h3 className="font-bold text-gray-900">Infrastructure Security</h3>
                <p className="text-sm text-gray-600 mt-2">
                    Our infrastructure is hosted on ISO 27001 certified data centers. We employ VPC peering, private subnets, and strict security group ingress rules to isolate critical database clusters.
                </p>
            </div>
        </div>
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border">
            <Lock className="text-indigo-600 shrink-0" />
            <div>
                <h3 className="font-bold text-gray-900">Encryption Standards</h3>
                <p className="text-sm text-gray-600 mt-2">
                    Data at rest is encrypted using AES-256. All internal traffic is mutually authenticated (mTLS). External traffic is forced over HTTPS enforcing HSTS headers.
                </p>
            </div>
        </div>
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border">
            <Key className="text-indigo-600 shrink-0" />
            <div>
                <h3 className="font-bold text-gray-900">Access Control</h3>
                <p className="text-sm text-gray-600 mt-2">
                    We utilize Role-Based Access Control (RBAC) and Multi-Factor Authentication (MFA) for all administrative access. Just-in-Time (JIT) access policies are applied to production environments.
                </p>
            </div>
        </div>
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border">
            <Globe className="text-indigo-600 shrink-0" />
            <div>
                <h3 className="font-bold text-gray-900">Vulnerability Management</h3>
                <p className="text-sm text-gray-600 mt-2">
                    Automated SAST/DAST pipelines scan our codebase daily. We engage third-party penetration testers annually to valid our threat model.
                </p>
            </div>
        </div>
    </div>

    <section>
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">Cryptographic Integrity</h2>
      <p className="text-gray-600 leading-relaxed">
        Certificate verification hashes are computed using SHA-256 algorithms. To prevent hash collisions and ensure non-repudiation, we salt each record with high-entropy random values before hashing.
      </p>
    </section>
  </div>
);

export default LegalPage;
