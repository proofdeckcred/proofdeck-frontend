// frontend/src/components/Sidebar.jsx

import React, { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Mail,
} from "lucide-react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

function Sidebar() {
  const navigate = useNavigate();
  const { user, workspace, switchWorkspace } = useUser();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved !== null ? JSON.parse(saved) : true; // collapsible by default
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", JSON.stringify(next));
      return next;
    });
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("workspaceContext");
    navigate("/login");
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Upgrade to a paid plan to unlock insights!
    </Tooltip>
  );

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2.5 py-2 rounded-lg transition-all duration-200 font-medium text-xs ${
      isCollapsed ? "justify-center px-0 w-9 h-9 mx-auto" : "px-3"
    } ${
      isActive
        ? "bg-indigo-50 text-indigo-700 font-semibold"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  const renderNavLink = (to, icon, label, end = false) => {
    const linkContent = (
      <NavLink to={to} end={end} className={navItemClass}>
        {React.cloneElement(icon, { size: 18 })}
        {!isCollapsed && <span>{label}</span>}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <OverlayTrigger
          placement="right"
          overlay={<Tooltip id={`tooltip-${label}`}>{label}</Tooltip>}
        >
          {linkContent}
        </OverlayTrigger>
      );
    }

    return linkContent;
  };

  return (
    <aside
      className={`relative bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 left-0 transition-all duration-300 z-40 ${
        isCollapsed ? "w-16" : "w-60"
      }`}
    >
      {/* --- COLLAPSE TOGGLE --- */}
      <button
        onClick={toggleSidebar}
        className="absolute top-5 -right-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all z-50 cursor-pointer"
      >
        {isCollapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
      </button>

      {/* --- LOGO HEADER --- */}
      <div
        className={`border-b border-gray-100 flex items-center ${
          isCollapsed ? "p-3 justify-center" : "p-4 justify-between"
        }`}
      >
        <Link to="/dashboard" className="flex items-center gap-2 no-underline">
          <img
            src="/logo.png"
            alt="ProofDeck"
            className="w-8 h-8 object-contain shrink-0"
          />
          {!isCollapsed && (
            <span className="text-base font-bold text-gray-900 tracking-tight">
              ProofDeck
            </span>
          )}
        </Link>
      </div>

      {/* --- WORKSPACE SWITCHER --- */}
      {user && user.workspaces && user.workspaces.length > 0 && (
        <div className={`px-3 py-2 border-b border-gray-100 ${isCollapsed ? "flex justify-center" : ""}`}>
          {isCollapsed ? (
            <button
              onClick={() => {
                if (workspace === "personal") {
                  switchWorkspace(String(user.workspaces[0].id));
                } else {
                  switchWorkspace("personal");
                }
              }}
              className="w-10 h-10 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center transition-colors cursor-pointer border-0 font-bold"
              title={workspace === "personal" ? "Switch to Organization Workspace" : "Switch to Personal Workspace"}
            >
              {workspace === "personal" ? "P" : (user.company?.name?.charAt(0).toUpperCase() || "O")}
            </button>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Workspace</span>
              <select
                value={workspace}
                onChange={(e) => switchWorkspace(e.target.value)}
                className="w-full bg-white border border-slate-200 text-gray-700 font-semibold text-[11px] py-1.5 px-2 rounded-md focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer border-solid"
              >
                <option value="personal">Personal Workspace</option>
                {user.workspaces.map((ws) => (
                  <option key={ws.id} value={String(ws.id)}>
                    {ws.name} ({ws.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* --- NAVIGATION LINKS --- */}
      <div className={`flex-1 py-4 space-y-1 ${isCollapsed ? "px-1" : "px-3"}`}>
        {renderNavLink("/dashboard", <LayoutDashboard />, "My Certificates", true)}
        {renderNavLink("/dashboard/groups", <FolderOpen />, "Groups")}
        {renderNavLink("/dashboard/templates", <FileBadge />, "Templates")}

        {!isCollapsed ? (
          <div className="pt-3 pb-1">
            <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Actions
            </p>
          </div>
        ) : (
          <div className="border-t border-gray-100 my-3 mx-2" />
        )}

        {renderNavLink("/dashboard/create", <PlusCircle />, "Issue Credentials")}
        {renderNavLink("/dashboard/send-invitation", <Mail />, "Send Invitations")}

        {user &&
          (user.role?.toLowerCase() === "free" ? (
            <OverlayTrigger
              placement="right"
              delay={{ show: 250, hide: 400 }}
              overlay={renderTooltip}
            >
              <div
                className={`flex items-center gap-2.5 py-2 rounded-lg text-gray-400 cursor-not-allowed ${
                  isCollapsed ? "justify-center px-0 w-9 h-9 mx-auto" : "px-3"
                }`}
              >
                <BarChart2 size={18} />
                {!isCollapsed && (
                  <>
                    <span className="text-xs">Analytics</span>
                    <span className="ml-auto bg-green-50 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                      Upgrade
                    </span>
                  </>
                )}
              </div>
            </OverlayTrigger>
          ) : (
            renderNavLink("/dashboard/analytics", <BarChart2 />, "Analytics")
          ))}
      </div>

      {/* --- FOOTER SECTION --- */}
      <div className={`border-t border-gray-100 bg-gray-50/40 ${isCollapsed ? "p-1" : "p-3"}`}>
        <div className="space-y-0.5">
          {renderNavLink("/dashboard/settings", <Settings />, "Settings")}
          {renderNavLink("/dashboard/support", <HelpCircle />, "Support")}

          {/* Logout Button */}
          {(() => {
            const logoutBtn = (
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-2.5 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium text-xs text-left cursor-pointer ${
                  isCollapsed ? "justify-center px-0 w-9 h-9 mx-auto" : "px-3 mt-1"
                }`}
              >
                <LogOut size={18} />
                {!isCollapsed && <span>Logout</span>}
              </button>
            );

            return isCollapsed ? (
              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="tooltip-logout">Logout</Tooltip>}
              >
                {logoutBtn}
              </OverlayTrigger>
            ) : (
              logoutBtn
            );
          })()}
        </div>

        {/* User Mini Profile */}
        {user &&
          (() => {
            const profileSection = (
              <div
                className={`pt-3 border-t border-gray-200 flex items-center gap-2 ${
                  isCollapsed ? "justify-center px-0 mt-2" : "px-1 mt-3"
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                  {user.name.charAt(0)}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate capitalize">
                      {user.role} Plan
                    </p>
                  </div>
                )}
                {!isCollapsed && user.role !== "free" && (
                  <Crown
                    size={14}
                    className="text-yellow-500 shrink-0"
                    fill="currentColor"
                  />
                )}
              </div>
            );

            return isCollapsed ? (
              <OverlayTrigger
                placement="right"
                overlay={
                  <Tooltip id="tooltip-profile">
                    {user.name} ({user.role} Plan)
                  </Tooltip>
                }
              >
                {profileSection}
              </OverlayTrigger>
            ) : (
              profileSection
            );
          })()}
      </div>
    </aside>
  );
}

export default Sidebar;

