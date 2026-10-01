import React, { useState, useEffect, useRef } from 'react';
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
import { GoogleMapsWrapper } from '../maps/GoogleMapsWrapper';
import { IncidentLocationViewerMap } from '../maps/IncidentLocationViewerMap';
import { AlertTriangle, MapPin, Phone, X } from 'lucide-react';

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
  const [urgentAlert, setUrgentAlert] = useState<IncidentReport | null>(null);
  const alertedUrgentReportIds = useRef(new Set<string>());
  const urgentDismissalStorageKey = `sfen_dismissed_urgent_reports_${user.id}`;

  // Toast feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toIncidentReport = (report: any): IncidentReport => ({
    id: report.id,
    referenceNumber: report.referenceNumber,
    userId: report.complainantId,
    complainantName: report.complainant?.fullName || 'Citizen',
    complainantPhone: report.complainant?.phoneNumber || 'No phone number recorded',
    complainantEmail: report.complainant?.email || '',
    incidentType: report.incidentType,
    incidentDate: report.incidentDate.slice(0, 10),
    incidentTime: report.incidentTime || '',
    location: { address: report.address, suburb: report.suburb, city: report.city, province: report.province, preferredStation: report.preferredStation || 'Police Station', latitude: report.latitude ?? undefined, longitude: report.longitude ?? undefined },
    description: report.description,
    involvedParties: report.involvedParties || {},
    attachments: report.attachments || [],
    status: report.status === 'REGISTERED_TO_CASE' ? 'Registered to Case' : report.status === 'UNDER_STATION_REVIEW' ? 'Under Station Review' : report.status === 'ADDITIONAL_INFO_REQUIRED' ? 'Additional Info Required' : report.status === 'ARCHIVED' ? 'Archived' : 'Awaiting Review',
    requiresImmediateAttention: Boolean(report.requiresImmediateAttention),
    submittedAt: report.createdAt,
    policeStation: report.preferredStation || 'Police Station',
    stationNotes: report.stationNotes,
    linkedCaseNumber: report.case?.caseNumber,
  });

  const loadLiveReports = async () => {
    if (!user.token) return;
    try {
      const response = await fetch('/api/reports', { headers: { Authorization: `Bearer ${user.token}` } });
      if (!response.ok) return;
      const apiReports = (await response.json() as Array<any>).map(toIncidentReport);
      const localReports = officerService.getReports();
      const combined = new Map<string, IncidentReport>();
      [...localReports, ...apiReports].forEach((report) => combined.set(report.referenceNumber, report));
      setReports(Array.from(combined.values()).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
    } catch {
      // Existing local reports remain available if the live queue is temporarily unavailable.
    }
  };

  // Load all data
  const refreshData = () => {
    officerService.archiveExpiredUnregisteredReports();
    setReports(officerService.getReports());
    setCases(officerService.getRegisteredCases());
    setMovements(officerService.getDocketMovements());
    setNotifications(officerService.getNotifications());
    setAuditLogs(officerService.getAuditLogs());
  };

  useEffect(() => {
    refreshData();
    void loadLiveReports();
  }, []);

  useEffect(() => {
    try {
      const dismissedIds = JSON.parse(localStorage.getItem(urgentDismissalStorageKey) || '[]') as string[];
      dismissedIds.forEach((id) => alertedUrgentReportIds.current.add(id));
    } catch {
      // A malformed old browser value should never stop urgent-report checks.
    }
  }, [urgentDismissalStorageKey]);

  useEffect(() => {
    if (!user.token) return;
    const intervalId = window.setInterval(() => { void loadLiveReports(); }, 5000);
    return () => window.clearInterval(intervalId);
  }, [user.token]);

  useEffect(() => {
    if (!user.token) return;
    let isActive = true;
    const checkUrgentReports = async () => {
      try {
        const response = await fetch('/api/alerts/urgent-reports', { headers: { Authorization: `Bearer ${user.token}` } });
        if (!response.ok) return;
        const data = await response.json() as Array<any>;
        const urgentReports = data.map(toIncidentReport);
        // React development mode can briefly mount, clean up, and mount this effect again.
        // Do not mark an alert as seen until the active officer screen is the one handling it.
        if (!isActive) return;
        const newUrgentReport = urgentReports.find((report) => !alertedUrgentReportIds.current.has(report.id));
        urgentReports.forEach((report) => alertedUrgentReportIds.current.add(report.id));
        if (newUrgentReport) setUrgentAlert(newUrgentReport);
      } catch {
        // The officer can continue using the portal if a temporary alert check fails.
      }
    };
    void checkUrgentReports();
    const intervalId = window.setInterval(checkUrgentReports, 5000);
    return () => { isActive = false; window.clearInterval(intervalId); };
  }, [user.token]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const dismissUrgentAlert = () => {
    if (urgentAlert) {
      alertedUrgentReportIds.current.add(urgentAlert.id);
      try {
        localStorage.setItem(urgentDismissalStorageKey, JSON.stringify([...alertedUrgentReportIds.current]));
      } catch {
        // The alert is still dismissed for this session if browser storage is unavailable.
      }
    }
    setUrgentAlert(null);
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

  const handleRegisterCase = async (input: CaseRegistrationInput) => {
    let registrationInput = input;
    if (user.token) {
      try {
        const response = await fetch(`/api/reports/${input.reportId}/register-case`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({
            statutoryCode: input.statutoryCode,
            priorityLevel: input.priorityLevel,
            policeStation: user.station,
            evidenceIntakeNotes: input.evidenceIntakeNotes
          })
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          if (response.status === 401) {
            onSignOut();
            return { success: false, caseNumber: '', message: 'Your officer session expired. Please sign in again before registering the case.' };
          }
          return { success: false, caseNumber: '', message: body.message || 'The live report could not be registered.' };
        }
        const registered = await response.json() as { caseNumber: string };
        registrationInput = { ...input, officialCaseNumber: registered.caseNumber };
      } catch {
        return { success: false, caseNumber: '', message: 'Unable to reach the SFEN case registration service. Please try again.' };
      }
    }

    const res = officerService.registerCase(registrationInput, user);
    if (res.success) {
      showToast(res.message);
      refreshData();
      void loadLiveReports();
    }
    return res;
  };

  const handleCreateWalkInReport = async (input: Record<string, string>) => {
    try {
      const response = await fetch('/api/walk-in-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(input)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) return { success: false, report: null, message: body.message || 'The walk-in intake could not be created.' };
      const report = toIncidentReport(body);
      officerService.logAction({
        officerId: user.id,
        officerName: user.fullName,
        officerRank: user.rank,
        personnelNumber: user.personnelNumber,
        station: user.station,
        actionType: 'WALK_IN_INTAKE_CREATED',
        referenceNumber: report.referenceNumber,
        description: `Opened a walk-in station intake for ${report.complainantName}.`
      });
      setReports((current) => [report, ...current.filter((item) => item.id !== report.id)]);
      setAuditLogs(officerService.getAuditLogs());
      showToast(`Walk-in intake ${report.referenceNumber} opened. Complete the official case registration next.`);
      return { success: true, report, message: 'Walk-in intake created.' };
    } catch {
      return { success: false, report: null, message: 'Unable to reach the SFEN intake service. Please try again.' };
    }
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
      className={`sfen-shell sfen-staff-shell min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-3 rounded-md bg-blue-600 text-white text-xs font-bold shadow-lg border border-blue-500 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {urgentAlert && (
        <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <section className="w-full max-w-3xl my-6 bg-slate-950 border-2 border-red-600 shadow-2xl">
            <header className="p-4 border-b border-red-500/50 bg-red-950/50 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-red-400 shrink-0" size={24} />
                <div>
                  <p className="text-xs font-bold tracking-wide text-red-300 uppercase">Urgent online incident report</p>
                  <h2 className="text-lg font-bold text-white mt-1">Immediate station attention requested</h2>
                  <p className="text-xs text-red-100/80 mt-1 font-mono">{urgentAlert.referenceNumber}</p>
                </div>
              </div>
              <button type="button" onClick={dismissUrgentAlert} aria-label="Close urgent alert" className="text-slate-300 hover:text-white p-1"><X size={22} /></button>
            </header>

            <div className="p-5 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="border border-slate-700 p-3">
                  <p className="text-[11px] uppercase font-bold text-slate-400">Citizen requesting help</p>
                  <p className="font-bold text-white mt-1">{urgentAlert.complainantName}</p>
                  <a href={`tel:${urgentAlert.complainantPhone.replace(/\s/g, '')}`} className="mt-2 inline-flex items-center gap-1.5 text-blue-300 hover:text-blue-200 text-xs font-semibold"><Phone size={14} /> {urgentAlert.complainantPhone}</a>
                </div>
                <div className="border border-slate-700 p-3">
                  <p className="text-[11px] uppercase font-bold text-slate-400">Reported incident</p>
                  <p className="font-bold text-white mt-1">{urgentAlert.incidentType}</p>
                  <p className="text-xs text-slate-300 mt-1">{urgentAlert.incidentDate} {urgentAlert.incidentTime && `at ${urgentAlert.incidentTime}`}</p>
                </div>
              </div>

              <div className="border border-slate-700 p-3">
                <p className="text-[11px] uppercase font-bold text-slate-400">Citizen description</p>
                <p className="text-sm text-slate-100 leading-relaxed mt-1">{urgentAlert.description}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-bold text-white"><MapPin size={16} className="text-red-400" /> Marked incident location</div>
                {urgentAlert.location.latitude !== undefined && urgentAlert.location.longitude !== undefined ? (
                  <GoogleMapsWrapper><IncidentLocationViewerMap location={urgentAlert.location} incidentType={urgentAlert.incidentType} referenceNumber={urgentAlert.referenceNumber} /></GoogleMapsWrapper>
                ) : (
                  <div className="border border-slate-700 p-3 text-sm text-slate-200">{urgentAlert.location.address}, {urgentAlert.location.suburb}, {urgentAlert.location.city}</div>
                )}
              </div>
            </div>

            <footer className="p-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('reports');
                  dismissUrgentAlert();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md"
              >
                Open report queue
              </button>
            </footer>
          </section>
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
        <main className={`sfen-content flex-1 min-w-0 py-6 sm:py-8 md:pl-8 ${activeTab === 'dashboard' ? 'sfen-dashboard' : ''}`}>
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
              onCreateWalkInReport={handleCreateWalkInReport}
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
              auditLogs={auditLogs}
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
            {user.station || 'SAPS Berea Police Station'} • Republic of South Africa
          </span>
          <span className="font-mono">
            Station Officer: {user.rank} {user.fullName} ({user.personnelNumber})
          </span>
        </div>
      </footer>

    </div>
  );
};
