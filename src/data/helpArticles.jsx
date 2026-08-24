// frontend/src/data/helpArticles.jsx

import React from "react";
import {
  Rocket,
  UserCircle,
  LayoutTemplate,
  FolderOpen,
  FileBadge,
  CreditCard,
  Search,
  Code2,
} from "lucide-react";

export const helpArticles = [
  {
    slug: "getting-started",
    title: "Getting Started",
    icon: <Rocket size={24} />,
    theme: "text-indigo-600 bg-indigo-50",
    description: "Start off on the right foot! The core workflow from A to Z.",
    content: (
      <>
        <h2 className="text-xl font-bold mb-4">The Core ProofDeck Workflow</h2>
        <p className="mb-4">
          ProofDeck is built around a simple and powerful four-step process:
        </p>
        <ol className="list-decimal pl-5 space-y-2 mb-6">
          <li>
            <strong>Create a Template:</strong> Design a reusable certificate
            layout. You can use our form-based editor or upload your own visual
            design.
          </li>
          <li>
            <strong>Create a Group:</strong> Organize certificates by batch,
            cohort, or event (e.g., “October 2024 Python Cohort"). Groups are
            essential for bulk actions.
          </li>
          <li>
            <strong>Add Recipients:</strong> Create certificates individually,
            or upload a{" "}
            <code className="bg-gray-100 px-1 rounded">CSV/Excel</code> file for
            bulk issuance.
          </li>
          <li>
            <strong>Deliver & Verify:</strong> Download certificates as PDFs,
            send them via email, or share unique verification links.
          </li>
        </ol>
      </>
    ),
  },
  {
    slug: "account-management",
    title: "Account Management",
    icon: <UserCircle size={24} />,
    theme: "text-green-600 bg-green-50",
    description: "Signing up, logging in, and managing your account type.",
    content: (
      <>
        <h2 className="text-xl font-bold mb-4">Signing Up & Logging In</h2>
        <ul className="list-disc pl-5 space-y-2 mb-6">
          <li>
            <strong>Sign Up:</strong> Choose either an{" "}
            <strong>Individual</strong> or <strong>Company</strong> account.
          </li>
          <li>
            <strong>Log In:</strong> Use your registered email and password to
            access your dashboard.
          </li>
        </ul>
        <h2 className="text-xl font-bold mb-4">Resetting Your Password</h2>
        <p className="mb-2">If you forget your password:</p>
        <ol className="list-decimal pl-5 space-y-2 mb-6">
          <li>
            Click <strong>Forgot Password?</strong> on the login page.
          </li>
          <li>Enter your registered email address.</li>
          <li>You'll receive a secure reset link (valid for 15 minutes).</li>
        </ol>
      </>
    ),
  },
  {
    slug: "managing-templates",
    title: "Managing Templates",
    icon: <LayoutTemplate size={24} />,
    theme: "text-blue-600 bg-blue-50",
    description: "Design beautiful, reusable templates for your certificates.",
    content: (
      <>
        <h2 className="text-xl font-bold mb-4">
          Creating a Form-Based Template
        </h2>
        <p className="mb-2">
          This is the easiest way to design professional certificates quickly.
        </p>
        <ol className="list-decimal pl-5 space-y-2 mb-6">
          <li>
            Go to <strong>Templates → Create Form-Based Template</strong>.
          </li>
          <li>Fill in the fields like Template Name, Title, and Colors.</li>
          <li>Watch the Live Preview update in real time.</li>
          <li>
            Click <strong>Create Template</strong> when done.
          </li>
        </ol>

        <h2 className="text-xl font-bold mb-4">
          Creating a Visual (Custom) Template
        </h2>
        <p className="mb-2">
          Use this when you already have a designed certificate image (JPG or
          PNG).
        </p>
        <ol className="list-decimal pl-5 space-y-2 mb-6">
          <li>
            Click <strong>Upload Your Own Template</strong> on the Templates
            page.
          </li>
          <li>
            <strong>Add Placeholders:</strong> Drag placeholders like{" "}
            <code className="bg-gray-100 px-1 rounded">{`{{recipient_name}}`}</code>{" "}
            onto the design canvas.
          </li>
          <li>
            <strong>Style & Position:</strong> Adjust font size, alignment,
            color, and rotation.
          </li>
          <li>
            Click <strong>Save Template</strong>.
          </li>
        </ol>
      </>
    ),
  },
  {
    slug: "managing-groups",
    title: "Managing Groups",
    icon: <FolderOpen size={24} />,
    theme: "text-yellow-600 bg-yellow-50",
    description: "Organize certificates by project, event, or cohort.",
    content: (
      <>
        <h2 className="text-xl font-bold mb-4">What Are Groups?</h2>
        <p className="mb-4">
          Groups help you organize certificates and are required for bulk
          actions. Examples include "2024 Web Dev Cohort" or "Annual Sales
          Conference".
        </p>
        <h2 className="text-xl font-bold mb-4">Creating and Using Groups</h2>
        <ol className="list-decimal pl-5 space-y-2 mb-6">
          <li>
            Go to the <strong>Groups</strong> page.
          </li>
          <li>
            Click <strong>Create New Group</strong> and give it a name.
          </li>
          <li>
            Inside a group, you can download all certificates as a single{" "}
            <code className="bg-gray-100 px-1 rounded">ZIP</code> file or send
            all unsent emails.
          </li>
        </ol>
      </>
    ),
  },
  {
    slug: "issuing-certificates",
    title: "Issuing Certificates",
    icon: <FileBadge size={24} />,
    theme: "text-red-600 bg-red-50",
    description: "Learn how to create single or bulk certificates with ease.",
    content: (
      <>
        <h2 className="text-xl font-bold mb-4">
          Creating a Single Certificate
        </h2>
        <ol className="list-decimal pl-5 space-y-2 mb-6">
          <li>
            Go to <strong>My Certificates → New</strong>.
          </li>
          <li>Choose a template and fill in the recipient's details.</li>
          <li>
            Click <strong>Publish</strong>. If an email is provided, it's
            automatically sent.
          </li>
        </ol>

        <h2 className="text-xl font-bold mb-4">
          Creating Certificates in Bulk (CSV/Excel Upload)
        </h2>
        <ol className="list-decimal pl-5 space-y-2 mb-6">
          <li>
            Go to <strong>My Certificates → Bulk Create</strong>.
          </li>
          <li>Select a template and assign a group.</li>
          <li>
            Upload your file (
            <code className="bg-gray-100 px-1 rounded">.csv</code>,{" "}
            <code className="bg-gray-100 px-1 rounded">.xlsx</code>,{" "}
            <code className="bg-gray-100 px-1 rounded">.xls</code>).
          </li>
          <li>
            Required columns are:{" "}
            <code className="bg-gray-100 px-1 rounded">recipient_name</code>,{" "}
            <code className="bg-gray-100 px-1 rounded">course_title</code>,{" "}
            <code className="bg-gray-100 px-1 rounded">issue_date</code>.
          </li>
          <li>
            Click <strong>Create Certificates</strong>. The system processes all
            valid rows and reports any errors.
          </li>
        </ol>
      </>
    ),
  },
  {
    slug: "billing-and-plans",
    title: "Billing & Plans",
    icon: <CreditCard size={24} />,
    theme: "text-purple-600 bg-purple-50",
    description: "Understand our credit system and how to upgrade your plan.",
    content: (
      <>
        <h2 className="text-xl font-bold mb-4">
          How Our Credit-Based Model Works
        </h2>
        <p className="mb-4">
          ProofDeck uses a credit-based model. Each issued certificate consumes
          one credit from your account quota.
        </p>
        <h2 className="text-xl font-bold mb-4">Upgrading Your Plan</h2>
        <ol className="list-decimal pl-5 space-y-2 mb-6">
          <li>
            Go to <strong>Settings → Billing</strong>.
          </li>
          <li>
            Choose a plan: <strong>Starter</strong>, <strong>Growth</strong>,{" "}
            <strong>Pro</strong>, or <strong>Enterprise</strong>.
          </li>
          <li>
            Click <strong>Upgrade</strong> to pay securely via Paystack.
          </li>
          <li>Your quota updates instantly upon successful payment.</li>
        </ol>
      </>
    ),
  },
  {
    slug: "public-verification",
    title: "Public Verification",
    icon: <Search size={24} />,
    theme: "text-gray-600 bg-gray-100",
    description: "How certificate verification works on the Open Ledger.",
    content: (
      <>
        <h2 className="text-xl font-bold mb-4">How Verification Works</h2>
        <p className="mb-4">
          Every certificate has a unique <strong>Verification ID</strong> and a
          scannable <strong>QR code</strong> for instant verification.
        </p>
        <h2 className="text-xl font-bold mb-4">
          The Open Ledger (Advanced Search)
        </h2>
        <p className="mb-6">
          Accessible via the <strong>Search</strong> link on our homepage, the
          Open Ledger allows anyone to look up a certificate's details, ensuring
          transparency and trust.
        </p>
      </>
    ),
  },
  {
    slug: "developer-api",
    title: "Developer API",
    icon: <Code2 size={24} />,
    theme: "text-pink-600 bg-pink-50",
    description:
      "Integrate ProofDeck into your own systems. (Pro & Enterprise)",
    content: (
      <>
        <h2 className="text-xl font-bold mb-4">Generating Your API Key</h2>
        <ol className="list-decimal pl-5 space-y-2 mb-6">
          <li>
            Go to <strong>Settings → Developer</strong>.
          </li>
          <li>
            Click <strong>Generate API Key</strong>.
          </li>
          <li>
            <strong>Important:</strong> Copy and store your key securely. It is
            only shown once.
          </li>
          <li>
            Use this key in the{" "}
            <code className="bg-gray-100 px-1 rounded">X-API-Key</code> header
            of your REST API requests.
          </li>
        </ol>
        <p className="mb-6">
          For detailed implementation, refer to the official{" "}
          <strong>ProofDeck API Documentation</strong>.
        </p>
      </>
    ),
  },
];
