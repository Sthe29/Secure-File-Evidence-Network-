import React, { useState } from 'react';
import { CitizenProfile } from '../../types/auth';
import { 
  IncidentReport, 
  RegisteredCase, 
  ServiceComplaint, 
  ReportStatus,
  ComplaintCategory,
  ComplainantTab 
} from '../../types/complainant';
import { submitServiceComplaint, simulateRegisterCaseFromReport } from '../../services/complainantService';
import { 
  Briefcase, 
  FileText, 
  AlertCircle, 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Paperclip, 
  ArrowRight,
  FilePlus2,
  UserCheck,
  Scale,
  Plus,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { StationLocatorModal } from './StationLocatorModal';

interface CombinedRecordsViewProps {
  citizen: CitizenProfile;
  reports: IncidentReport[];
  cases: RegisteredCase[];
  complaints: ServiceComplaint[];
  initialSubTab?: 'cases' | 'reports' | 'complaints';
  onRefreshData: () => void;
  onNavigate: (tab: ComplainantTab) => void;
}

const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Investigation Delay / Lack of Updates',
  'Officer Unprofessionalism / Conduct',
  'Station Frontline Service Delivery',
  'Evidence Handling / Property Dispute',
  'Victim Support Services'
];

const POLICE_STATIONS = [
  'Central Precinct (Sector 4)',
  'Sandton Police Station',
  'Johannesburg Central Station',
  'Cape Town Central SAPS',
  'Durban Central SAPS',
  'Pretoria Central SAPS',
  'Other Police Station'
];

