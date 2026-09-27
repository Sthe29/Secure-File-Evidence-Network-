import React, { useState, useEffect } from 'react';
import { CitizenProfile } from '../../types/auth';
import { 
  ComplainantTab, 
  IncidentReport, 
  RegisteredCase, 
  ServiceComplaint, 
  ComplainantNotification 
} from '../../types/complainant';
import { 
  getIncidentReports, 
  getIncidentReportsFromApi,
  getRegisteredCases, 
  getServiceComplaints, 
  getNotifications 
} from '../../services/complainantService';
import { ComplainantTopNav } from './ComplainantTopNav';
import { ComplainantSidebar } from './ComplainantSidebar';
import { DashboardOverview } from './DashboardOverview';
import { ReportIncidentForm } from './ReportIncidentForm';
import { CombinedRecordsView } from './CombinedRecordsView';
import { ProfileView } from './ProfileView';
import { useTheme } from '../../context/ThemeContext';

interface ComplainantDashboardProps {
  citizen: CitizenProfile;
  onSignOut: () => void;
  onUpdateCitizen: (updated: CitizenProfile) => void;
}

export const ComplainantDashboard: React.FC<ComplainantDashboardProps> = ({
  citizen,
  onSignOut,
  onUpdateCitizen
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<ComplainantTab>('dashboard');
  const [recordsSubTab, setRecordsSubTab] = useState<'cases' | 'reports' | 'complaints'>('cases');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Complainant Data State
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [cases, setCases] = useState<RegisteredCase[]>([]);
  const [complaints, setComplaints] = useState<ServiceComplaint[]>([]);
  const [notifications, setNotifications] = useState<ComplainantNotification[]>([]);

  const loadData = async () => {
    try {
      const token = citizen.token || localStorage.getItem('sfen_auth_token');
      setReports(token ? await getIncidentReportsFromApi(token, citizen) : getIncidentReports(citizen.id));
    } catch {
      setReports([]);
    }
    setCases(getRegisteredCases(citizen.id));
    setComplaints(getServiceComplaints(citizen.id));
    setNotifications(getNotifications(citizen.id));
  };

  useEffect(() => {
    void loadData();
  }, [citizen.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleReportSubmitted = (report: IncidentReport) => {
    setReports((current) => [report, ...current.filter((item) => item.id !== report.id)]);
    setRecordsSubTab('reports');
    setActiveTab('my-records');
  };

  const handleNavigate = (tab: ComplainantTab) => {
    if (tab === 'my-cases') {
      setRecordsSubTab('cases');
      setActiveTab('my-records');
    } else if (tab === 'my-reports') {
      setRecordsSubTab('reports');
      setActiveTab('my-records');
    } else if (tab === 'complaints') {
      setRecordsSubTab('complaints');
      setActiveTab('my-records');
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div 
      id="complainant-portal-shell" 
      className={`min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      
      {/* Top Navbar */}
      <ComplainantTopNav
        citizen={citizen}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          handleNavigate(tab);
          setMobileMenuOpen(false);
        }}
        unreadCount={unreadCount}
        notifications={notifications}
        onRefreshNotifications={loadData}
        onSignOut={onSignOut}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          id="complainant-mobile-drawer-overlay"
          className={`md:hidden fixed inset-x-0 top-16 z-30 border-b p-4 shadow-xl ${
            isDark ? 'bg-black border-white/10' : 'bg-white border-black/10'
          }`}
        >
          <ComplainantSidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              handleNavigate(tab);
              setMobileMenuOpen(false);
            }}
            reportCount={reports.length}
            caseCount={cases.length}
            complaintCount={complaints.length}
            unreadNotifications={unreadCount}
            onSignOut={onSignOut}
            isMobileDrawer={true}
            onCloseMobileDrawer={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Body Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex">
        
        {/* Desktop Sidebar */}
        <div className="hidden md:block shrink-0">
          <div className="sticky top-20">
            <ComplainantSidebar
              activeTab={activeTab}
              onSelectTab={handleNavigate}
              reportCount={reports.length}
              caseCount={cases.length}
              complaintCount={complaints.length}
              unreadNotifications={unreadCount}
              onSignOut={onSignOut}
            />
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 min-w-0 py-6 sm:py-8 md:pl-8">
          
          {activeTab === 'dashboard' && (
            <DashboardOverview
              citizen={citizen}
              reports={reports}
              cases={cases}
              complaints={complaints}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'report-incident' && (
            <ReportIncidentForm
              citizen={citizen}
              onReportSubmitted={handleReportSubmitted}
              onNavigate={handleNavigate}
            />
          )}

          {(activeTab === 'my-records' || activeTab === 'my-reports' || activeTab === 'my-cases' || activeTab === 'complaints') && (
            <CombinedRecordsView
              citizen={citizen}
              reports={reports}
              cases={cases}
              complaints={complaints}
              initialSubTab={recordsSubTab}
              onRefreshData={loadData}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              citizen={citizen}
              onUpdateCitizen={onUpdateCitizen}
            />
          )}

        </main>
      </div>

      {/* Bottom Legal Notice - separated by a clean line */}
      <footer className={`border-t py-4 px-4 text-center text-xs ${
        isDark ? 'border-white/10 text-slate-500' : 'border-black/10 text-slate-500'
      }`}>
        <p>Republic of South Africa - Official e-Docket System - Strict RBAC Enforcement</p>
      </footer>
    </div>
  );
};
