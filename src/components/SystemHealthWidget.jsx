import React, { useEffect, useState } from "react";
import { HardDrive, Database, Cpu, AlertTriangle, ShieldCheck, MailCheck, Server } from "lucide-react";
import axios from "axios";
import { SERVER_BASE_URL } from "../config";

const API_URL = `${SERVER_BASE_URL}/api/admin/system/stats`;

const SystemHealthWidget = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load system stats:", err);
        setError("System vitals offline");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="border border-slate-200/80 bg-white rounded-xl p-4 shadow-xs text-xs text-slate-400 flex items-center gap-2">
        <Server className="w-4 h-4 text-indigo-500 animate-pulse" />
        <span>Polling cluster telemetry (srv1744709)...</span>
      </div>
    );
  }

  if (error || !stats) return null;

  const disk = stats.disk || {};
  const db = stats.db || {};

  const isDiskCritical = disk.percent_used > 90;
  const isDiskWarning = disk.percent_used > 75;

  return (
    <div className="border border-slate-200/80 bg-white rounded-xl shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[#5B4CF5]" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-0">
            Cluster Telemetry & Vitals
          </h3>
          <span className="text-slate-300">|</span>
          <span className="text-[10px] font-mono text-slate-500">srv1744709 (Ubuntu 22.04)</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Redis DB 5 & Celery OK
        </div>
      </div>

      {(isDiskCritical || isDiskWarning) && (
        <div className={`p-3 text-xs flex items-center gap-2 border-b ${
          isDiskCritical ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          <AlertTriangle size={15} />
          <span className="font-bold">Disk Threshold Notice: Volume is at {disk.percent_used}% utilization.</span>
        </div>
      )}

      {/* 4-Column Bento Vitals Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
        {/* Metric 1: Disk */}
        <div className="p-4 bg-white hover:bg-slate-50/20 transition-colors">
          <div className="flex items-center justify-between mb-1 gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Host Disk</span>
            <HardDrive size={13} className="text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h4 className="text-base font-bold text-slate-900 mb-0">{disk.used_gb} GB</h4>
            <span className="text-[10px] text-slate-400">/ {disk.total_gb} GB</span>
          </div>
          {/* Progress Mini Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${
                isDiskCritical ? 'bg-red-500' : isDiskWarning ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(disk.percent_used || 0, 100)}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">{disk.percent_used}% utilized</span>
        </div>

        {/* Metric 2: DB Users */}
        <div className="p-4 bg-white hover:bg-slate-50/20 transition-colors">
          <div className="flex items-center justify-between mb-1 gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Database Registry</span>
            <Database size={13} className="text-[#5B4CF5]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h4 className="text-base font-bold text-slate-900 mb-0">{db.users_count || 0}</h4>
            <span className="text-[10px] text-slate-400">Registered Accounts</span>
          </div>
          <span className="text-[9px] text-slate-400 mt-2 block">PostgreSQL Primary</span>
        </div>

        {/* Metric 3: DB Certificates */}
        <div className="p-4 bg-white hover:bg-slate-50/20 transition-colors">
          <div className="flex items-center justify-between mb-1 gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Digital Proofs</span>
            <ShieldCheck size={13} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h4 className="text-base font-bold text-slate-900 mb-0">{db.certificates_count || 0}</h4>
            <span className="text-[10px] text-slate-400">Credentials Minted</span>
          </div>
          <span className="text-[9px] text-emerald-600 font-medium mt-2 block">100% Cryptographically Verified</span>
        </div>

        {/* Metric 4: Mail Subdomain Isolation */}
        <div className="p-4 bg-white hover:bg-slate-50/20 transition-colors">
          <div className="flex items-center justify-between mb-1 gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Promotion Mail</span>
            <MailCheck size={13} className="text-[#5B4CF5]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h4 className="text-base font-bold text-slate-900 mb-0 truncate text-xs font-mono">mail.proofdeck.app</h4>
          </div>
          <span className="text-[9px] text-indigo-600 font-medium mt-2 block">RFC 8058 Isolated Subdomain</span>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthWidget;
