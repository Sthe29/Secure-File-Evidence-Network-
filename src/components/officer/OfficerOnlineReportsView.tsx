import React, { useState } from 'react';
import { IncidentReport } from '../../types/complainant';
import { UserProfile } from '../../types/auth';
import { 
  FileText, 
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
  ExternalLink,
  Layers,
  Sparkles,
  Download
} from 'lucide-react';
import { GoogleMapsWrapper } from '../maps/GoogleMapsWrapper';
import { IncidentLocationViewerMap } from '../maps/IncidentLocationViewerMap';
import { OfficerCaseRegistrationModal } from './OfficerCaseRegistrationModal';
import { CaseRegistrationInput } from '../../types/officer';

interface OfficerOnlineReportsViewProps {
  reports: IncidentReport[];
  officer: UserProfile;
  onReviewReport: (reportId: string) => void;
  onRequestAdditionalInfo: (reportId: string, notes: string) => { success: boolean; message: string };
  onRegisterCase: (input: CaseRegistrationInput) => { success: boolean; caseNumber: string; message: string };
  onViewRegisteredCase?: (caseNumber: string) => void;
}

export const OfficerOnlineReportsView: React.FC<OfficerOnlineReportsViewProps> = ({
  reports,
  officer,
  onReviewReport,
  onRequestAdditionalInfo,
  onRegisterCase,
  onViewRegisteredCase
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  
  // Additional info modal state
  const [isRequestingInfo, setIsRequestingInfo] = useState(false);
  const [additionalInfoNotes, setAdditionalInfoNotes] = useState('');
  const [isSendingInfoReq, setIsSendingInfoReq] = useState(false);

  // Case registration modal state
  const [isRegisteringCase, setIsRegisteringCase] = useState(false);

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch = 
      r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.complainantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.incidentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.linkedCaseNumber && r.linkedCaseNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'AWAITING') return r.status === 'Awaiting Review';
    if (statusFilter === 'IN_PROGRESS') return r.status === 'Under Station Review' || r.status === 'Additional Info Required';
    if (statusFilter === 'REGISTERED') return r.status === 'Registered to Case';

    return true;
  });

  const getStatusBadge = (status: string, linkedCas?: string) => {
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

  const handleOpenReport = (report: IncidentReport) => {
    setSelectedReport(report);
    if (report.status === 'Awaiting Review') {
      onReviewReport(report.id);
    }
  };

  const handleSendAdditionalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !additionalInfoNotes.trim()) return;

    setIsSendingInfoReq(true);
    const res = onRequestAdditionalInfo(selectedReport.id, additionalInfoNotes);
    setIsSendingInfoReq(false);

    if (res.success) {
      setIsRequestingInfo(false);
      setAdditionalInfoNotes('');
      // update local selected
      setSelectedReport({
        ...selectedReport,
        status: 'Additional Info Required',
        stationNotes: `Information requested by ${officer.rank} ${officer.fullName}: ${additionalInfoNotes}`
      });
    }
  };

  return (
    <div id="officer-online-reports-view" className="space-y-6">
      
      {/* Floating Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Online Incident Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Incoming digital incident submissions from citizens via SFEN Portal • Verified intake & case registration
          </p>
        </div>
      </div>

      {/* Search & Segmented Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search reports by reference, citizen name, crime type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-all"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          {[
            { id: 'ALL', label: 'All Submissions', count: reports.length },
            { id: 'AWAITING', label: 'Awaiting Review', count: reports.filter(r => r.status === 'Awaiting Review').length },
            { id: 'IN_PROGRESS', label: 'Under Review / Info Requested', count: reports.filter(r => r.status === 'Under Station Review' || r.status === 'Additional Info Required').length },
            { id: 'REGISTERED', label: 'Registered to Official Case', count: reports.filter(r => r.status === 'Registered to Case').length }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-950 border border-transparent hover:border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                statusFilter === tab.id ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <FileText size={36} className="text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No incident reports found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? 'Try changing your search terms or filters.' : 'When citizens submit online reports through the portal, they will appear here for CSC review.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => handleOpenReport(report)}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-850/80 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
                    {report.referenceNumber}
                  </span>
                  {getStatusBadge(report.status, report.linkedCaseNumber)}
                  <span className="text-xs text-slate-400 font-medium">
                    {report.incidentType}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-blue-300 transition-colors">
                    {report.complainantName}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {report.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-slate-500" />
                    <span>{report.incidentDate} at {report.incidentTime}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-slate-500" />
                    <span className="truncate max-w-[200px]">{report.location?.address || 'Mapped Scene'}</span>
                  </span>
                  {report.attachments && report.attachments.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400 font-semibold">
                        <Paperclip size={12} />
                        <span>{report.attachments.length} files attached</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Preview */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 group-hover:border-blue-500/50 group-hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye size={13} />
                  <span>Review Report</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILED REPORT REVIEW MODAL / DRAWER */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl my-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-sm font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
                    {selectedReport.referenceNumber}
                  </span>
                  {getStatusBadge(selectedReport.status, selectedReport.linkedCaseNumber)}
                  <span className="text-xs text-slate-400 font-medium">
                    Submitted: {new Date(selectedReport.submittedAt).toLocaleString()}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {selectedReport.incidentType} - Incident Review
                </h2>
                <p className="text-xs text-slate-400">
                  Station Assigned: <strong className="text-slate-300">{selectedReport.policeStation || officer.station}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[72vh] overflow-y-auto">
              
              {/* Linked Case Banner if already registered */}
              {selectedReport.linkedCaseNumber && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Official Police Case Registered
                      </span>
                      <span className="text-xs text-emerald-300 font-mono font-bold">
                        {selectedReport.linkedCaseNumber}
                      </span>
                    </div>
                  </div>

                  {onViewRegisteredCase && (
                    <button
                      type="button"
                      onClick={() => {
                        const cas = selectedReport.linkedCaseNumber!;
                        setSelectedReport(null);
                        onViewRegisteredCase(cas);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FolderPlus size={13} />
                      <span>View in Registered Cases</span>
                    </button>
                  )}
                </div>
              )}

              {/* Grid: Complainant Info + Incident Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Complainant Details */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                    <User size={14} className="text-blue-400" />
                    <span>Complainant Details</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Full Name</span>
                      <span className="font-bold text-white">{selectedReport.complainantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contact Phone</span>
                      <span className="font-mono text-slate-200">{selectedReport.complainantPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email Address</span>
                      <span className="font-mono text-slate-200">{selectedReport.complainantEmail}</span>
                    </div>
                    {selectedReport.location?.address && (
                      <div className="flex justify-between pt-1 border-t border-slate-800/80">
                        <span className="text-slate-400">Residential/Area</span>
                        <span className="text-slate-200 text-right">{selectedReport.location.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Incident Specifics */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                    <Clock size={14} className="text-blue-400" />
                    <span>Incident Specifics</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Offence Category</span>
                      <span className="font-bold text-blue-300">{selectedReport.incidentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date of Occurrence</span>
                      <span className="text-slate-200 font-mono">{selectedReport.incidentDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Time of Occurrence</span>
                      <span className="text-slate-200 font-mono">{selectedReport.incidentTime}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Landmark / Suburb</span>
                      <span className="text-slate-200 text-right">
                        {selectedReport.location?.suburb || 'Central Precinct'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* MAPPED INCIDENT LOCATION (GOOGLE MAPS) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <MapPin size={14} className="text-rose-400" />
                    <span>Mapped Incident Scene (GPS Coordinates)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Selected by citizen during online submission
                  </span>
                </div>

                <GoogleMapsWrapper>
                  <IncidentLocationViewerMap
                    location={selectedReport.location}
                    incidentType={selectedReport.incidentType}
                    referenceNumber={selectedReport.referenceNumber}
                  />
                </GoogleMapsWrapper>
              </div>

              {/* Full Incident Narrative / Statement */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <FileText size={14} className="text-blue-400" />
                  <span>Complainant Statement & Incident Description</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  {selectedReport.description}
                </p>
              </div>

              {/* Involved Parties / Supporting Info */}
              {selectedReport.involvedParties && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <span className="font-bold text-slate-300 uppercase tracking-wider block">
                    Involved Parties & Property Description
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                    {selectedReport.involvedParties.suspectDetails && (
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <strong className="text-slate-400 block text-[11px]">Suspect Information:</strong>
                        <span>{selectedReport.involvedParties.suspectDetails}</span>
                      </div>
                    )}
                    {selectedReport.involvedParties.vehicleDetails && (
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <strong className="text-slate-400 block text-[11px]">Vehicle Information:</strong>
                        <span>{selectedReport.involvedParties.vehicleDetails}</span>
                      </div>
                    )}
                    {selectedReport.involvedParties.stolenItems && (
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <strong className="text-slate-400 block text-[11px]">Stolen Property / Loss:</strong>
                        <span>{selectedReport.involvedParties.stolenItems}</span>
                      </div>
                    )}
                    {selectedReport.involvedParties.witnessDetails && (
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <strong className="text-slate-400 block text-[11px]">Witness Contact:</strong>
                        <span>{selectedReport.involvedParties.witnessDetails}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Uploaded Supporting Attachments */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Paperclip size={14} className="text-blue-400" />
                  <span>Uploaded Supporting Evidence & Documents</span>
                </div>

                {selectedReport.attachments && selectedReport.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {selectedReport.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                            <FileText size={15} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{file.size} • {file.category}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => alert(`Viewing file: ${file.name}\nSize: ${file.size}\nAttached to report ${selectedReport.referenceNumber}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer shrink-0"
                          title="View / Download"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    No physical or digital files uploaded with this submission.
                  </p>
                )}
              </div>

              {/* Station Notes / Review Traceability */}
              {selectedReport.stationNotes && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-slate-400 block text-[11px] uppercase tracking-wider">
                    Station CSC Notes:
                  </span>
                  <p className="text-slate-300 italic">{selectedReport.stationNotes}</p>
                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
            <div className="p-5 sm:p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Request Additional Info button */}
                <button
                  type="button"
                  id="btn-request-additional-info"
                  onClick={() => setIsRequestingInfo(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquarePlus size={14} />
                  <span>Request Additional Information</span>
                </button>

                {/* Move into Case Registration */}
                {selectedReport.status !== 'Registered to Case' ? (
                  <button
                    type="button"
                    id="btn-start-case-registration"
                    onClick={() => setIsRegisteringCase(true)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <FolderPlus size={15} />
                    <span>Proceed to Case Registration</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>Case Registered: {selectedReport.linkedCaseNumber}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* REQUEST ADDITIONAL INFORMATION MODAL */}
      {isRequestingInfo && selectedReport && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <MessageSquarePlus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Request Additional Information
                  </h3>
                  <p className="text-xs text-slate-400">
                    Report Reference: {selectedReport.referenceNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestingInfo(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              If required information is missing (such as property serial numbers, suspect details, or clarified affidavit), enter your instructions below. The complainant will receive an automated notification under their account.
            </p>

            <form onSubmit={handleSendAdditionalInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Information / Clarification Required from Citizen
                </label>
                <textarea
                  rows={4}
                  value={additionalInfoNotes}
                  onChange={(e) => setAdditionalInfoNotes(e.target.value)}
                  placeholder="e.g., Please provide serial number for the stolen laptop and clarify whether the vehicle was parked in the covered bay or open street..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 placeholder-slate-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestingInfo(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingInfoReq}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isSendingInfoReq ? 'Transmitting...' : 'Send Request to Citizen'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CASE REGISTRATION MODAL */}
      {isRegisteringCase && selectedReport && (
        <OfficerCaseRegistrationModal
          report={selectedReport}
          officer={officer}
          isOpen={isRegisteringCase}
          onClose={() => setIsRegisteringCase(false)}
          onRegisterCase={onRegisterCase}
          onRegistered={(casNumber) => {
            setIsRegisteringCase(false);
            if (selectedReport) {
              setSelectedReport({
                ...selectedReport,
                status: 'Registered to Case',
                linkedCaseNumber: casNumber
              });
            }
          }}
        />
      )}

    </div>
  );
};
