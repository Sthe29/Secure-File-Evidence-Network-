import React, { useState } from 'react';
import { IncidentReport, RegisteredCase } from '../../types/complainant';
import { UserProfile } from '../../types/auth';
import { CaseRegistrationInput } from '../../types/officer';
import { 
  FileText, 
  Briefcase, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Paperclip, 
  AlertTriangle, 
  CheckCircle2, 
  FolderPlus, 
  MessageSquarePlus, 
  ShieldAlert, 
  X, 
  ArrowRight,
  ArrowRightLeft,
  ExternalLink,
  Layers,
  Download,
  Building2,
  CheckCircle,
  UserCheck,
  QrCode
} from 'lucide-react';
import { GoogleMapsWrapper } from '../maps/GoogleMapsWrapper';
import { IncidentLocationViewerMap } from '../maps/IncidentLocationViewerMap';
import { OfficerCaseRegistrationModal } from './OfficerCaseRegistrationModal';

interface OfficerCasesAndReportsViewProps {
  reports: IncidentReport[];
  cases: RegisteredCase[];
  officer: UserProfile;
  initialSubTab?: 'all' | 'reports' | 'cases';
  onReviewReport: (reportId: string) => void;
  onRequestAdditionalInfo: (reportId: string, notes: string) => { success: boolean; message: string };
  onRegisterCase: (input: CaseRegistrationInput) => { success: boolean; caseNumber: string; message: string };
  onNavigateToDocketMovement?: () => void;
  onNavigateToDetectiveBranch?: () => void;
}

