import React from 'react';
import { Link } from 'react-router-dom';
import { PanelLeft } from 'lucide-react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';

export default function DashboardTopbar({ isCollapsed, toggleSidebar }) {
  return (
    <header className="flex bg-white border-b border-slate-200/80 px-4 sm:px-6 md:px-8 py-2.5 items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Mobile Branding (Sidebar is hidden on mobile) */}
      <div className="flex items-center gap-2 md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 no-underline">
          <img src="/logo.png" alt="ProofDeck" className="w-7 h-7 object-contain" />
          <span className="text-sm font-bold text-slate-900 tracking-tight">ProofDeck</span>
        </Link>
      </div>

      {/* Desktop Left: Sidebar Open/Close Toggle (Bachs Style) */}
      <div className="hidden md:flex items-center gap-2">
        <OverlayTrigger
          placement="bottom"
          delay={{ show: 150, hide: 50 }}
          popperConfig={{ strategy: "fixed" }}
          overlay={
            <Tooltip id="sidebar-toggle-tip">
              {isCollapsed ? "Open sidebar" : "Close sidebar"}
            </Tooltip>
          }
        >
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center border border-transparent hover:border-slate-200 focus:outline-none"
            aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
          >
            <PanelLeft size={18} className="text-slate-600 hover:text-slate-900 transition-colors" />
          </button>
        </OverlayTrigger>
      </div>

      {/* Desktop spacer */}
      <div className="hidden md:flex flex-1"></div>

      {/* Action items: Notifications + User Profile */}
      <div className="flex items-center gap-3">
        <NotificationBell />
        <ProfileDropdown />
      </div>
    </header>
  );
}
