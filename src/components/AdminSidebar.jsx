import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building,
  CreditCard,
  FileText,
  BarChart2,
  Mail,
  Shield,
  X,
  Radio,
  LogOut,
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
    `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 text-xs font-medium ${
      isActive
        ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <aside className="w-60 bg-white border-r border-gray-200/80 flex flex-col h-screen sticky top-0 left-0 overflow-y-auto select-none">
      {/* --- LOGO HEADER --- */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <Link
          to="/admin/dashboard"
          onClick={onClose}
          className="flex items-center gap-2 no-underline"
        >
          <img
            src="/logo.png"
            alt="ProofDeck"
            className="w-7 h-7 object-contain shrink-0"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-gray-900 tracking-tight">
              ProofDeck
            </span>
            <span className="text-[10px] font-bold text-[#5B4CF5] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
              Admin
            </span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 md:hidden rounded-lg hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* --- NAVIGATION LINKS --- */}
      <div className="flex-1 px-3 py-3 space-y-0.5">
        <NavLink to="/admin/dashboard" end className={navItemClass} onClick={onClose}>
          <LayoutDashboard size={18} />
          <span>Executive Pulse</span>
        </NavLink>

        {(isSuperAdmin || admin?.permissions?.view_analytics) && (
          <NavLink to="/admin/analytics" className={navItemClass} onClick={onClose}>
            <BarChart2 size={18} />
            <span>Deep Analytics</span>
          </NavLink>
        )}

        {/* Directory & Records Section */}
        <div className="pt-3 pb-1">
          <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0">
            Issuers & Registry
          </p>
        </div>

        {(isSuperAdmin || admin?.permissions?.view_users) && (
          <NavLink to="/admin/users" className={navItemClass} onClick={onClose}>
            <Users size={18} />
            <span>User Management</span>
          </NavLink>
        )}

        {(isSuperAdmin || admin?.permissions?.view_companies) && (
          <NavLink to="/admin/companies" className={navItemClass} onClick={onClose}>
            <Building size={18} />
            <span>Companies</span>
          </NavLink>
        )}

        {(isSuperAdmin || admin?.permissions?.view_certificates) && (
          <NavLink to="/admin/certificates" className={navItemClass} onClick={onClose}>
            <FileText size={18} />
            <span>Certificates Registry</span>
          </NavLink>
        )}

        {(isSuperAdmin || admin?.permissions?.view_payments) && (
          <NavLink to="/admin/payments" className={navItemClass} onClick={onClose}>
            <CreditCard size={18} />
            <span>Payments & Billing</span>
          </NavLink>
        )}

        {/* Communications Section */}
        <div className="pt-3 pb-1">
          <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0">
            Communications
          </p>
        </div>

        {(isSuperAdmin || admin?.permissions?.view_messaging) && (
          <NavLink to="/admin/broadcasts" className={navItemClass} onClick={onClose}>
            <Mail size={18} />
            <span>Email Broadcasts</span>
          </NavLink>
        )}

        {(isSuperAdmin || admin?.permissions?.view_support) && (
          <NavLink to="/admin/support" className={navItemClass} onClick={onClose}>
            <Radio size={18} />
            <span>Support Tickets</span>
          </NavLink>
        )}

        {/* Governance Section */}
        {isSuperAdmin && (
          <>
            <div className="pt-3 pb-1">
              <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0">
                Governance
              </p>
            </div>
            <NavLink to="/admin/team" className={navItemClass} onClick={onClose}>
              <Shield size={18} />
              <span>Admin Team</span>
            </NavLink>
          </>
        )}
      </div>

      {/* --- FOOTER SECTION --- */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium text-xs text-left cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