export const OfficerCasesAndReportsView: React.FC<OfficerCasesAndReportsViewProps> = ({
  reports,
  cases,
  officer,
  initialSubTab = 'all',
  onReviewReport,
  onRequestAdditionalInfo,
  onRegisterCase,
  onNavigateToDocketMovement,
  onNavigateToDetectiveBranch
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'reports' | 'cases'>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportFilter, setReportFilter] = useState<'ALL' | 'AWAITING' | 'IN_PROGRESS' | 'REGISTERED'>('ALL');
  const [caseFilter, setCaseFilter] = useState<string>('ALL');

  // Modals state
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [selectedCase, setSelectedCase] = useState<RegisteredCase | null>(null);
  
  // Additional info modal state
  const [isRequestingInfo, setIsRequestingInfo] = useState(false);
  const [additionalInfoNotes, setAdditionalInfoNotes] = useState('');
  const [isSendingInfoReq, setIsSendingInfoReq] = useState(false);

  // Case registration modal state
  const [isRegisteringCase, setIsRegisteringCase] = useState(false);

  // Derived counts
  const awaitingReviewCount = reports.filter(r => r.status === 'Awaiting Review').length;
  const inProgressCount = reports.filter(r => r.status === 'Under Station Review' || r.status === 'Additional Info Required').length;
  const registeredReportsCount = reports.filter(r => r.status === 'Registered to Case').length;

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      r.referenceNumber.toLowerCase().includes(q) ||
      r.complainantName.toLowerCase().includes(q) ||
      r.incidentType.toLowerCase().includes(q) ||
      (r.linkedCaseNumber && r.linkedCaseNumber.toLowerCase().includes(q)) ||
      (r.location?.address && r.location.address.toLowerCase().includes(q))
    );

    if (!matchesSearch) return false;

    if (reportFilter === 'AWAITING') return r.status === 'Awaiting Review';
    if (reportFilter === 'IN_PROGRESS') return r.status === 'Under Station Review' || r.status === 'Additional Info Required';
    if (reportFilter === 'REGISTERED') return r.status === 'Registered to Case';

    return true;
  });

  // Filtered cases
  const filteredCases = cases.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      c.caseNumber.toLowerCase().includes(q) ||
      (c.reportReference && c.reportReference.toLowerCase().includes(q)) ||
      c.incidentType.toLowerCase().includes(q) ||
      (c.investigatingOfficer && c.investigatingOfficer.toLowerCase().includes(q)) ||
      (c.currentStatus && c.currentStatus.toLowerCase().includes(q))
    );

    if (!matchesSearch) return false;

    if (caseFilter !== 'ALL') {
      return c.currentStatus === caseFilter;
    }

    return true;
  });

  // Combined records for 'all' tab: tag each item with kind
  type UnifiedRecord = 
    | { kind: 'report'; data: IncidentReport; timestamp: string }
    | { kind: 'case'; data: RegisteredCase; timestamp: string };

  const combinedRecords: UnifiedRecord[] = [
    ...filteredReports.map(r => ({
      kind: 'report' as const,
      data: r,
      timestamp: r.incidentDate
    })),
    ...filteredCases.map(c => ({
      kind: 'case' as const,
      data: c,
      timestamp: c.dateRegistered
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Handle open report modal
  const handleOpenReport = (report: IncidentReport) => {
    setSelectedReport(report);
    if (report.status === 'Awaiting Review') {
      onReviewReport(report.id);
    }
  };

  // Handle send clarification
  const handleSendAdditionalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !additionalInfoNotes.trim()) return;

    setIsSendingInfoReq(true);
    const res = onRequestAdditionalInfo(selectedReport.id, additionalInfoNotes);
    setIsSendingInfoReq(false);

    if (res.success) {
      setIsRequestingInfo(false);
      setAdditionalInfoNotes('');
      setSelectedReport({
        ...selectedReport,
        status: 'Additional Info Required',
        stationNotes: `Information requested: ${additionalInfoNotes}`
      });
    }
  };

  // Helper to open linked case from report modal
  const handleViewLinkedCaseFromReport = (casNumber: string) => {
    const found = cases.find(c => c.caseNumber === casNumber);
    if (found) {
      setSelectedReport(null);
      setSelectedCase(found);
    }
  };

  // Helper to open linked report from case modal
  const handleViewLinkedReportFromCase = (reportRef: string) => {
    const found = reports.find(r => r.referenceNumber === reportRef);
    if (found) {
      setSelectedCase(null);
      setSelectedReport(found);
    }
  };

  const getReportStatusBadge = (status: string, linkedCas?: string) => {
    switch (status) {
      case 'Awaiting Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 " />
            Awaiting Review
          </span>
        );
      case 'Under Station Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Under Review
          </span>
        );
      case 'Additional Info Required':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Info Requested
          </span>
        );
      case 'Registered to Case':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 size={12} className="text-emerald-400" />
            Registered {linkedCas ? `(${linkedCas})` : ''}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getCaseStatusBadge = (status: string) => {
    switch (status) {
      case 'Case Registered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Case Registered
          </span>
        );
      case 'Investigation Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 " />
            Investigation Active
          </span>
        );
      case 'Docket at NPA / Court':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            Docket at NPA / Court
          </span>
        );
      case 'Case Finalized':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle size={12} className="text-emerald-400" />
            Finalized
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="officer-cases-and-reports-view" className="space-y-6">
      
      {/* Floating Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cases & Incident Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Unified police records: digital citizen incident reports, official CAS case registrations, and docket status
          </p>
        </div>

        {/* Quick Station Stats */}
        <div className="flex items-center gap-2">
          {awaitingReviewCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('reports');
                setReportFilter('AWAITING');
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 " />
              <span>{awaitingReviewCount} Awaiting Review</span>
            </button>
          )}

          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <span>CAS Dockets: </span>
            <strong className="text-white">{cases.length}</strong>
          </div>
        </div>
      </div>

      {/* Walk-in Citizen Case Opening Desk Banner */}
      <div className="p-4 sm:p-5 rounded-md bg-slate-900 border border-blue-600/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
            <UserCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                Station Case Intake Desk
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 " />
            </div>
            <h3 className="text-sm sm:text-base font-black text-white">
              Walk-In Citizen Digital Case Opening
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-0.5">
              Citizens file an initial incident overview online, then attend the station to open an official case. Pull up their reference to verify their statement, issue a formal CAS number, and transfer the docket to Detectives.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Look up reference (e.g. SFEN-RPT-000124)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-64 sm:w-72"
            />
          </div>
        </div>
      </div>

      {/* Main Tab Segmented Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>All Records</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {reports.length + cases.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={13} />
            <span>Online Reports</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeTab === 'reports' 
                ? 'bg-white/20 text-white' 
                : awaitingReviewCount > 0 
                  ? 'bg-amber-500/20 text-amber-300' 
                  : 'bg-slate-800 text-slate-400'
            }`}>
              {reports.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cases')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'cases'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase size={13} />
            <span>Registered Cases</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeTab === 'cases' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {cases.length}
            </span>
          </button>
        </div>

        {/* Global Search */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={
              activeTab === 'reports' 
                ? 'Search reference, complainant, crime...' 
                : activeTab === 'cases'
                  ? 'Search CAS number, crime, officer...'
                  : 'Search reports and cases...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Sub-Filters for Reports */}
      {activeTab === 'reports' && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Filter size={12} />
            Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Submissions', count: reports.length },
            { id: 'AWAITING', label: 'Awaiting Review', count: awaitingReviewCount, color: 'text-amber-300' },
            { id: 'IN_PROGRESS', label: 'Under Review / Info Req', count: inProgressCount },
            { id: 'REGISTERED', label: 'Registered to Case', count: registeredReportsCount }
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setReportFilter(pill.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                reportFilter === pill.id
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{pill.label}</span>
              <span className="text-[10px] font-mono opacity-80">({pill.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Sub-Filters for Cases */}
      {activeTab === 'cases' && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Filter size={12} />
            Status:
          </span>
          {[
            'ALL',
            'Case Registered',
            'Investigation Active',
            'Docket at NPA / Court',
            'Case Finalized'
          ].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setCaseFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                caseFilter === status
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {status === 'ALL' ? 'All Dockets' : status}
            </button>
          ))}
        </div>
      )}

      {/* VIEW CONTENT */}

      {/* TAB 1: ALL RECORDS */}
      {activeTab === 'all' && (
        <div className="space-y-3">
          {combinedRecords.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <Search size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No records found matching criteria</p>
              <p className="text-xs text-slate-400">
                Try adjusting your search terms or clearing filters.
              </p>
            </div>
          ) : (
            combinedRecords.map((item) => {
              if (item.kind === 'report') {
                const report = item.data;
                return (
                  <div
                    key={`rep_${report.id}`}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                          <FileText size={10} />
                          Online Report
                        </span>
                        <span className="font-mono text-sm font-bold text-purple-300">
                          {report.referenceNumber}
                        </span>
                        {getReportStatusBadge(report.status, report.linkedCaseNumber)}
                      </div>

                      <div className="flex items-center gap-3 text-sm font-bold text-white">
                        <span>{report.incidentType}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-300 font-medium">{report.complainantName}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-slate-500" />
                          <span>{report.location?.suburb || 'Mapped Location'}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar size={13} className="text-slate-500" />
                          <span>{report.incidentDate}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={13} className="text-slate-500" />
                          <span>{report.complainantPhone}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                      {report.linkedCaseNumber ? (
                        <button
                          type="button"
                          onClick={() => handleViewLinkedCaseFromReport(report.linkedCaseNumber!)}
                          className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Briefcase size={13} />
                          <span>View CAS Docket</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReport(report);
                            setIsRegisteringCase(true);
                          }}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <FolderPlus size={13} />
                          <span>Register Case</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenReport(report)}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Eye size={13} />
                        <span>Review Details</span>
                      </button>
                    </div>
                  </div>
                );
              } else {
                const c = item.data;
                return (
                  <div
                    key={`case_${c.id}`}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <Briefcase size={10} />
                          Registered Case
                        </span>
                        <span className="font-mono text-sm font-bold text-emerald-400">
                          {c.caseNumber}
                        </span>
                        {c.reportReference && (
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            Ref: {c.reportReference}
                          </span>
                        )}
                        {getCaseStatusBadge(c.currentStatus)}
                      </div>

                      <div className="flex items-center gap-3 text-sm font-bold text-white">
                        <span>{c.incidentType}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 text-xs font-normal">Assigned: {c.investigatingOfficer}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar size={13} className="text-slate-500" />
                          <span>Registered: {c.dateRegistered}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 size={13} className="text-slate-500" />
                          <span>{c.policeStation}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                      {c.reportReference && (
                        <button
                          type="button"
                          onClick={() => handleViewLinkedReportFromCase(c.reportReference!)}
                          className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileText size={13} />
                          <span>Original Report</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedCase(c)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Case Record</span>
                      </button>
                    </div>
                  </div>
                );
              }
            })
          )}
        </div>
      )}

      {/* TAB 2: ONLINE REPORTS ONLY */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <FileText size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No online reports matching filter</p>
              <p className="text-xs text-slate-400">
                Citizen incident submissions will automatically populate here.
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-sm font-bold text-purple-300">
                      {report.referenceNumber}
                    </span>
                    {getReportStatusBadge(report.status, report.linkedCaseNumber)}
                  </div>

                  <div className="flex items-center gap-3 text-sm font-bold text-white">
                    <span>{report.incidentType}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300 font-medium">{report.complainantName}</span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    {report.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-500" />
                      <span>{report.location?.suburb || 'Sandton Area'}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar size={13} className="text-slate-500" />
                      <span>{report.incidentDate} {report.incidentTime}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-slate-500" />
                      <span>{report.complainantPhone}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                  {report.status !== 'Registered to Case' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReport(report);
                        setIsRegisteringCase(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <FolderPlus size={13} />
                      <span>Register Case</span>
                    </button>
                  )}

                  {report.linkedCaseNumber && (
                    <button
                      type="button"
                      onClick={() => handleViewLinkedCaseFromReport(report.linkedCaseNumber!)}
                      className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Briefcase size={13} />
                      <span>{report.linkedCaseNumber}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenReport(report)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Eye size={13} />
                    <span>Review</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: REGISTERED CASES ONLY */}
      {activeTab === 'cases' && (
        <div className="space-y-3">
          {filteredCases.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <Briefcase size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No registered CAS dockets found</p>
              <p className="text-xs text-slate-400">
                Dockets generated from reviewed citizen reports will appear here.
              </p>
            </div>
          ) : (
            filteredCases.map((c) => (
              <div
                key={c.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      {c.caseNumber}
                    </span>
                    {c.reportReference && (
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        Origin Ref: {c.reportReference}
                      </span>
                    )}
                    {getCaseStatusBadge(c.currentStatus)}
                  </div>

                  <div className="flex items-center gap-3 text-sm font-bold text-white">
                    <span>{c.incidentType}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 text-xs font-normal">Assigned: {c.investigatingOfficer}</span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    {c.lastUpdateSummary}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar size={13} className="text-slate-500" />
                      <span>Date Registered: {c.dateRegistered}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 size={13} className="text-slate-500" />
                      <span>{c.policeStation}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                  {c.reportReference && (
                    <button
                      type="button"
                      onClick={() => handleViewLinkedReportFromCase(c.reportReference!)}
                      className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText size={13} />
                      <span>Original Report</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedCase(c)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Eye size={13} />
                    <span>View Record</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* REPORT DETAIL MODAL */}
      {selectedReport && !isRegisteringCase && !isRequestingInfo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-fade-in my-6">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-base sm:text-lg font-bold text-purple-300">
                    {selectedReport.referenceNumber}
                  </span>
                  {getReportStatusBadge(selectedReport.status, selectedReport.linkedCaseNumber)}
                </div>
                <p className="text-xs text-slate-400">
                  Citizen submission • Mapped Incident Location & Sworn Complainant Declaration
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">

              {/* In-Station Walk-In Case Intake Guidance */}
              {selectedReport.status !== 'Registered to Case' ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <UserCheck size={16} />
                      <span>Complainant In-Person Walk-In Intake</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Complainant filed an overview online (<strong className="font-mono text-white">{selectedReport.referenceNumber}</strong>). Review their statement with them below, verify identity, certify sworn affidavit, and transfer to Detective Branch.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRegisteringCase(true)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shrink-0 cursor-pointer"
                  >
                    <FolderPlus size={15} />
                    <span>Open CAS Docket & Transfer to Detectives</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <CheckCircle2 size={16} />
                      <span>Officially Opened Criminal Case</span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono">
                      Official Docket: <strong className="text-white text-sm">{selectedReport.linkedCaseNumber}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Case opened at station and transferred to Detective Branch for investigation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleViewLinkedCaseFromReport(selectedReport.linkedCaseNumber!)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Briefcase size={14} />
                    <span>View Detective Docket File</span>
                  </button>
                </div>
              )}
              
              {/* Complainant Overview Grid */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <User size={14} className="text-blue-400" />
                  <span>Complainant Identification</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Full Legal Name</span>
                    <strong className="text-white">{selectedReport.complainantName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Contact Phone</span>
                    <span className="text-slate-300 font-mono">{selectedReport.complainantPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Email Address</span>
                    <span className="text-slate-300 font-mono truncate block">{selectedReport.complainantEmail}</span>
                  </div>
                </div>
              </div>

              {/* Incident Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Reported Incident Classification</span>
                  <strong className="text-sm text-white block">{selectedReport.incidentType}</strong>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Date & Time of Occurrence</span>
                  <span className="font-mono text-slate-200">
                    {selectedReport.incidentDate} at {selectedReport.incidentTime}
                  </span>
                </div>
              </div>

              {/* Incident Description */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Complainant Sworn Statement / Narrative
                </span>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedReport.description}
                </p>
              </div>

              {/* Station Notes if available */}
              {selectedReport.stationNotes && (
                <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-1 text-xs">
                  <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                    Station Intake Notes & History
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedReport.stationNotes}
                  </p>
                </div>
              )}

              {/* Map Location Section */}
              {selectedReport.location && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <MapPin size={14} className="text-rose-400" />
                      <span>Mapped Scene Coordinates</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {selectedReport.location.latitude !== undefined && selectedReport.location.longitude !== undefined
                        ? `${selectedReport.location.latitude.toFixed(5)}, ${selectedReport.location.longitude.toFixed(5)}`
                        : 'Station Precinct Mapping'}
                    </span>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-slate-800 h-64 bg-slate-950 relative">
                    <GoogleMapsWrapper>
                      <IncidentLocationViewerMap
                        location={selectedReport.location}
                        incidentType={selectedReport.incidentType}
                        referenceNumber={selectedReport.referenceNumber}
                      />
                    </GoogleMapsWrapper>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Physical Address: <strong className="text-slate-200">{selectedReport.location.address}</strong>
                  </p>
                </div>
              )}

              {/* Attachments */}
              {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Paperclip size={14} className="text-blue-400" />
                    <span>Complainant Uploaded Evidence ({selectedReport.attachments.length})</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedReport.attachments.map((att, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-300 truncate max-w-[200px]">{att.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{att.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestingInfo(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquarePlus size={13} />
                  <span>Request Clarification</span>
                </button>

                {selectedReport.linkedCaseNumber ? (
                  <button
                    type="button"
                    onClick={() => handleViewLinkedCaseFromReport(selectedReport.linkedCaseNumber!)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Briefcase size={14} />
                    <span>View Official CAS Case</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsRegisteringCase(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <FolderPlus size={14} />
                    <span>Assist Walk-in: Open CAS & Transfer to Detectives</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* REQUEST ADDITIONAL INFO MODAL */}
      {isRequestingInfo && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquarePlus size={18} className="text-purple-400" />
                <h3 className="text-base font-bold text-white">Request Complainant Clarification</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestingInfo(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Transmit an official notification to <strong>{selectedReport.complainantName}</strong> requesting clarification notes or additional supporting evidence for submission <strong>{selectedReport.referenceNumber}</strong>.
            </p>

            <form onSubmit={handleSendAdditionalInfo} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Information / Clarification Required
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Please provide photos of the serial number, vehicle license disc, or additional suspect descriptions..."
                  value={additionalInfoNotes}
                  onChange={(e) => setAdditionalInfoNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRequestingInfo(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingInfoReq || !additionalInfoNotes.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>{isSendingInfoReq ? 'Transmitting...' : 'Send Notification'}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CASE REGISTRATION MODAL */}
      {isRegisteringCase && selectedReport && (
        <OfficerCaseRegistrationModal
          isOpen={isRegisteringCase}
          report={selectedReport}
          officer={officer}
          onClose={() => {
            setIsRegisteringCase(false);
          }}
          onRegistered={(casNumber: string) => {
            setIsRegisteringCase(false);
            if (selectedReport) {
              setSelectedReport({
                ...selectedReport,
                status: 'Registered to Case',
                linkedCaseNumber: casNumber
              });
            }
          }}
          onRegisterCase={onRegisterCase}
        />
      )}

      {/* REGISTERED CASE DETAILS MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in my-6">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-base sm:text-lg font-bold text-emerald-400">
                    {selectedCase.caseNumber}
                  </span>
                  {getCaseStatusBadge(selectedCase.currentStatus)}
                </div>
                <p className="text-xs text-slate-400">
                  Official Police CAS Docket Record • {selectedCase.policeStation}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Incident Offence</span>
                  <strong className="text-white text-sm block">{selectedCase.incidentType}</strong>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Investigating Officer</span>
                  <span className="text-slate-200 font-medium block">{selectedCase.investigatingOfficer}</span>
                  <span className="text-[10px] text-slate-400">{selectedCase.officerRank}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Date Registered</span>
                  <span className="font-mono text-slate-200">{selectedCase.dateRegistered}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Linked Origin Reference</span>
                  <span className="font-mono text-purple-300">
                    {selectedCase.reportReference || 'Direct Station Registration'}
                  </span>
                </div>
              </div>

              {/* Latest Update */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Latest Case Summary & Directives
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedCase.lastUpdateSummary}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono pt-1">
                  <span>Updated: {selectedCase.lastUpdateDate}</span>
                </div>
              </div>

              {/* Investigation Milestones Timeline */}
              {selectedCase.timeline && selectedCase.timeline.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers size={14} className="text-blue-400" />
                    <span>Investigation Stages & Chain of Custody</span>
                  </span>

                  <div className="space-y-3 pl-2 border-l-2 border-slate-800">
                    {selectedCase.timeline.map((stage, idx) => (
                      <div key={idx} className="relative pl-5 space-y-0.5">
                        <span className={`absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full border-2 ${
                          stage.completed 
                            ? 'bg-emerald-500 border-emerald-400' 
                            : stage.current 
                              ? 'bg-blue-500 border-blue-400 ' 
                              : 'bg-slate-800 border-slate-700'
                        }`} />

                        <div className="flex items-center justify-between text-xs">
                          <p className={`font-semibold ${stage.completed ? 'text-white' : stage.current ? 'text-blue-300' : 'text-slate-500'}`}>
                            {stage.title}
                          </p>
                          <span className="font-mono text-[10px] text-slate-500">
                            {stage.date}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400">
                          {stage.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedCase.reportReference && (
                  <button
                    type="button"
                    onClick={() => handleViewLinkedReportFromCase(selectedCase.reportReference!)}
                    className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText size={13} />
                    <span>View Submission</span>
                  </button>
                )}

                {onNavigateToDocketMovement && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCase(null);
                      onNavigateToDocketMovement();
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <ArrowRightLeft size={13} />
                    <span>Docket Movement</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
