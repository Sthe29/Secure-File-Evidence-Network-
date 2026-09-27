import React from 'react';
import { ComplainantTab } from '../../types/complainant';
import { 
  LayoutDashboard, 
  FilePlus2, 
  Briefcase, 
  UserCheck, 
  PhoneCall,
  Info,
  Scale
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ComplainantSidebarProps {
  activeTab: ComplainantTab;
  onSelectTab: (tab: ComplainantTab) => void;
  reportCount: number;
  caseCount: number;
  complaintCount: number;
  unreadNotifications: number;
  onSignOut: () => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const ComplainantSidebar: React.FC<ComplainantSidebarProps> = ({
  activeTab,
  onSelectTab,
  reportCount,
  caseCount,
  complaintCount,
  isMobileDrawer = false,
  onCloseMobileDrawer
}) => {
  const { isDark } = useTheme();

  const handleNav = (tab: ComplainantTab) => {
    onSelectTab(tab);
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const totalRecordsCount = reportCount + caseCount + complaintCount;

  const navItems: Array<{
    id: ComplainantTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    isActiveMatch?: (current: ComplainantTab) => boolean;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      isActiveMatch: (cur) => cur === 'dashboard'
    },
    {
      id: 'report-incident',
      label: 'Report Incident',
      icon: FilePlus2,
      isActiveMatch: (cur) => cur === 'report-incident'
    },
    {
      id: 'my-records',
      label: 'Cases & Records',
      icon: Briefcase,
      badge: totalRecordsCount,
      isActiveMatch: (cur) => cur === 'my-records' || cur === 'my-cases' || cur === 'my-reports' || cur === 'complaints'
    },
    {
      id: 'profile',
      label: 'Citizen Profile',
      icon: UserCheck,
      isActiveMatch: (cur) => cur === 'profile'
    }
  ];

  return (
    <aside 
      id={isMobileDrawer ? 'complainant-mobile-drawer' : 'complainant-desktop-sidebar'}
      className={`flex flex-col justify-between ${
        isMobileDrawer ? 'w-full py-2' : 'w-64 py-6 pr-6 border-r'
      } ${isDark ? 'border-white/10' : 'border-black/10'}`}
    >
      <div className="space-y-6">
        
        {/* Navigation Group - separated by a line */}
        <div className="space-y-1">
          <p className={`text-[10px] font-bold uppercase tracking-wider px-3 pb-2 border-b ${
            isDark ? 'text-slate-400 border-white/10' : 'text-slate-600 border-black/10'
          }`}>
            Navigation
          </p>

          <nav className="divide-y divide-white/5 pt-1" aria-label="Complainant navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.isActiveMatch ? item.isActiveMatch(activeTab) : activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-3 text-xs font-semibold transition-colors cursor-pointer border-l-2 ${
                    isActive
                      ? 'border-blue-600 text-blue-600 bg-blue-600/5'
                      : isDark
                        ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-900'
                        : 'border-transparent text-slate-700 hover:text-black hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-600 text-white font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Essential Information Section - clean separated lines */}
        <div className={`pt-4 border-t space-y-3 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <div className="flex items-center gap-2 px-1 text-xs font-bold text-blue-600">
            <Info size={14} />
            <span>Process Steps</span>
          </div>
          
          <div className="space-y-2 text-xs px-1 leading-relaxed">
            <div className="border-b pb-2 border-white/5">
              <span className="font-bold">1. File Report:</span> Submit details for preliminary reference number.
            </div>
            <div className="border-b pb-2 border-white/5">
              <span className="font-bold">2. Station Review:</span> Frontline CSC officer verifies statements.
            </div>
            <div>
              <span className="font-bold">3. CAS Docket:</span> Official CAS number and investigating detective assigned.
            </div>
          </div>
        </div>

        {/* Emergency Assistance - Clean line separated */}
        <div className={`pt-4 border-t space-y-2 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
            <PhoneCall size={14} />
            <span>Emergency Police Contacts</span>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Flying Squad:</span>
              <span className="font-mono font-bold text-blue-600">10111</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Crime Stop:</span>
              <span className="font-mono font-bold text-blue-600">08600 10111</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer System Info */}
      <div className={`pt-4 border-t text-[11px] ${isDark ? 'border-white/10 text-slate-500' : 'border-black/10 text-slate-500'}`}>
        <div className="flex items-center gap-1.5 font-semibold">
          <Scale size={12} className="text-blue-600" />
          <span>SAPS Official Case System</span>
        </div>
        <p className="text-[10px] mt-0.5">Republic of South Africa</p>
      </div>
    </aside>
  );
};
