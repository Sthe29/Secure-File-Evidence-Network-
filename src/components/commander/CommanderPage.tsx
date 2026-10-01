import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types/auth';
import { DetectiveCaseDocket, SupervisorInstruction } from '../../types/detective';
import { 
  CommanderNavTab, 
  CommanderCaseTab, 
  StationComplaintRecord, 
  CommanderNotification,
  CommanderDetectiveWorkload 
} from '../../types/commander';
import { commanderService, AUTHORISED_STATION_DETECTIVES } from '../../services/commanderService';
import { CommanderTopNav } from './CommanderTopNav';
import { CommanderSidebar } from './CommanderSidebar';
import { CommanderDashboardView } from './CommanderDashboardView';
import { CommanderCasesView } from './CommanderCasesView';
import { CommanderDetectivesView } from './CommanderDetectivesView';
import { CommanderComplaintsView } from './CommanderComplaintsView';
import { CommanderDetectivesAndComplaintsView } from './CommanderDetectivesAndComplaintsView';
import { CommanderNotificationsView } from './CommanderNotificationsView';
import { CommanderProfileView } from './CommanderProfileView';
import { CommanderCaseWorkspaceModal } from './CommanderCaseWorkspaceModal';
import { CommanderAssignDetectiveModal } from './CommanderAssignDetectiveModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CommanderPageProps {
  user: UserProfile;
  onSignOut: () => void;
}

