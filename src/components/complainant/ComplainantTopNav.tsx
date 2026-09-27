import React, { useState, useRef, useEffect } from 'react';
import { SfenLogo } from '../SfenLogo';
import { CitizenProfile } from '../../types/auth';
import { ComplainantTab, ComplainantNotification } from '../../types/complainant';
import { markAllNotificationsAsRead, markNotificationAsRead } from '../../services/complainantService';
import { 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  Briefcase, 
  FileText, 
  AlertCircle, 
  CheckCheck,
  ChevronRight,
  Clock,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ComplainantTopNavProps {
  citizen: CitizenProfile;
  activeTab: ComplainantTab;
  onSelectTab: (tab: ComplainantTab) => void;
  unreadCount: number;
  notifications?: ComplainantNotification[];
  onRefreshNotifications?: () => void;
  onSignOut: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const ComplainantTopNav: React.FC<ComplainantTopNavProps> = ({
  citizen,
  activeTab,
  onSelectTab,
  unreadCount,
  notifications = [],
  onRefreshNotifications,
  onSignOut,
  mobileMenuOpen,
  onToggleMobileMenu
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(citizen.id);
    if (onRefreshNotifications) {
      onRefreshNotifications();
    }
  };

  const handleNotificationClick = (item: ComplainantNotification) => {
    markNotificationAsRead(item.id);
    if (onRefreshNotifications) {
      onRefreshNotifications();
    }
    setIsNotifOpen(false);

    if (item.linkedTab) {
      onSelectTab(item.linkedTab);
    } else if (item.type === 'case') {
      onSelectTab('my-cases');
    } else if (item.type === 'report') {
      onSelectTab('my-reports');
    } else if (item.type === 'complaint') {
      onSelectTab('complaints');
    } else {
      onSelectTab('my-records');
    }
  };

  return (
    <header 
      id="complainant-top-navbar"
      className={`sticky top-0 z-40 w-full border-b transition-colors ${
        isDark ? 'bg-black border-white/15 text-white' : 'bg-white border-black/15 text-black'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-none cursor-pointer group"
          >
            <SfenLogo size="sm" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
                  SFEN
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-blue-600 text-white">
                  Citizen Portal
                </span>
              </div>
              <p className={`text-[11px] leading-none ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Secure File and Evidence Network
              </p>
            </div>
          </button>
        </div>

        {/* Right: Theme Toggle, Notifications, User info, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className={`p-2 rounded-md border transition-colors flex items-center gap-1.5 text-xs cursor-pointer ${
              isDark 
                ? 'bg-black border-white/20 text-white hover:bg-slate-900' 
                : 'bg-white border-black/20 text-black hover:bg-slate-100'
            }`}
          >
            {isDark ? <Sun size={15} className="text-blue-500" /> : <Moon size={15} className="text-blue-600" />}
            <span className="hidden lg:inline text-[11px] font-mono">{isDark ? 'Light' : 'Dark'}</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              id="btn-nav-notifications"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`relative p-2 rounded-md border transition-colors cursor-pointer ${
                isNotifOpen
                  ? 'border-blue-600 text-blue-600 bg-blue-600/10'
                  : isDark 
                    ? 'border-white/10 text-slate-300 hover:text-white' 
                    : 'border-black/10 text-slate-700 hover:text-black'
              }`}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-sm bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {isNotifOpen && (
              <div 
                id="notifications-popover"
                className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-md border shadow-xl z-50 overflow-hidden ${
                  isDark ? 'bg-black border-white/20 text-white' : 'bg-white border-black/20 text-black'
                }`}
              >
                {/* Header */}
                <div className={`p-3 border-b flex items-center justify-between ${
                  isDark ? 'border-white/10 bg-slate-950' : 'border-black/10 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-600 text-white font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck size={13} />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs space-y-1.5">
                      <Bell size={20} className="text-slate-500 mx-auto mb-1" />
                      <p className="font-semibold">No notifications</p>
                      <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Updates on case dockets and report reviews will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNotificationClick(item)}
                        className={`w-full text-left p-3.5 hover:bg-blue-600/5 transition-colors flex items-start gap-3 cursor-pointer ${
                          !item.read ? (isDark ? 'bg-slate-900/50' : 'bg-slate-50') : ''
                        }`}
                      >
                        <div className="mt-0.5 p-1.5 rounded-sm border border-blue-600/30 text-blue-600 shrink-0">
                          {item.type === 'case' ? <Briefcase size={14} /> : item.type === 'report' ? <FileText size={14} /> : <AlertCircle size={14} />}
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold truncate">
                              {item.title}
                            </p>
                            {!item.read && (
                              <span className="w-1.5 h-1.5 rounded-sm bg-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className={`text-[11px] line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {item.message}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock size={10} />
                              <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                            </span>
                            <span className="text-blue-600 hover:underline flex items-center gap-0.5">
                              <span>View</span>
                              <ChevronRight size={10} />
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Footer link to Records */}
                <div className={`p-2.5 border-t text-center ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotifOpen(false);
                      onSelectTab('my-records');
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    View all cases and reports
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <button
            type="button"
            id="btn-nav-profile-pill"
            onClick={() => onSelectTab('profile')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : isDark 
                  ? 'border-white/10 text-slate-300 hover:text-white' 
                  : 'border-black/10 text-slate-700 hover:text-black'
            }`}
          >
            <div className="w-6 h-6 rounded-sm bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase">
              {citizen.fullName ? citizen.fullName.charAt(0) : 'U'}
            </div>
            <span className="text-xs font-semibold hidden md:inline truncate max-w-[120px]">
              {citizen.fullName || 'Citizen User'}
            </span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            id="btn-nav-logout"
            onClick={onSignOut}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
              isDark 
                ? 'border-white/20 text-slate-300 hover:text-white hover:border-white' 
                : 'border-black/20 text-slate-700 hover:text-black hover:border-black'
            }`}
            title="Sign out of SFEN"
          >
            <LogOut size={14} />
            <span className="hidden xs:inline">Sign Out</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            id="btn-mobile-menu-toggle"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-md border border-slate-700 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>
    </header>
  );
};