export const CombinedRecordsView: React.FC<CombinedRecordsViewProps> = ({
  citizen,
  reports,
  cases,
  complaints,
  initialSubTab = 'cases',
  onRefreshData,
  onNavigate
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'cases' | 'reports' | 'complaints'>(initialSubTab);

  // Cases State
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [detailCase, setDetailCase] = useState<RegisteredCase | null>(null);

  // Reports State
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [stationModalReport, setStationModalReport] = useState<IncidentReport | null>(null);

  // Complaints State
  const [isLodgeModalOpen, setIsLodgeModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ServiceComplaint | null>(null);
  const [complaintCategory, setComplaintCategory] = useState<ComplaintCategory>('Investigation Delay / Lack of Updates');
  const [complaintStation, setComplaintStation] = useState('Central Precinct (Sector 4)');
  const [complaintLinkedRef, setComplaintLinkedRef] = useState('');
  const [complaintIncidentDate, setComplaintIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [complaintDetails, setComplaintDetails] = useState('');
  const [complaintDesiredResolution, setComplaintDesiredResolution] = useState('');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [complaintError, setComplaintError] = useState('');
  const [complaintToast, setComplaintToast] = useState<string | null>(null);

  // Filtered Cases
  const filteredCases = cases.filter((c) => {
    return (
      c.caseNumber.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
      c.incidentType.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
      c.policeStation.toLowerCase().includes(caseSearchQuery.toLowerCase())
    );
  });

  // Filtered Reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch = 
      r.referenceNumber.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
      r.incidentType.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
      r.policeStation.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(reportSearchQuery.toLowerCase());
    const matchesStatus = reportStatusFilter === 'all' || r.status === reportStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Complaints
  const filteredComplaints = complaints;

  // Handle Complaint Submission
  const handleLodgeComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    setComplaintError('');

    if (!complaintDetails.trim()) {
      setComplaintError('Please provide details regarding your grievance.');
      return;
    }

    if (!complaintDesiredResolution.trim()) {
      setComplaintError('Please outline your expected resolution.');
      return;
    }

    setIsSubmittingComplaint(true);

    try {
      const result = submitServiceComplaint({
        userId: citizen.id,
        category: complaintCategory,
        policeStation: complaintStation,
        linkedReference: complaintLinkedRef.trim() || undefined,
        incidentDate: complaintIncidentDate,
        details: complaintDetails.trim(),
        desiredResolution: complaintDesiredResolution.trim()
      });

      onRefreshData();
      setIsSubmittingComplaint(false);
      setIsLodgeModalOpen(false);
      setComplaintDetails('');
      setComplaintDesiredResolution('');
      setComplaintLinkedRef('');

      setComplaintToast(`Service grievance ${result.referenceNumber} has been logged.`);
      setTimeout(() => setComplaintToast(null), 5000);
    } catch {
      setIsSubmittingComplaint(false);
      setComplaintError('Failed to submit complaint. Please try again.');
    }
  };

  const getReportStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'Awaiting Review':
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1">
            <Clock size={11} />
            <span>Awaiting Review</span>
          </span>
        );
      case 'Under Station Review':
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 flex items-center gap-1">
            <Building2 size={11} />
            <span>Under Station Review</span>
          </span>
        );
      case 'Registered to Case':
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center gap-1">
            <CheckCircle2 size={11} />
            <span>Registered to Case</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="combined-records-view" className="space-y-6 animate-fade-in">
      
      {/* Toast Notification */}
      {complaintToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-emerald-400" />
            <span>{complaintToast}</span>
          </div>
          <button onClick={() => setComplaintToast(null)} className="text-emerald-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Floating Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Records
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your registered police cases, online incident reports, and service complaints in one place.
          </p>
        </div>

        {/* Action Button depending on subtab */}
        <div className="flex items-center gap-2.5 self-start md:self-center">
          {activeSubTab === 'reports' && (
            <button
              type="button"
              onClick={() => onNavigate('report-incident')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FilePlus2 size={15} />
              <span>Report Incident</span>
            </button>
          )}

          {activeSubTab === 'complaints' && (
            <button
              type="button"
              onClick={() => setIsLodgeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} />
              <span>Lodge Complaint</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Pills (Cases, Reports, Complaints) */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('cases')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'cases'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Briefcase size={15} />
          <span>Registered Cases (CAS)</span>
          <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
            activeSubTab === 'cases' ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-300'
          }`}>
            {cases.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'reports'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText size={15} />
          <span>Incident Reports</span>
          <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
            activeSubTab === 'reports' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-300'
          }`}>
            {reports.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('complaints')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'complaints'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <AlertCircle size={15} />
          <span>Service Complaints</span>
          <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
            activeSubTab === 'complaints' ? 'bg-amber-800 text-amber-100' : 'bg-slate-800 text-slate-300'
          }`}>
            {complaints.length}
          </span>
        </button>
      </div>

      {/* ======================= TAB 1: CASES ======================= */}
      {activeSubTab === 'cases' && (
        <div className="space-y-4 animate-fade-in">
          {/* Search Bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by CAS number, incident type, or police precinct..."
              value={caseSearchQuery}
              onChange={(e) => setCaseSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {filteredCases.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <Briefcase size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-300">No registered police cases found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {caseSearchQuery 
                  ? 'No cases match your search keywords.' 
                  : 'When an online report is verified and accepted at the station, the official CAS docket will appear here.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('reports')}
                className="text-xs font-bold text-blue-400 hover:underline cursor-pointer"
              >
                Check your submitted incident reports →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCases.map((c) => (
                <div
                  key={c.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                      <Briefcase size={20} />
                    </div>
                    <span className="font-mono font-extrabold text-base sm:text-lg text-blue-400 tracking-wide">
                      {c.caseNumber}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailCase(c)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer self-start sm:self-center"
                  >
                    <span>View Docket Timeline</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: REPORTS ======================= */}
      {activeSubTab === 'reports' && (
        <div className="space-y-4 animate-fade-in">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by SFEN reference, crime type, or precinct..."
                value={reportSearchQuery}
                onChange={(e) => setReportSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={15} className="text-slate-400 shrink-0" />
              <select
                value={reportStatusFilter}
                onChange={(e) => setReportStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Review Statuses</option>
                <option value="Awaiting Review">Awaiting Review</option>
                <option value="Under Station Review">Under Station Review</option>
                <option value="Registered to Case">Registered to Official Case</option>
              </select>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <FileText size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-300">No incident reports found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {reportSearchQuery || reportStatusFilter !== 'all'
                  ? 'No reports match your selected search or filter criteria.'
                  : "You haven't submitted any preliminary online reports yet."}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('report-incident')}
                className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
              >
                Submit a new incident report →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-extrabold text-sm text-emerald-400">
                        {r.referenceNumber}
                      </span>
                      {getReportStatusBadge(r.status)}
                      <span className="text-xs font-bold text-white">
                        {r.incidentType}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar size={13} className="text-slate-500" />
                        <span>Date: {r.incidentDate}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-500" />
                        <span>Submitted: {new Date(r.submittedAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Building2 size={14} className="text-emerald-400" />
                        <span>{r.policeStation}</span>
                      </div>
                      {r.attachments && r.attachments.length > 0 && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Paperclip size={13} />
                          <span>{r.attachments.length} attachment{r.attachments.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    {r.linkedCaseNumber && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium">
                        <ShieldCheck size={13} />
                        <span>Official Docket: <strong className="font-mono">{r.linkedCaseNumber}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setStationModalReport(r)}
                      className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Building2 size={13} />
                      <span>Station Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedReport(r)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View Report Record</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 3: COMPLAINTS ======================= */}
      {activeSubTab === 'complaints' && (
        <div className="space-y-4 animate-fade-in">
          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <AlertCircle size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-300">No service complaints logged</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                If you encounter improper conduct, investigation delays, or lack of feedback from station officers, lodge a grievance for Station Commander review.
              </p>
              <button
                type="button"
                onClick={() => setIsLodgeModalOpen(true)}
                className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
              >
                + Lodge a service complaint →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-extrabold text-sm text-amber-400">
                        {c.referenceNumber}
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                        {c.status}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {c.category}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      Logged: {new Date(c.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {c.details}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-amber-400 shrink-0" />
                      <span>{c.policeStation}</span>
                    </div>
                    {c.linkedReference && (
                      <div className="flex items-center gap-2">
                        <Scale size={14} className="text-amber-400 shrink-0" />
                        <span>Docket Ref: {c.linkedReference}</span>
                      </div>
                    )}
                  </div>

                  {c.resolutionFeedback && (
                    <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                        Station Commander Directive / Feedback
                      </span>
                      <p className="text-xs text-slate-300">
                        {c.resolutionFeedback}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Case Timeline Modal */}
      {detailCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-lg text-blue-400">{detailCase.caseNumber}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-semibold border border-blue-500/30">
                    {detailCase.currentStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{detailCase.incidentType} • {detailCase.policeStation}</p>
              </div>
              <button
                onClick={() => setDetailCase(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Investigation Timeline</h4>
              <div className="space-y-3">
                {detailCase.timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        event.completed 
                          ? 'bg-blue-500 text-white' 
                          : event.current 
                          ? 'bg-blue-400/20 text-blue-400 border border-blue-400 '
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {event.completed ? '✓' : idx + 1}
                      </div>
                      {idx < detailCase.timeline.length - 1 && (
                        <div className={`w-0.5 flex-1 my-1 ${event.completed ? 'bg-blue-500/50' : 'bg-slate-800'}`} />
                      )}
                    </div>
                    <div className="pb-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${event.current ? 'text-blue-300' : 'text-slate-200'}`}>
                          {event.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{event.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDetailCase(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Record Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono font-bold text-emerald-400 text-base">{selectedReport.referenceNumber}</span>
                <p className="text-xs text-slate-400">{selectedReport.incidentType} • {selectedReport.policeStation}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Statement of Incident</span>
                <p className="text-slate-200 leading-relaxed">{selectedReport.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Incident Date & Time:</span>
                  <span className="text-slate-200 font-mono">{selectedReport.incidentDate} at {selectedReport.incidentTime}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location:</span>
                  <span className="text-slate-200">{selectedReport.location.address}, {selectedReport.location.suburb}</span>
                </div>
              </div>

              {/* Officer simulation trigger if awaiting review */}
              {selectedReport.status !== 'Registered to Case' && (
                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-blue-300">Police CSC Station Review Simulation</span>
                    <button
                      type="button"
                      onClick={() => {
                        simulateRegisterCaseFromReport(selectedReport.id);
                        onRefreshData();
                        setSelectedReport(null);
                      }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Simulate Official CAS Generation
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Simulates a police Community Service Centre officer accepting this online statement and linking the official CAS docket to your account.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Station Modal */}
      {stationModalReport && (
        <StationLocatorModal
          isOpen={Boolean(stationModalReport)}
          policeStationName={stationModalReport.policeStation}
          location={stationModalReport.location}
          reportReference={stationModalReport.referenceNumber}
          caseNumber={stationModalReport.linkedCaseNumber}
          incidentType={stationModalReport.incidentType}
          onClose={() => setStationModalReport(null)}
        />
      )}

      {/* Lodge Complaint Modal */}
      {isLodgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Lodge Service Delivery Grievance</h3>
                <p className="text-xs text-slate-400">Direct escalation to Station Commander & Inspectorate.</p>
              </div>
              <button
                onClick={() => setIsLodgeModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {complaintError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                {complaintError}
              </div>
            )}

            <form onSubmit={handleLodgeComplaint} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Grievance Category *</label>
                <select
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value as ComplaintCategory)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Police Station *</label>
                  <select
                    value={complaintStation}
                    onChange={(e) => setComplaintStation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    {POLICE_STATIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Linked CAS or SFEN Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. CAS 342/09/2026"
                    value={complaintLinkedRef}
                    onChange={(e) => setComplaintLinkedRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
                  >
                  </input>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description of Service Issue *</label>
                <textarea
                  rows={3}
                  placeholder="Provide facts, dates, officer names or reasons for dissatisfaction..."
                  value={complaintDetails}
                  onChange={(e) => setComplaintDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Expected Resolution *</label>
                <input
                  type="text"
                  placeholder="e.g., Detective status callback, docket reassignment, statement retrieval..."
                  value={complaintDesiredResolution}
                  onChange={(e) => setComplaintDesiredResolution(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLodgeModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingComplaint}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingComplaint ? 'Submitting...' : 'Submit Grievance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
