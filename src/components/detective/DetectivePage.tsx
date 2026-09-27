import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types/auth';
import { 
  DetectiveNavTab, 
  DetectiveCaseDocket, 
  CaseWorkspaceTab,
  SupervisorInstruction,
  DetectiveNotification 
} from '../../types/detective';
import { detectiveService } from '../../services/detectiveService';
import { DetectiveSidebar } from './DetectiveSidebar';
import { DetectiveTopNav } from './DetectiveTopNav';
import { DetectiveDashboardView } from './DetectiveDashboardView';
import { DetectiveCasesAndDirectivesView } from './DetectiveCasesAndDirectivesView';
import { DetectiveProfileView } from './DetectiveProfileView';
import { DetectiveCaseWorkspaceModal } from './DetectiveCaseWorkspaceModal';
import { useTheme } from '../../context/ThemeContext';

interface DetectivePageProps {
  user: UserProfile;
  onSignOut: () => void;
}

export const DetectivePage: React.FC<DetectivePageProps> = ({ user, onSignOut }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<DetectiveNavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detective State
  const [assignedCases, setAssignedCases] = useState<DetectiveCaseDocket[]>([]);
  const [allInstructions, setAllInstructions] = useState<SupervisorInstruction[]>([]);
  const [notifications, setNotifications] = useState<DetectiveNotification[]>([]);

  // Open Case Workspace State
  const [selectedCaseForWorkspace, setSelectedCaseForWorkspace] = useState<DetectiveCaseDocket | null>(null);
  const [workspaceInitialTab, setWorkspaceInitialTab] = useState<CaseWorkspaceTab>('overview');

  // Toast feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load detective's data strictly filtered to their personnel profile
  const refreshDetectiveData = (syncActiveWorkspace: boolean = true) => {
    const cases = detectiveService.getAssignedCases(user.personnelNumber);
    const insts = detectiveService.getSupervisorInstructions({ detectivePersonnelNumber: user.personnelNumber });
    const notifs = detectiveService.getDetectiveNotifications(user.personnelNumber);

    setAssignedCases(cases);
    setAllInstructions(insts);
    setNotifications(notifs);

    // If requested and a workspace is currently open, refresh its data too
    if (syncActiveWorkspace && selectedCaseForWorkspace) {
      const updatedCurrent = detectiveService.getCaseByNumber(selectedCaseForWorkspace.caseNumber, user.personnelNumber);
      if (updatedCurrent) {
        setSelectedCaseForWorkspace(updatedCurrent);
      }
    }
  };

  useEffect(() => {
    refreshDetectiveData(true);
  }, [user.personnelNumber]);

  // Calculations for badges
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const outstandingInstructionsCount = allInstructions.filter(i => i.status === 'OUTSTANDING').length;

  const handleOpenCase = (
    caseData: DetectiveCaseDocket, 
    initialTab: CaseWorkspaceTab = 'overview'
  ) => {
    setSelectedCaseForWorkspace(caseData);
    setWorkspaceInitialTab(initialTab);
  };

  const handleOpenCaseByNumber = (
    caseNumber: string,
    initialTab: CaseWorkspaceTab = 'overview'
  ) => {
    const found = assignedCases.find(c => c.caseNumber === caseNumber);
    if (found) {
      setSelectedCaseForWorkspace(found);
      setWorkspaceInitialTab(initialTab);
    } else {
      setActiveTab('cases');
    }
  };

  const handleCloseCaseWorkspace = () => {
    setSelectedCaseForWorkspace(null);
    refreshDetectiveData(false);
  };

  const handleMarkNotificationRead = (id: string) => {
    detectiveService.markNotificationRead(id);
    refreshDetectiveData();
  };

  const handleMarkAllNotificationsRead = () => {
    detectiveService.markAllNotificationsRead();
    refreshDetectiveData();
  };

  const handleNavigateToCases = () => {
    setActiveTab('cases');
  };

  return (
    <div 
      id="detective-page-container" 
      className={`min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-3 rounded-md bg-blue-600 text-white text-xs font-bold shadow-lg border border-blue-500 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar with Live Bell */}
      <DetectiveTopNav
        user={user}
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
        onSignOut={onSignOut}
        unreadCount={unreadNotificationsCount}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsRead}
        onOpenCaseByNumber={handleOpenCaseByNumber}
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
          <DetectiveSidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }}
            casesCount={assignedCases.length}
            outstandingInstructionsCount={outstandingInstructionsCount}
            onSignOut={onSignOut}
            isMobileDrawer={true}
            onCloseMobileDrawer={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Container: Sidebar + Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex">
        
        {/* Desktop Sidebar Navigation */}
        <div className="hidden md:block shrink-0">
          <div className="sticky top-20">
            <DetectiveSidebar
              activeTab={activeTab}
              onSelectTab={(tab) => setActiveTab(tab)}
              casesCount={assignedCases.length}
              outstandingInstructionsCount={outstandingInstructionsCount}
              onSignOut={onSignOut}
            />
          </div>
        </div>

        {/* Dynamic Content Area */}
        <main className="flex-1 min-w-0 py-6 sm:py-8 md:pl-8">
          {activeTab === 'dashboard' && (
            <DetectiveDashboardView
              detective={user}
              cases={assignedCases}
              instructions={allInstructions}
              onOpenCase={handleOpenCase}
              onNavigateToCases={handleNavigateToCases}
              onNavigateToInstructions={() => setActiveTab('cases')}
            />
          )}

          {activeTab === 'cases' && (
            <DetectiveCasesAndDirectivesView
              cases={assignedCases}
              instructions={allInstructions}
              onOpenCase={handleOpenCase}
            />
          )}

          {activeTab === 'profile' && (
            <DetectiveProfileView
              user={user}
            />
          )}
        </main>
      </div>

      {/* Station Footer - separated by a clean line */}
      <footer className={`border-t py-4 px-4 text-center text-xs ${
        isDark ? 'border-white/10 text-slate-500' : 'border-black/10 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {user.station || 'SAPS Sandton Police Station'} • Republic of South Africa
          </span>
          <span className="font-mono">
            Investigating Officer: {user.rank} {user.fullName} ({user.personnelNumber}) • Criminal Investigation Directorate (CID)
          </span>
        </div>
      </footer>

      {/* FULL CASE / DOCKET WORKSPACE MODAL */}
      {selectedCaseForWorkspace && (
        <DetectiveCaseWorkspaceModal
          caseData={selectedCaseForWorkspace}
          detective={user}
          initialTab={workspaceInitialTab}
          onClose={handleCloseCaseWorkspace}
          onCaseUpdated={(updatedCase) => {
            setSelectedCaseForWorkspace(updatedCase);
            refreshDetectiveData();
            showToast(`Case ${updatedCase.caseNumber} updated successfully.`);
          }}
        />
      )}

    </div>
  );
};
