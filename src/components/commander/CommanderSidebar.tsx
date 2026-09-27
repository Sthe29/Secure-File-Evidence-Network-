import React from 'react';
import { CommanderNavTab } from '../../types/commander';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  UserCheck, 
  LogOut 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CommanderSidebarProps {
  activeTab: CommanderNavTab;
  onNavigate: (tab: CommanderNavTab) => void;
  onSignOut: () => void;
  casesCount: number;
  unassignedCasesCount: number;
  detectivesCount: number;
  pendingComplaintsCount: number;
  unreadNotificationsCount: number;
  onCloseMobileDrawer?: () => void;
}

export const CommanderSidebar: React.FC<CommanderSidebarProps> = ({
  activeTab,
  onNavigate,
  onSignOut,
  casesCount,
  unassignedCasesCount,
  onCloseMobileDrawer
}) => {
  const { isDark } = useTheme();

  const handleNavClick = (tab: CommanderNavTab) => {
    onNavigate(tab);
    if (onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const navItems: Array<{
    id: CommanderNavTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard
    },
    {
      id: 'cases',
      label: 'Station Cases',
      icon: Briefcase,
      badge: unassignedCasesCount > 0 ? `${unassignedCasesCount} unassigned` : casesCount
    },
    {
      id: 'detectives-complaints',
      label: 'Detectives & Complaints',
      icon: Users
    },
    {
      id: 'profile',
      label: 'Commander Profile',
      icon: UserCheck
    }
  ];

  return (
    <aside 
      id="commander-sidebar"
      className={`flex flex-col justify-between w-full md:w-64 py-6 pr-6 ${
        onCloseMobileDrawer ? 'border-b md:border-b-0' : 'border-r'
      } ${isDark ? 'border-white/10' : 'border-black/10'}`}
    >
      <div className="space-y-6">
        {/* Navigation Group - separated by a line */}
        <div className="space-y-1">
          <p className={`text-[10px] font-bold uppercase tracking-wider px-3 pb-2 border-b ${
            isDark ? 'text-slate-400 border-white/10' : 'text-slate-600 border-black/10'
          }`}>
            Command Navigation
          </p>

          <nav className="divide-y divide-white/5 pt-1" aria-label="Station command navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`commander-nav-${item.id}`}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer border-l-2 text-left ${
                    isActive
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : isDark
                        ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-900/40'
                        : 'border-transparent text-slate-700 hover:text-black hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      size={16} 
                      className={isActive ? 'text-blue-600' : isDark ? 'text-slate-400' : 'text-slate-500'} 
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${
                      isActive 
                        ? 'border-blue-600 text-blue-600' 
                        : isDark
                          ? 'border-white/20 text-slate-300'
                          : 'border-black/20 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Logout button at bottom */}
      <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <button
          type="button"
          id="commander-sidebar-logout"
          onClick={onSignOut}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium border transition-colors cursor-pointer ${
            isDark 
              ? 'border-white/10 text-slate-300 hover:bg-slate-900 hover:text-white' 
              : 'border-black/10 text-slate-700 hover:bg-slate-100 hover:text-black'
          }`}
        >
          <div className="flex items-center gap-2">
            <LogOut size={14} className="text-blue-600" />
            <span>Sign Out</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">End Session</span>
        </button>
      </div>
    </aside>
  );
};
