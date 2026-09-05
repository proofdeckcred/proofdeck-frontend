import React from 'react';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';

export default function DashboardTopbar() {
  return (
    <header className="flex bg-white border-b border-slate-200/80 px-4 sm:px-6 md:px-8 py-2.5 items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Mobile Branding (Sidebar is hidden on mobile) */}
      <div className="flex items-center gap-2 md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 no-underline">
          <img src="/logo.png" alt="ProofDeck" className="w-7 h-7 object-contain" />
          <span className="text-sm font-bold text-slate-900 tracking-tight">ProofDeck</span>
        </Link>
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
