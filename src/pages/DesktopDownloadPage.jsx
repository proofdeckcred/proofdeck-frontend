import React, { useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";
import Tag from "../components/ui/Tag";
import {
  DownloadSimple,
  ShieldCheck,
  Database,
  FolderOpen,
  Key,
  CheckCircle,
  WindowsLogo,
  HardDrives,
  LockKey,
  Sparkle,
  Cpu,
  ArrowsClockwise,
  ArrowRight,
  Info,
} from "@phosphor-icons/react";

export default function DesktopDownloadPage() {
  const [downloadFormat, setDownloadFormat] = useState("exe");

  // GitHub Release direct download endpoints
  const exeUrl =
    "https://github.com/proofdeckcred/proofdeck-backend/releases/latest/download/ProofDeck-Enterprise-Setup-1.0.0.exe";
  const zipUrl =
    "https://github.com/proofdeckcred/proofdeck-backend/releases/latest/download/ProofDeck-Enterprise-v1.0.0-win64.zip";

  const downloadUrl = downloadFormat === "exe" ? exeUrl : zipUrl;
  const downloadFileName =
    downloadFormat === "exe"
      ? "ProofDeck-Enterprise-Setup-1.0.0.exe"
      : "ProofDeck-Enterprise-v1.0.0-win64.zip";

  return (
    <div className="font-sans text-slate-900 bg-white min-h-screen flex flex-col">
      <SEO
        title="Download ProofDeck for Windows — Enterprise On-Premise Edition"
        description="Download the official ProofDeck Enterprise workstation client for Windows 10/11. 100% offline vault with campus SIS database connector."
        keywords="proofdeck desktop, windows credential software, offline certificate generator, enterprise transcript issuance, SIS database connector"
        canonicalUrl="https://www.proofdeck.app/desktop"
      />

      <PublicHeader />

      <main className="flex-1 bg-[#FAFAF9]">
        {/* Hero Section */}
        <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 border-b border-[#E6E4ED] relative overflow-hidden bg-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-50/60 to-transparent blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 mb-5">
              <Tag tone="indigo">
                <span className="flex items-center gap-1.5 font-bold">
                  <HardDrives size={14} weight="bold" />
                  Enterprise Desktop Workstation
                </span>
              </Tag>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Windows 10 / 11 (64-bit)
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#15131F] tracking-tight leading-tight mb-5">
              ProofDeck for Windows
            </h1>
            <p className="text-base sm:text-lg text-[#68647A] max-w-2xl mx-auto font-medium leading-relaxed mb-8">
              100% on-premise credential and document issuance engine for universities,
              polytechnics, and examination bodies. Operates completely offline with zero
              student data leaves your campus network.
            </p>

            {/* Quick trust metrics */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={16} weight="fill" className="text-emerald-500" />
                <span>Zero Cloud Database Dependency</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={16} weight="fill" className="text-emerald-500" />
                <span>Direct SIS / MSSQL Connector</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={16} weight="fill" className="text-emerald-500" />
                <span>High-Speed Local Batch PDF Export</span>
              </div>
            </div>
          </div>
        </section>

        {/* Download & Specifications Grid */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Download Card */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E6E4ED] p-7 sm:p-10 shadow-xs relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#5144E8]/10 text-[#5144E8] flex items-center justify-center">
                      <WindowsLogo size={28} weight="fill" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-[#15131F] tracking-tight">
                        ProofDeck Enterprise Client
                      </h2>
                      <span className="text-xs text-slate-500 font-medium">
                        Release v1.0.0 Stable (x86_64)
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified Build
                  </span>
                </div>

                <p className="text-sm text-[#68647A] leading-relaxed mb-6">
                  Select your preferred package format. The installer bundles the embedded offline
                  engine, local SQLite storage, native PDF renderer, and all institutional database drivers.
                </p>

                {/* Format Switcher */}
                <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => setDownloadFormat("exe")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      downloadFormat === "exe"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Windows Installer (.exe)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDownloadFormat("zip")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      downloadFormat === "zip"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Portable Archive (.zip)
                  </button>
                </div>

                {/* Primary Download Button */}
                <a
                  href={downloadUrl}
                  download={downloadFileName}
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-[#5144E8] hover:bg-[#4336D0] text-white font-bold text-base transition-all shadow-sm shadow-indigo-500/25 group no-underline"
                >
                  <DownloadSimple size={20} weight="bold" className="group-hover:translate-y-0.5 transition-transform" />
                  <span>Download for Windows ({downloadFormat === "exe" ? ".exe" : ".zip"})</span>
                </a>

                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mt-3 px-1">
                  <span>File size: ~90 MB</span>
                  <span>SHA-256 Verified</span>
                  <span>Direct High-Speed CDN</span>
                </div>

                {/* License Requirement Banner */}
                <div className="mt-8 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
                  <Key size={18} weight="duotone" className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-amber-900 mb-0.5">
                      Institutional License Required for Activation
                    </h3>
                    <p className="text-[12px] text-amber-800/90 leading-relaxed mb-0">
                      When launched on your workstation, ProofDeck prompts for your institution&apos;s
                      annual license key (<code className="font-mono bg-amber-100/70 px-1 py-0.5 rounded text-amber-900">PD-ENT-...</code>).
                      Keys are provisioned by your ProofDeck account representative.
                    </p>
                  </div>
                </div>

                {/* System Requirements */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    System Requirements
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="text-slate-400 text-[11px]">Operating System</div>
                      <div className="font-bold text-slate-800">Windows 10/11</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="text-slate-400 text-[11px]">Architecture</div>
                      <div className="font-bold text-slate-800">64-bit (x64)</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="text-slate-400 text-[11px]">Memory (RAM)</div>
                      <div className="font-bold text-slate-800">4 GB Min / 8 GB Rec</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="text-slate-400 text-[11px]">Disk Storage</div>
                      <div className="font-bold text-slate-800">250 MB Free Space</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Setup Steps & Info */}
              <div className="lg:col-span-5 space-y-6">
                {/* Getting Started Card */}
                <div className="bg-white rounded-3xl border border-[#E6E4ED] p-7 shadow-xs">
                  <h3 className="text-base font-bold text-[#15131F] mb-4 flex items-center gap-2">
                    <Sparkle size={18} weight="fill" className="text-indigo-600" />
                    <span>Quick Setup Guide</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 mb-0.5">Download & Launch</div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-0">
                          Save the executable to your administrative PC. Double-click to run—no Python or Node.js required.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 mb-0.5">Activate Institutional Key</div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-0">
                          Enter your institutional key. ProofDeck automatically binds to your institution name and signatory.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 mb-0.5">Connect Database & Issue</div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-0">
                          Connect to your campus student database or import an Excel/CSV sheet, then generate verifiable credentials offline.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enterprise Air-Gapped Notice */}
                <div className="bg-white rounded-3xl border border-[#E6E4ED] p-7 shadow-xs">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <LockKey size={22} weight="duotone" />
                  </div>
                  <h3 className="text-base font-bold text-[#15131F] mb-1.5">
                    Air-Gapped & Offline Ready
                  </h3>
                  <p className="text-xs text-[#68647A] leading-relaxed mb-4">
                    Designed specifically for high-compliance academic environments, registrars, and government examination councils. Once activated, the workstation operates with 100% local data sovereignty.
                  </p>
                  <div className="text-xs text-indigo-600 font-semibold flex items-center gap-1.5">
                    <span>Compliant with National Data Protection Regulations</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Grid: 4 Core Features */}
            <div className="mt-14">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="text-2xl font-black text-[#15131F] tracking-tight mb-2">
                  Built for Campus Infrastructure
                </h2>
                <p className="text-xs sm:text-sm text-[#68647A] leading-relaxed">
                  Every capability needed to issue degrees, diplomas, transcripts, and attestation letters at scale.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl border border-[#E6E4ED] p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                      <LockKey size={22} weight="duotone" />
                    </div>
                    <h3 className="text-sm font-bold text-[#15131F] mb-2">
                      Full Data Sovereignty
                    </h3>
                    <p className="text-xs text-[#68647A] leading-relaxed mb-0">
                      All recipient names, matric numbers, CGPAs, and signatures remain strictly inside your campus walls in an isolated local database.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle size={14} weight="fill" className="text-emerald-600" />
                    <span>Isolated SQLite Vault</span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-[#E6E4ED] p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                      <Database size={22} weight="duotone" />
                    </div>
                    <h3 className="text-sm font-bold text-[#15131F] mb-2">
                      Live SIS Database Connector
                    </h3>
                    <p className="text-xs text-[#68647A] leading-relaxed mb-0">
                      Query your university student portal database (SQL Server, PostgreSQL, MySQL) live from the workstation.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-purple-700">
                    <CheckCircle size={14} weight="fill" className="text-purple-600" />
                    <span>Read-only SQL queries</span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-[#E6E4ED] p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                      <FolderOpen size={22} weight="duotone" />
                    </div>
                    <h3 className="text-sm font-bold text-[#15131F] mb-2">
                      Local Batch File Export
                    </h3>
                    <p className="text-xs text-[#68647A] leading-relaxed mb-0">
                      Export 5,000+ certificates, transcripts, and result sheets directly to any local hard drive folder or external drive in minutes.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-sky-700">
                    <CheckCircle size={14} weight="fill" className="text-sky-600" />
                    <span>Native PDF compiler</span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-[#E6E4ED] p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                      <ShieldCheck size={22} weight="duotone" />
                    </div>
                    <h3 className="text-sm font-bold text-[#15131F] mb-2">
                      Custom Domain QR Verification
                    </h3>
                    <p className="text-xs text-[#68647A] leading-relaxed mb-0">
                      Route verification QR codes directly to your institution&apos;s own verification domain (e.g. <code className="text-[11px] font-mono bg-slate-100 px-1 py-0.5 rounded">verify.youruniversity.edu</code>) or disable QRs for internal records.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700">
                    <CheckCircle size={14} weight="fill" className="text-indigo-600" />
                    <span>Self-hosted verification</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
