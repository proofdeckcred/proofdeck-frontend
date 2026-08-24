// frontend/src/components/Sidebar.jsx

import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  LayoutDashboard,
  FolderOpen,
  FileBadge,
  PlusCircle,
  UploadCloud,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  Crown,
} from "lucide-react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

function Sidebar() {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Upgrade to a paid plan to unlock insights!
    </Tooltip>
  );

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
        <Link to="/dashboard" className="flex items-center gap-3 no-underline">
          <img
            src="/logo.png"
            alt="ProofDeck"
            className="w-10 h-10 object-contain"
          />
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            ProofDeck
          </span>
        </Link>
      </div>

      {/* --- NAVIGATION LINKS --- */}
      <div className="flex-1 px-4 py-6 space-y-1">
        {/* ... links ... */}
        <NavLink to="/dashboard" end className={navItemClass}>
          <LayoutDashboard size={20} />
          <span>My Certificates</span>
        </NavLink>
        {/* ... */}
        
        <NavLink to="/dashboard/groups" className={navItemClass}>
          <FolderOpen size={20} />
          <span>Groups</span>
        </NavLink>

        <NavLink to="/dashboard/templates" className={navItemClass}>
          <FileBadge size={20} />
          <span>Templates</span>
        </NavLink>


        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Actions
          </p>
        </div>

        <NavLink to="/dashboard/create" className={navItemClass}>
          <PlusCircle size={20} />
          <span>Create Single</span>
        </NavLink>

        <NavLink to="/dashboard/bulk-create" className={navItemClass}>
          <UploadCloud size={20} />
          <span>Bulk Create</span>
        </NavLink>

        {user &&
          (user.role?.toLowerCase() === "free" ? (
            <OverlayTrigger
              placement="right"
              delay={{ show: 250, hide: 400 }}
              overlay={renderTooltip}
            >
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed`}
              >
                <BarChart2 size={20} />
                <span>Analytics</span>
                <span className="ml-auto bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Upgrade
                </span>
              </div>
            </OverlayTrigger>
          ) : (
            <NavLink to="/dashboard/analytics" className={navItemClass}>
              <BarChart2 size={20} />
              <span>Analytics</span>
            </NavLink>
          ))}
      </div>

      {/* --- FOOTER SECTION --- */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="space-y-1">
          <NavLink to="/dashboard/settings" className={navItemClass}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>

          <NavLink to="/dashboard/support" className={navItemClass}>
            <HelpCircle size={20} />
            <span>Support</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium text-sm text-left mt-2"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>

        {/* User Mini Profile */}
        {user && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {user.role} Plan
              </p>
            </div>
            {user.role !== "free" && (
              <Crown
                size={16}
                className="text-yellow-500"
                fill="currentColor"
              />
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
