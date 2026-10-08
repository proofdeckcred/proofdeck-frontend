import React from 'react';
import { Link } from 'react-router-dom';
import { PanelLeft, Menu, Sun, Moon } from 'lucide-react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';
import { useTheme } from '../context/ThemeContext';

export default function DashboardTopbar({ isCollapsed, toggleSidebar, toggleMobileSidebar }) {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };
  return (
    <header className="flex bg-white border-b border-slate-200/80 px-4 sm:px-6 md:px-8 py-2.5 items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Mobile Left: Drawer Toggle + Branding */}
      <div className="flex items-center gap-2 md:hidden">
        {toggleMobileSidebar && (
          <button
            onClick={toggleMobileSidebar}
            className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center focus:outline-none"
            aria-label="Open mobile navigation"
          >
            <Menu size={20} />
          </button>
        )}
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

      {/* Action items: Theme Toggle + Notifications + User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <OverlayTrigger
          placement="bottom"
          delay={{ show: 150, hide: 50 }}
          popperConfig={{ strategy: "fixed" }}
          overlay={
            <Tooltip id="theme-toggle-tip">
              {resolvedTheme === 'dark' ? "Switch to Light mode" : "Switch to Dark mode"}
            </Tooltip>
          }
        >
          <button
            onClick={toggleTheme}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center focus:outline-none"
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun size={18} className="text-amber-400 hover:text-amber-300 transition-colors" />
            ) : (
              <Moon size={18} className="text-slate-600 hover:text-slate-900 transition-colors" />
            )}
          </button>
        </OverlayTrigger>
        <NotificationBell />
        <ProfileDropdown />
      </div>
    </header>
  );
}
