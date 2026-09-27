import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types/auth';
import { OfficerTab, OfficerNotification } from '../../types/officer';
import { SfenLogo } from '../SfenLogo';
import { 
  Building2, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  CheckCheck, 
  FileText, 
  ArrowRightLeft, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface OfficerTopNavProps {
  user: UserProfile;
  activeTab: OfficerTab;
  onNavigate: (tab: OfficerTab) => void;
  onSignOut: () => void;
  unreadCount: number;
  notifications: OfficerNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const OfficerTopNav: React.FC<OfficerTopNavProps> = ({
  user,
  activeTab,
  onNavigate,
  onSignOut,
  unreadCount,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  isMobileMenuOpen,
  onToggleMobileMenu
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications popover on click outside
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

  const handleNotificationClick = (item: OfficerNotification) => {
    if (!item.read) {
      onMarkNotificationAsRead(item.id);
    }
    setIsNotifOpen(false);
    if (item.linkedTab === 'reports' || item.linkedTab === 'cases' || item.linkedTab === 'records') {
      onNavigate('records');
    } else if (item.linkedTab) {
      onNavigate(item.linkedTab);
    } else {
      onNavigate('records');
    }
  };

  return (
    <header 
      id="officer-topbar" 
      className={`sticky top-0 z-40 w-full border-b transition-colors ${
        isDark ? 'bg-black border-white/15 text-white' : 'bg-white border-black/15 text-black'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Hamburger + Brand & Portal Badge */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className={`p-2 rounded-md border md:hidden cursor-pointer ${
              isDark ? 'border-white/10 text-white hover:bg-slate-900' : 'border-black/10 text-black hover:bg-slate-100'
            }`}
            aria-label="Toggle officer menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-none cursor-pointer group"
          >
            <SfenLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
                  SFEN
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 border border-blue-600 text-blue-600 uppercase tracking-wider">
                  Police Official
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Police Station Intake & Docket Network
              </p>
            </div>
          </button>
        </div>

        {/* Right: Station, Theme Toggle, Notifications, Profile, and Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Configured Station Indicator */}
          <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs border ${
            isDark ? 'border-white/10 text-slate-300' : 'border-black/10 text-slate-700'
          }`}>
            <Building2 size={13} className="text-blue-600" />
            <span className="font-medium truncate max-w-[170px]">
              {user.station || 'SAPS Sandton Police Station'}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className={`p-2 border transition-colors cursor-pointer ${
              isDark 
                ? 'border-white/20 text-white hover:bg-slate-900' 
                : 'border-black/20 text-black hover:bg-slate-100'
            }`}
          >
            {isDark ? <Sun size={16} className="text-blue-500" /> : <Moon size={16} className="text-blue-600" />}
          </button>

          {/* Interactive Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              id="btn-officer-nav-notifications"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`relative p-2 border transition-all cursor-pointer ${
                isNotifOpen
                  ? 'border-blue-600 text-blue-600'
                  : isDark 
                    ? 'border-white/10 text-slate-300 hover:text-white hover:bg-slate-900' 
                    : 'border-black/10 text-slate-700 hover:text-black hover:bg-slate-100'
              }`}
              title="Station Notifications"
              aria-label="Station Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-600 rounded-full" />
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {isNotifOpen && (
              <div 
                id="officer-notifications-popover"
                className={`absolute right-0 mt-2 w-80 sm:w-96 border shadow-2xl z-50 overflow-hidden ${
                  isDark ? 'bg-black border-white/20 text-white' : 'bg-white border-black/20 text-black'
                }`}
              >
                <div className={`p-3.5 px-4 border-b flex items-center justify-between ${
                  isDark ? 'border-white/10 bg-slate-950' : 'border-black/10 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">Station Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 border border-blue-600 text-blue-600 font-semibold font-mono">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllNotificationsAsRead}
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck size={13} />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className={`max-h-80 overflow-y-auto divide-y ${isDark ? 'divide-white/10' : 'divide-black/10'}`}>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs space-y-1.5">
                      <Bell size={20} className="text-slate-400 mx-auto mb-1" />
                      <p className="font-semibold">No operational notices</p>
                      <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Dispatches and citizen report updates will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNotificationClick(item)}
                        className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                          !item.read 
                            ? (isDark ? 'bg-blue-950/20' : 'bg-blue-50/50') 
                            : (isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-50')
                        }`}
                      >
                        <div className={`mt-0.5 p-1.5 border shrink-0 ${
                          isDark ? 'border-white/10 text-blue-400' : 'border-black/10 text-blue-600'
                        }`}>
                          <FileText size={14} />
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold truncate">
                              {item.title}
                            </p>
                            {!item.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className={`text-[11px] line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {item.message}
                          </p>
                          <div className={`flex items-center justify-between text-[10px] pt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock size={10} />
                              <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
              </div>
            )}
          </div>

          {/* Officer Profile Badge */}
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className={`hidden sm:flex items-center gap-2.5 px-3 py-1.5 border transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : isDark 
                  ? 'border-white/10 text-left hover:border-white/30 text-white' 
                  : 'border-black/10 text-left hover:border-black/30 text-black'
            }`}
          >
            <div className="w-6 h-6 bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase">
              {user.fullName ? user.fullName.charAt(0) : 'O'}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold leading-tight">
                {user.fullName}
              </p>
              <p className="text-[10px] text-blue-600 font-mono">
                {user.rank || 'Officer'} • {user.personnelNumber}
              </p>
            </div>
          </button>

          {/* Sign Out Button */}
          <button
            type="button"
            id="btn-officer-logout"
            onClick={onSignOut}
            className={`flex items-center gap-2 px-3.5 py-1.5 border text-xs font-semibold transition-all cursor-pointer ${
              isDark 
                ? 'border-white/20 text-white hover:bg-white hover:text-black' 
                : 'border-black/20 text-black hover:bg-black hover:text-white'
            }`}
            title="Sign Out of Police Session"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
