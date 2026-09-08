import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building,
  CreditCard,
  FileText,
  BarChart2,
  MessageSquare,
  LogOut,
  Mail,
  Shield,
  X,
  Radio,
  Sliders,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

function AdminSidebar({ onClose }) {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'super_admin';

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-xs font-semibold ${
      isActive
        ? "bg-indigo-50 text-[#5B4CF5] shadow-xs"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-full overflow-y-auto">
      {/* --- LOGO HEADER --- */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link
          to="/admin/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5 no-underline"
        >
          <img
            src="/logo.png"
            alt="ProofDeck"
            className="w-8 h-8 object-contain"
          />
          <div>
            <div className="text-base font-bold text-slate-900 tracking-tight leading-none">
              ProofDeck
            </div>
            <span className="text-[10px] font-bold text-[#5B4CF5] uppercase tracking-wider">
              Mission Control
            </span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 md:hidden rounded-lg hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* --- NAVIGATION LINKS --- */}
      <div className="flex-1 px-3 py-5 space-y-6">
        {/* Core Section */}
        <div>
          <div className="px-3.5 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Command Center
          </div>
          <div className="space-y-1">
            <NavLink to="/admin/dashboard" end className={navItemClass} onClick={onClose}>
              <LayoutDashboard size={17} />
              <span>Executive Pulse</span>
            </NavLink>
            {(isSuperAdmin || admin?.permissions?.view_analytics) && (
              <NavLink to="/admin/analytics" className={navItemClass} onClick={onClose}>
                <BarChart2 size={17} />
                <span>Deep Analytics</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Directory & Issuers Section */}
        <div>
          <div className="px-3.5 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Issuers & Registry
          </div>
          <div className="space-y-1">
            {(isSuperAdmin || admin?.permissions?.view_users) && (
              <NavLink to="/admin/users" className={navItemClass} onClick={onClose}>
                <Users size={17} />
                <span>User Management</span>
              </NavLink>
            )}

            {(isSuperAdmin || admin?.permissions?.view_companies) && (
              <NavLink to="/admin/companies" className={navItemClass} onClick={onClose}>
                <Building size={17} />
                <span>Companies</span>
              </NavLink>
            )}

            {(isSuperAdmin || admin?.permissions?.view_certificates) && (
              <NavLink to="/admin/certificates" className={navItemClass} onClick={onClose}>
                <FileText size={17} />
                <span>Certificates Registry</span>
              </NavLink>
            )}

            {(isSuperAdmin || admin?.permissions?.view_payments) && (
              <NavLink to="/admin/payments" className={navItemClass} onClick={onClose}>
                <CreditCard size={17} />
                <span>Payments & Invoices</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Communications Section */}
        <div>
          <div className="px-3.5 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Communications
          </div>
          <div className="space-y-1">
            {(isSuperAdmin || admin?.permissions?.view_messaging) && (
              <NavLink to="/admin/broadcasts" className={navItemClass} onClick={onClose}>
                <Mail size={17} />
                <span>Email Broadcasts</span>
              </NavLink>
            )}

            {(isSuperAdmin || admin?.permissions?.view_messaging) && (
              <NavLink to="/admin/messaging" className={navItemClass} onClick={onClose}>
                <MessageSquare size={17} />
                <span>Direct Messaging</span>
              </NavLink>
            )}

            {(isSuperAdmin || admin?.permissions?.view_support) && (
              <NavLink to="/admin/support" className={navItemClass} onClick={onClose}>
                <Radio size={17} />
                <span>Support Tickets</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Administration Section */}
        {isSuperAdmin && (
          <div>
            <div className="px-3.5 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Governance
            </div>
            <div className="space-y-1">
              <NavLink to="/admin/team" className={navItemClass} onClick={onClose}>
                <Shield size={17} />
                <span>Admin Team & Roles</span>
              </NavLink>
            </div>
          </div>
        )}
      </div>

      {/* --- FOOTER SECTION --- */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-semibold text-xs text-left cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
