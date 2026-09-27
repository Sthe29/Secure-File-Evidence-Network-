import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types/auth';
import { OfficerTab, DocketMovementRecord, OfficerNotification, OfficerAuditLog, CaseRegistrationInput } from '../../types/officer';
import { IncidentReport, RegisteredCase } from '../../types/complainant';
import { officerService } from '../../services/officerService';
import { OfficerTopNav } from './OfficerTopNav';
import { OfficerSidebar } from './OfficerSidebar';
import { OfficerDashboardView } from './OfficerDashboardView';
import { OfficerCasesAndReportsView } from './OfficerCasesAndReportsView';
import { OfficerDetectiveBranchView } from './OfficerDetectiveBranchView';
import { OfficerDocketMovementView } from './OfficerDocketMovementView';
import { OfficerProfileView } from './OfficerProfileView';
import { useTheme } from '../../context/ThemeContext';

interface OfficerPageProps {
  user: UserProfile;
  onSignOut: () => void;
}

export const OfficerPage: React.FC<OfficerPageProps> = ({ user, onSignOut }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<OfficerTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [cases, setCases] = useState<RegisteredCase[]>([]);
  const [movements, setMovements] = useState<DocketMovementRecord[]>([]);
  const [notifications, setNotifications] = useState<OfficerNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<OfficerAuditLog[]>([]);

  // Toast feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load all data
  const refreshData = () => {
    setReports(officerService.getReports());
    setCases(officerService.getRegisteredCases());
    setMovements(officerService.getDocketMovements());
    setNotifications(officerService.getNotifications());
    setAuditLogs(officerService.getAuditLogs());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handlers
  const handleReviewReport = (reportId: string) => {
    officerService.markReportUnderReview(reportId, user);
    refreshData();
  };

  const handleRequestAdditionalInfo = (reportId: string, notes: string) => {
    const res = officerService.requestAdditionalInfo(reportId, notes, user);
    if (res.success) {
      showToast(res.message);
      refreshData();
    }
    return res;
  };

  const handleRegisterCase = (input: CaseRegistrationInput) => {
    const res = officerService.registerCase(input, user);
    if (res.success) {
      showToast(res.message);
      refreshData();
    }
    return res;
  };

  const handleInitiateDocketMovement = (params: {
    caseNumber: string;
    reportReference: string;
    offence: string;
    complainantName: string;
    destination: string;
    dispatchNotes: string;
  }) => {
    officerService.initiateDocketMovement(params, user);
    showToast(`Docket ${params.caseNumber} dispatched to ${params.destination}.`);
    refreshData();
  };

  const handleAcknowledgeReceipt = (
    movementId: string,
    receivingOfficerName: string,
    receivingPersonnelNumber: string,
    receivingRank: string,
    receiptNotes: string
  ) => {
    officerService.acknowledgeDocketReceipt(
      movementId,
      receivingOfficerName,
      receivingPersonnelNumber,
      receivingRank,
      receiptNotes
    );
    showToast(`Receipt acknowledged by ${receivingRank} ${receivingOfficerName}.`);
    refreshData();
  };

  const handleMarkNotificationAsRead = (id: string) => {
    officerService.markNotificationAsRead(id);
    refreshData();
  };

  const handleMarkAllNotificationsAsRead = () => {
    officerService.markAllNotificationsAsRead();
    refreshData();
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const unreviewedReportsCount = reports.filter(r => r.status === 'Awaiting Review').length;

  return (
    <div 
      id="officer-page-container" 
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

      {/* Top Header Bar */}
      <OfficerTopNav
        user={user}
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onSignOut={onSignOut}
        unreadCount={unreadCount}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
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
          <OfficerSidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }}
            reportsCount={reports.length}
            unreviewedReportsCount={unreviewedReportsCount}
            casesCount={cases.length}
            movementsCount={movements.length}
            unreadCount={unreadCount}
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
            <OfficerSidebar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              reportsCount={reports.length}
              unreviewedReportsCount={unreviewedReportsCount}
              casesCount={cases.length}
              movementsCount={movements.length}
              unreadCount={unreadCount}
              onSignOut={onSignOut}
            />
          </div>
        </div>

        {/* Dynamic Content Area */}
        <main className="flex-1 min-w-0 py-6 sm:py-8 md:pl-8">
          {activeTab === 'dashboard' && (
            <OfficerDashboardView
              reports={reports}
              cases={cases}
              notifications={notifications}
              auditLogs={auditLogs}
              officer={user}
              movementsCount={movements.length}
              onNavigate={setActiveTab}
              onOpenReport={() => {
                setActiveTab('records');
              }}
            />
          )}

          {(activeTab === 'records' || activeTab === 'reports' || activeTab === 'cases') && (
            <OfficerCasesAndReportsView
              reports={reports}
              cases={cases}
              officer={user}
              initialSubTab={activeTab === 'cases' ? 'cases' : activeTab === 'reports' ? 'reports' : 'all'}
              onReviewReport={handleReviewReport}
              onRequestAdditionalInfo={handleRequestAdditionalInfo}
              onRegisterCase={handleRegisterCase}
              onNavigateToDocketMovement={() => setActiveTab('docket-movement')}
              onNavigateToDetectiveBranch={() => setActiveTab('detective-branch')}
            />
          )}

          {activeTab === 'detective-branch' && (
            <OfficerDetectiveBranchView
              cases={cases}
              reports={reports}
              movements={movements}
              officer={user}
              onRefreshData={refreshData}
              onNavigateToMovements={() => setActiveTab('docket-movement')}
            />
          )}

          {activeTab === 'docket-movement' && (
            <OfficerDocketMovementView
              movements={movements}
              registeredCases={cases}
              officer={user}
              onInitiateMovement={handleInitiateDocketMovement}
              onAcknowledgeReceipt={handleAcknowledgeReceipt}
            />
          )}

          {activeTab === 'profile' && (
            <OfficerProfileView
              officer={user}
              auditLogs={auditLogs}
              onSignOut={onSignOut}
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
            Station Officer: {user.rank} {user.fullName} ({user.personnelNumber})
          </span>
        </div>
      </footer>

    </div>
  );
};
