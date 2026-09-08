import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ExternalLink, LogOut, Activity, User, Menu, Bell } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminTopbar({ toggleMobileSidebar }) {
  const { admin } = useAdminAuth();
  const navigate = useNavigate();

  const isSuperAdmin = admin?.role === 'super_admin';
  const isBusinessAdmin = admin?.role === 'business_admin';

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <header className="flex bg-white border-b border-slate-200/80 px-4 sm:px-6 md:px-8 py-2.5 items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Mobile Left: Menu Toggle + Branding */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={toggleMobileSidebar}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <Link to="/admin/dashboard" className="flex items-center gap-2 no-underline">
          <img src="/logo.png" alt="ProofDeck" className="w-7 h-7 object-contain" />
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            ProofDeck <span className="text-[#5B4CF5] text-xs font-semibold">Admin</span>
          </span>
        </Link>
      </div>

      {/* Desktop Left: Breadcrumb / Status */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
            MISSION CONTROL
          </span>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Production Cluster Active
          </div>
        </div>
      </div>

      {/* Desktop Spacer */}
      <div className="hidden md:flex flex-1"></div>

      {/* Action Items: User App Link, Role Badge, Profile & Logout */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Switch to User Portal */}
        <Link
          to="/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#5B4CF5] hover:bg-indigo-50/50 rounded-lg border border-slate-200/80 transition-all no-underline shadow-xs"
          title="Open User App in new tab"
        >
          <span>User Portal</span>
          <ExternalLink size={13} className="text-slate-400" />
        </Link>

        {/* Admin Role Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-[#5B4CF5] text-xs font-bold uppercase tracking-wider">
          <Shield size={13} />
          <span>{isSuperAdmin ? 'Super Admin' : isBusinessAdmin ? 'Business Admin' : 'Admin'}</span>
        </div>

        {/* Profile Pill & Logout */}
        <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-slate-200/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#5B4CF5] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {(admin?.name || admin?.email || 'A')[0].toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none mb-0.5">
                {admin?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-400 leading-none truncate max-w-[140px]">
                {admin?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Sign Out of Admin"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