export const CommanderPage: React.FC<CommanderPageProps> = ({
  user,
  onSignOut
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<CommanderNavTab>('dashboard');
  const [casesFilter, setCasesFilter] = useState<string>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data states
  const [cases, setCases] = useState<DetectiveCaseDocket[]>([]);
  const [instructions, setInstructions] = useState<SupervisorInstruction[]>([]);
  const [complaints, setComplaints] = useState<StationComplaintRecord[]>([]);
  const [notifications, setNotifications] = useState<CommanderNotification[]>([]);
  const [detectivesWorkload, setDetectivesWorkload] = useState<CommanderDetectiveWorkload[]>([]);

  // Modals
  const [activeWorkspaceCase, setActiveWorkspaceCase] = useState<DetectiveCaseDocket | null>(null);
  const [workspaceInitialTab, setWorkspaceInitialTab] = useState<CommanderCaseTab>('overview');
  const [activeAssignCase, setActiveAssignCase] = useState<DetectiveCaseDocket | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshAllData = (syncWorkspaceCase = true) => {
    const freshCases = commanderService.getSupervisedCases();
    const freshInstructions = commanderService.getAllInstructions();
    const freshComplaints = commanderService.getStationComplaints();
    const freshNotifs = commanderService.getCommanderNotifications();
    const freshWorkload = commanderService.getDetectivesWorkload();

    setCases(freshCases);
    setInstructions(freshInstructions);
    setComplaints(freshComplaints);
    setNotifications(freshNotifs);
    setDetectivesWorkload(freshWorkload);

    if (syncWorkspaceCase && activeWorkspaceCase) {
      const refreshed = freshCases.find(c => c.caseNumber === activeWorkspaceCase.caseNumber);
      if (refreshed) {
        setActiveWorkspaceCase(refreshed);
      }
    }
  };

  useEffect(() => {
    refreshAllData(false);
  }, []);

  // Handlers for modal opening
  const handleOpenCaseWorkspace = (caseDocket: DetectiveCaseDocket, initialTab: CommanderCaseTab = 'overview') => {
    setActiveWorkspaceCase(caseDocket);
    setWorkspaceInitialTab(initialTab);
  };

  const handleOpenAssignModal = (caseDocket: DetectiveCaseDocket) => {
    setActiveAssignCase(caseDocket);
  };

  const handleConfirmAssignment = (params: {
    caseNumber: string;
    detectivePersonnelNumber: string;
    assignmentNotes?: string;
  }) => {
    const res = commanderService.assignDetectiveToCase({
      ...params,
      commander: user
    });
    if (res.success) {
      showToast(res.message, 'success');
      setActiveAssignCase(null);
      refreshAllData(true);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleOpenCaseByNumber = (caseNumber: string) => {
    const found = cases.find(c => c.caseNumber === caseNumber);
    if (found) {
      handleOpenCaseWorkspace(found, 'overview');
    } else {
      setActiveTab('cases');
      setCasesFilter('all');
    }
  };

  const handleOpenComplaintById = (complaintId: string) => {
    setActiveTab('complaints');
  };

  const unassignedCount = cases.filter(
    c => !c.investigatingOfficerPersonnelNumber || c.investigatingOfficerName === 'Unassigned'
  ).length;

  const pendingComplaintsCount = complaints.filter(
    c => c.status === 'Under Investigation' || c.status === 'Pending Review'
  ).length;

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <div 
      id="commander-portal" 
      className={`sfen-shell sfen-staff-shell min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      
      {/* Top Navigation */}
      <CommanderTopNav
        user={user}
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          if (tab === 'cases') setCasesFilter('all');
        }}
        onSignOut={onSignOut}
        unreadCount={unreadNotifCount}
        notifications={notifications}
        onMarkNotificationAsRead={(id) => {
          commanderService.markNotificationRead(id);
          refreshAllData(false);
        }}
        onMarkAllNotificationsAsRead={() => {
          commanderService.markAllNotificationsRead();
          refreshAllData(false);
        }}
        onOpenCaseByNumber={handleOpenCaseByNumber}
        onOpenComplaint={handleOpenComplaintById}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div 
          className={`md:hidden fixed inset-x-0 top-16 z-30 border-b p-4 shadow-xl ${
            isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
          }`}
        >
          <CommanderSidebar
            activeTab={activeTab}
            onNavigate={(tab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
              if (tab === 'cases') setCasesFilter('all');
            }}
            onSignOut={onSignOut}
            casesCount={cases.length}
            unassignedCasesCount={unassignedCount}
            detectivesCount={AUTHORISED_STATION_DETECTIVES.length}
            pendingComplaintsCount={pendingComplaintsCount}
            unreadNotificationsCount={unreadNotifCount}
            onCloseMobileDrawer={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Body Container with Sidebar and Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex">
        
        {/* Desktop Sidebar (Left) */}
        <div className="hidden md:block shrink-0">
          <div className="sticky top-20">
            <CommanderSidebar
              activeTab={activeTab}
              onNavigate={(tab) => {
                setActiveTab(tab);
                if (tab === 'cases') setCasesFilter('all');
              }}
              onSignOut={onSignOut}
              casesCount={cases.length}
              unassignedCasesCount={unassignedCount}
              detectivesCount={AUTHORISED_STATION_DETECTIVES.length}
              pendingComplaintsCount={pendingComplaintsCount}
              unreadNotificationsCount={unreadNotifCount}
            />
          </div>
        </div>

        {/* Scrollable View Content (Right) */}
        <main className={`sfen-content flex-1 min-w-0 py-6 sm:py-8 md:pl-8 ${activeTab === 'dashboard' ? 'sfen-dashboard' : ''}`}>
          
          {/* Global Toast */}
          {toastMessage && (
            <div className={`mb-4 p-3 rounded-md border text-xs font-semibold flex items-center gap-2 ${
              toastMessage.type === 'success'
                ? 'bg-blue-600/10 border-blue-600 text-blue-600'
                : 'bg-black border-white/20 text-white'
            }`}>
              <CheckCircle2 size={16} className="text-blue-600" />
              <span>{toastMessage.text}</span>
            </div>
          )}

          {/* VIEW: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <CommanderDashboardView
              commander={user}
              cases={cases}
              instructions={instructions}
              complaints={complaints}
              onOpenCase={handleOpenCaseWorkspace}
              onNavigateToCases={(filter) => {
                setActiveTab('cases');
                if (filter) setCasesFilter(filter);
              }}
              onNavigateToDetectives={() => setActiveTab('detectives')}
              onNavigateToComplaints={() => setActiveTab('complaints')}
              onOpenAssignModal={handleOpenAssignModal}
            />
          )}

          {/* VIEW: CASES & INSPECTION */}
          {activeTab === 'cases' && (
            <CommanderCasesView
              cases={cases}
              initialFilter={casesFilter}
              onOpenCase={handleOpenCaseWorkspace}
              onOpenAssignModal={handleOpenAssignModal}
            />
          )}

          {/* VIEW: DETECTIVES & WORKLOAD */}
          {activeTab === 'detectives' && (
            <CommanderDetectivesView
              detectivesWorkload={detectivesWorkload}
              cases={cases}
              onOpenCase={handleOpenCaseWorkspace}
              onFilterCasesByDetective={(pn) => {
                setCasesFilter(pn);
                setActiveTab('cases');
              }}
            />
          )}

          {/* VIEW: COMPLAINTS & GRIEVANCES */}
          {activeTab === 'complaints' && (
            <CommanderComplaintsView
              complaints={complaints}
              commander={user}
              onOpenCaseByNumber={handleOpenCaseByNumber}
              onRefreshComplaints={() => refreshAllData(false)}
            />
          )}

          {/* VIEW: DETECTIVES AND COMPLAINTS COMBINED VIEW */}
          {activeTab === 'detectives-complaints' && (
            <CommanderDetectivesAndComplaintsView
              detectivesWorkload={detectivesWorkload}
              complaints={complaints}
              cases={cases}
              commander={user}
              onOpenCase={handleOpenCaseWorkspace}
              onOpenCaseByNumber={handleOpenCaseByNumber}
              onFilterCasesByDetective={(pn) => {
                setCasesFilter(pn);
                setActiveTab('cases');
              }}
              onRefreshComplaints={() => refreshAllData(false)}
            />
          )}

          {/* VIEW: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <CommanderNotificationsView
              notifications={notifications}
              onMarkNotificationAsRead={(id: string) => {
                commanderService.markNotificationRead(id);
                refreshAllData(false);
              }}
              onMarkAllNotificationsAsRead={() => {
                commanderService.markAllNotificationsRead();
                refreshAllData(false);
              }}
              onOpenCaseByNumber={handleOpenCaseByNumber}
              onOpenComplaint={handleOpenComplaintById}
            />
          )}

          {/* VIEW: PROFILE */}
          {activeTab === 'profile' && (
            <CommanderProfileView commander={user} />
          )}

        </main>
      </div>

      {/* Station Footer - separated by a clean line */}
      <footer className={`border-t py-4 px-4 text-center text-xs ${
        isDark ? 'border-white/10 text-slate-500' : 'border-black/10 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {user.station || 'SAPS Berea Police Station'} • Republic of South Africa
          </span>
          <span className="font-mono">
            Station Commander: {user.rank} {user.fullName} ({user.personnelNumber})
          </span>
        </div>
      </footer>

      {/* SUPERVISORY CASE / DOCKET WORKSPACE MODAL */}
      {activeWorkspaceCase && (
        <CommanderCaseWorkspaceModal
          caseDocket={activeWorkspaceCase}
          commander={user}
          initialTab={workspaceInitialTab}
          onClose={() => {
            setActiveWorkspaceCase(null);
            refreshAllData(false);
          }}
          onOpenAssignModal={(c) => {
            setActiveAssignCase(c);
          }}
          onCaseUpdated={(updated) => {
            setActiveWorkspaceCase(updated);
            refreshAllData(true);
          }}
        />
      )}

      {/* ASSIGN DETECTIVE SUB-MODAL */}
      {activeAssignCase && (
        <CommanderAssignDetectiveModal
          caseDocket={activeAssignCase}
          detectives={AUTHORISED_STATION_DETECTIVES}
          commander={user}
          onClose={() => setActiveAssignCase(null)}
          onConfirmAssignment={handleConfirmAssignment}
        />
      )}

    </div>
  );
};
