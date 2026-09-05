import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { User, Settings, Users, HelpCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function ProfileDropdown() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('workspaceContext');
    navigate('/login');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          aria-label="User Profile"
          className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm border border-indigo-700/20 hover:ring-2 hover:ring-indigo-300 transition-all cursor-pointer focus:outline-none"
        >
          {initial}
        </button>
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Content 
          className="min-w-[250px] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-1.5 flex flex-col font-sans animate-in fade-in-50 zoom-in-95 duration-150"
          sideOffset={8}
          align="end"
        >
          {/* Header matching Bachs layout */}
          <div className="p-3 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-xs">
              {initial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 truncate leading-tight">
                {user?.name || 'Profile'}
              </span>
              <span className="text-xs text-slate-500 truncate leading-tight mt-0.5">
                {user?.email || ''}
              </span>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="flex flex-col py-1">
            <button 
              onClick={() => { setIsOpen(false); navigate('/dashboard/settings'); }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              <User className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Profile</span>
            </button>

            <button 
              onClick={() => { setIsOpen(false); navigate('/dashboard/settings'); }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500 shrink-0" />
              <span>All Settings</span>
            </button>

            <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 select-none">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Referrals</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                Soon
              </span>
            </div>

            <button 
              onClick={() => { setIsOpen(false); navigate('/dashboard/support'); }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Support</span>
            </button>
          </div>
          
          {/* Logout Section */}
          <div className="border-t border-slate-100 pt-1 mt-0.5">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-500 shrink-0" />
              <span>Log out</span>
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
