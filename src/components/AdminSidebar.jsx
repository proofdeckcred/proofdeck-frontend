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
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

function AdminSidebar() {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'super_admin';

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 left-0 overflow-y-auto">
      {/* --- LOGO HEADER --- */}
      <div className="p-6 border-b border-gray-100">
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-3 no-underline"
        >
          <img
            src="/logo.png"
            alt="ProofDeck"
            className="w-10 h-10 object-contain"
          />
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            ProofDeck <span className="text-indigo-600 text-xs">Admin</span>
          </span>
        </Link>
      </div>

      {/* --- NAVIGATION LINKS --- */}
      <div className="flex-1 px-4 py-6 space-y-1">
        <NavLink to="/admin/dashboard" end className={navItemClass}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {(isSuperAdmin || admin?.permissions?.view_users) && (
            <NavLink to="/admin/users" className={navItemClass}>
            <Users size={20} />
            <span>User Management</span>
            </NavLink>
        )}

        {(isSuperAdmin || admin?.permissions?.view_companies) && (
            <NavLink to="/admin/companies" className={navItemClass}>
            <Building size={20} />
            <span>Companies</span>
            </NavLink>
        )}

        {(isSuperAdmin || admin?.permissions?.view_payments) && (
            <NavLink to="/admin/payments" className={navItemClass}>
            <CreditCard size={20} />
            <span>Payments</span>
            </NavLink>
        )}

        {(isSuperAdmin || admin?.permissions?.view_certificates) && (
            <NavLink to="/admin/certificates" className={navItemClass}>
            <FileText size={20} />
            <span>Certificates</span>
            </NavLink>
        )}

        {(isSuperAdmin || admin?.permissions?.view_analytics) && (
            <NavLink to="/admin/analytics" className={navItemClass}>
            <BarChart2 size={20} />
            <span>Analytics</span>
            </NavLink>
        )}

        {(isSuperAdmin || admin?.permissions?.view_support) && (
            <NavLink to="/admin/support" className={navItemClass}>
            <MessageSquare size={20} />
            <span>Support Tickets</span>
            </NavLink>
        )}

        {(isSuperAdmin || admin?.permissions?.view_messaging) && (
            <NavLink to="/admin/messaging" className={navItemClass}>
            <Mail size={20} />
            <span>Messaging</span>
            </NavLink>
        )}
        
        {isSuperAdmin && (
            <NavLink to="/admin/team" className={navItemClass}>
              <Shield size={20} />
              <span>Team</span>
            </NavLink>
        )}
      </div>

      {/* --- FOOTER SECTION --- */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium text-sm text-left"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
