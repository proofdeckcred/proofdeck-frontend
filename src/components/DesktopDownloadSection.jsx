import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  Sparkle
} from "@phosphor-icons/react";
import Tag from "./ui/Tag";

export default function DesktopDownloadSection() {
  const [downloadFormat, setDownloadFormat] = useState("exe");

  // In production, these link to the GitHub Release assets or direct VPS static downloads
  const exeUrl = "https://github.com/proofdeckcred/proofdeck-backend/releases/latest/download/ProofDeck-Enterprise-Setup-1.0.0.exe";
  const msiUrl = "https://github.com/proofdeckcred/proofdeck-backend/releases/latest/download/ProofDeck-Enterprise-Setup-1.0.0.msi";

  return (
    <section id="desktop-download" className="py-20 md:py-28 bg-[#FAFAF9] border-t border-b border-[#E6E4ED] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="mb-4 inline-flex items-center gap-1.5">
            <Tag tone="indigo">
              <span className="flex items-center gap-1">
                <HardDrives size={13} weight="bold" /> Enterprise Desktop Edition
              </span>
            </Tag>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#15131F] tracking-tight leading-tight mb-4">
            ProofDeck for Windows
          </h2>
          <p className="text-sm sm:text-base text-[#68647A] font-medium leading-relaxed">
            100% on-premise credential and document issuance for universities, polytechnics, and examination bodies.
            Connects live to your campus student database with complete offline data sovereignty.
          </p>
        </div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Download & Specs Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E6E4ED] p-7 sm:p-9 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#5144E8]/10 text-[#5144E8] flex items-center justify-center">
                  <WindowsLogo size={28} weight="fill" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#F4F3FF] text-[#5144E8] border border-indigo-200">
                  v1.0.0 Stable
                </span>
              </div>

              <h3 className="text-xl font-black text-[#15131F] mb-2 tracking-tight">
                Windows Workstation Client
              </h3>
              <p className="text-xs text-[#68647A] leading-relaxed mb-6">
                Native 64-bit installer with built-in offline SQLite vault, native PDF compiler, and Microsoft SQL Server/Postgres SIS connector.
              </p>

              {/* Format Switcher */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setDownloadFormat("exe")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    downloadFormat === "exe"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Standard Installer (.exe)
                </button>
                <button
                  type="button"
                  onClick={() => setDownloadFormat("msi")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    downloadFormat === "msi"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Enterprise Package (.msi)
                </button>
              </div>

              {/* Primary Action Button */}
              <div className="space-y-3">
                <a
                  href={downloadFormat === "exe" ? exeUrl : msiUrl}
                  className="w-full py-3.5 px-5 bg-[#5144E8] hover:bg-[#4433E0] text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all no-underline"
                >
                  <DownloadSimple size={18} weight="bold" />
                  <span>Download for Windows {downloadFormat.toUpperCase()}</span>
                </a>
                <div className="flex items-center justify-between text-[11px] text-[#8C889E] font-medium px-1">
                  <span>Windows 10 / 11 (64-bit)</span>
                  <span>~92 MB</span>
                </div>
              </div>
            </div>

            {/* License Key Requirement notice */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-start gap-2.5 text-xs text-[#68647A]">
                <Key size={18} weight="duotone" className="text-[#5144E8] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#15131F] block mb-0.5">Annual Institutional License</span>
                  <span>
                    Requires an active campus license key (<code className="bg-slate-100 px-1 py-0.5 rounded text-[#5144E8] font-mono text-[11px]">PD-ENT-...</code>) issued by your ProofDeck Enterprise administrator.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Key Capabilities Bento */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bento Card 1 */}
            <div className="bg-white rounded-3xl border border-[#E6E4ED] p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                  <LockKey size={22} weight="duotone" />
                </div>
                <h4 className="text-sm font-bold text-[#15131F] mb-1.5">
                  100% Student Data Sovereignty
                </h4>
                <p className="text-xs text-[#68647A] leading-relaxed mb-0">
                  Zero student records or matriculation details are transmitted off-device. All database queries, rendering, and PDF stamping execute inside your campus intranet.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle size={14} weight="fill" className="text-emerald-600" />
                <span>Air-gapped operation certified</span>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="bg-white rounded-3xl border border-[#E6E4ED] p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                  <Database size={22} weight="duotone" />
                </div>
                <h4 className="text-sm font-bold text-[#15131F] mb-1.5">
                  Direct SIS Database Connector
                </h4>
                <p className="text-xs text-[#68647A] leading-relaxed mb-0">
                  Pull student lists directly by Student ID, Department, or Senate Graduation session from Microsoft SQL Server, PostgreSQL, or local databases without manual CSV export.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700">
                <CheckCircle size={14} weight="fill" className="text-indigo-600" />
                <span>MSSQL, PostgreSQL & MySQL</span>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="bg-white rounded-3xl border border-[#E6E4ED] p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                  <FolderOpen size={22} weight="duotone" />
                </div>
                <h4 className="text-sm font-bold text-[#15131F] mb-1.5">
                  Native Hard Drive Batch Export
                </h4>
                <p className="text-xs text-[#68647A] leading-relaxed mb-0">
                  Export thousands of certificates or A4 portrait letters straight into a designated local directory on your PC, cleanly organized and named by student matric number.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                <CheckCircle size={14} weight="fill" className="text-slate-600" />
                <span>High-throughput offline engine</span>
              </div>
            </div>

            {/* Bento Card 4 */}
            <div className="bg-white rounded-3xl border border-[#E6E4ED] p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                  <ShieldCheck size={22} weight="duotone" />
                </div>
                <h4 className="text-sm font-bold text-[#15131F] mb-1.5">
                  University Domain QR Verification
                </h4>
                <p className="text-xs text-[#68647A] leading-relaxed mb-0">
                  Optionally configure QR codes to route to your institution&apos;s own verification domain (e.g. <code>verify.nileuniversity.edu.ng</code>) or disable QRs completely for internal memos.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700">
                <CheckCircle size={14} weight="fill" className="text-indigo-600" />
                <span>Self-hosted verification portal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
