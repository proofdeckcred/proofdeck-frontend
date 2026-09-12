import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { User, Settings, Users, HelpCircle, LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfileDropdown() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isDark, toggleTheme } = useTheme();
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
          className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm border border-indigo-700/20 dark:border-indigo-400/20 hover:ring-2 hover:ring-indigo-300 dark:hover:ring-indigo-500/50 transition-all cursor-pointer focus:outline-none"
        >
          {initial}
        </button>
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Content 
          className="min-w-[250px] bg-white dark:bg-[#121217] rounded-2xl shadow-xl border border-slate-200 dark:border-[#1F1F28] z-50 p-1.5 flex flex-col font-sans animate-in fade-in-50 zoom-in-95 duration-150 transition-colors"
          sideOffset={8}
          align="end"
        >
          {/* Header matching Bachs layout */}
          <div className="p-3 border-b border-slate-100 dark:border-[#1F1F28] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-xs">
              {initial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
                {user?.name || 'Profile'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                {user?.email || ''}
              </span>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="flex flex-col py-1">
            <button 
              onClick={() => { setIsOpen(false); navigate('/dashboard/settings'); }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#181820] rounded-lg cursor-pointer transition-colors"
            >
              <User className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>Profile</span>
            </button>

            <button 
              onClick={() => { setIsOpen(false); navigate('/dashboard/settings'); }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#181820] rounded-lg cursor-pointer transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>All Settings</span>
            </button>

            <button 
              onClick={() => { setIsOpen(false); navigate('/dashboard/settings?tab=referrals'); }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#181820] rounded-lg cursor-pointer transition-colors"
            >
              <Users className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>Referrals</span>
            </button>

            <button 
              onClick={() => { setIsOpen(false); navigate('/dashboard/support'); }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#181820] rounded-lg cursor-pointer transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span>Support</span>
            </button>

            {/* Dark Mode Animated Toggle */}
            <div 
              onClick={toggleTheme}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#181820] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {isDark ? (
                  <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isDark}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTheme();
                }}
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer focus:outline-none ${
                  isDark ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 flex items-center justify-center ${
                    isDark ? 'translate-x-4' : 'translate-x-0'
                  }`}
                >
                  {isDark ? (
                    <Moon className="w-2.5 h-2.5 text-indigo-600" />
                  ) : (
                    <Sun className="w-2.5 h-2.5 text-amber-500" />
                  )}
                </div>
              </button>
            </div>
          </div>
          
          {/* Logout Section */}
          <div className="border-t border-slate-100 dark:border-[#1F1F28] pt-1 mt-0.5">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
              <span>Log out</span>
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
