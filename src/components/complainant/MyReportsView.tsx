import React, { useState } from 'react';
import { IncidentReport, ReportStatus, ComplainantTab } from '../../types/complainant';
import { 
  FileText, 
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
  QrCode,
  AlertTriangle
} from 'lucide-react';
import { StationLocatorModal } from './StationLocatorModal';
import { StationVerificationPassModal } from './StationVerificationPassModal';

interface MyReportsViewProps {
  reports: IncidentReport[];
  onRefreshData: () => void;
  onNavigate: (tab: ComplainantTab) => void;
}

export const MyReportsView: React.FC<MyReportsViewProps> = ({
  reports,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [stationModalReport, setStationModalReport] = useState<IncidentReport | null>(null);
  const [passModalReport, setPassModalReport] = useState<IncidentReport | null>(null);

  // Filter logic
  const filteredReports = reports.filter((r) => {
    const matchesSearch = 
      r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.incidentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.policeStation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ReportStatus) => {
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
            <span>Registered to Official Case</span>
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
    <div id="my-reports-view" className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            My Incident Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track preliminary online incident reports, station intake status, and official case registrations.
          </p>
        </div>

        <button
          type="button"
          id="btn-reports-new"
          onClick={() => onNavigate('report-incident')}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-center cursor-pointer"
        >
          <FilePlus2 size={16} />
          <span>New Incident Report</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by SFEN reference, crime type, or precinct..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={15} className="text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          >
            <option value="all">All Statuses ({reports.length})</option>
            <option value="Awaiting Review">Awaiting Review</option>
            <option value="Under Station Review">Under Station Review</option>
            <option value="Registered to Case">Registered to Case</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
            <FileText size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-300">No incident reports found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try changing your search keywords or status filter.'
              : 'You have not submitted any incident reports online yet.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('report-incident')}
            className="mt-2 text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
          >
            Create your first report now →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5 group"
            >
              {/* Row 1: Reference, Status, Type, and Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono font-extrabold text-sm text-emerald-400">
                    {report.referenceNumber}
                  </span>
                  {getStatusBadge(report.status)}
                  <span className="text-xs font-bold text-white">
                    {report.incidentType}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Calendar size={13} className="text-slate-500" />
                  <span>Submitted: {new Date(report.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Row 2: Police Station and Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Building2 size={14} className="text-emerald-400 shrink-0" />
                  <span className="font-semibold text-slate-200">{report.policeStation}</span>
                  {report.linkedCaseNumber && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-blue-300 text-[11px]">
                        Docket: <strong className="font-mono">{report.linkedCaseNumber}</strong>
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <button
                    type="button"
                    id={`btn-pass-report-${report.id}`}
                    onClick={() => setPassModalReport(report)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <QrCode size={13} />
                    <span>Station Pass</span>
                  </button>

                  <button
                    type="button"
                    id={`btn-view-report-${report.id}`}
                    onClick={() => setSelectedReport(report)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Details</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Full Details Modal */}
      {selectedReport && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto space-y-5">
            <button
              type="button"
              onClick={() => setSelectedReport(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-base text-emerald-400">
                  {selectedReport.referenceNumber}
                </span>
                {getStatusBadge(selectedReport.status)}
              </div>
              <h3 className="text-lg font-bold text-white">
                {selectedReport.incidentType}
              </h3>
              <p className="text-xs text-slate-400">
                Submitted on {new Date(selectedReport.submittedAt).toLocaleString()} to {selectedReport.policeStation}
              </p>
            </div>

            {/* If officially registered, show linked banner */}
            {selectedReport.linkedCaseNumber ? (
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-blue-200 block">Officially Linked Case Docket</span>
                  <span className="font-mono font-bold text-sm text-white">{selectedReport.linkedCaseNumber}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Transferred to Detective Branch for investigation</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReport(null);
                    onNavigate('my-cases');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Go to Case Timeline →
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertTriangle size={15} />
                    <span>In-Person Station Visit Required to Open Case</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPassModalReport(selectedReport)}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <QrCode size={13} />
                    <span>Show Station Pass</span>
                  </button>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  This online report is an initial overview of what occurred. Take your reference number (<strong className="font-mono text-white">{selectedReport.referenceNumber}</strong>) to <strong className="text-white">{selectedReport.policeStation}</strong>. The station officer will access your online report, verify your sworn statement, and register your official CAS case docket.
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider block">
                  Incident Location & Time
                </span>
                <p className="text-slate-200">
                  {selectedReport.location.address}, {selectedReport.location.suburb}, {selectedReport.location.city} ({selectedReport.location.province})
                </p>
                <p className="text-slate-400 text-[11px]">
                  Date: {selectedReport.incidentDate} at {selectedReport.incidentTime}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider block">
                  Full Statement of Incident
                </span>
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedReport.description}
                </p>
              </div>

              {/* Involved Parties */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider block">
                  Involved Parties & Stolen Property
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                  <div>
                    <strong className="text-slate-400">Suspects:</strong> {selectedReport.involvedParties.suspectDetails || 'None stated'}
                  </div>
                  <div>
                    <strong className="text-slate-400">Witnesses:</strong> {selectedReport.involvedParties.witnessDetails || 'None stated'}
                  </div>
                  <div>
                    <strong className="text-slate-400">Vehicles:</strong> {selectedReport.involvedParties.vehicleDetails || 'None stated'}
                  </div>
                  <div>
                    <strong className="text-slate-400">Property:</strong> {selectedReport.involvedParties.stolenItems || 'None stated'}
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider block">
                  Attached Evidence & Documents ({selectedReport.attachments.length})
                </span>
                {selectedReport.attachments.length === 0 ? (
                  <p className="text-slate-500 italic text-[11px]">No attachments uploaded.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedReport.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip size={13} className="text-emerald-400" />
                          <span className="font-mono text-slate-200">{att.name}</span>
                          <span className="text-slate-500">({att.size})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {att.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPassModalReport(selectedReport)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <QrCode size={14} />
                  <span>Station Pass / Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStationModalReport(selectedReport);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Building2 size={14} />
                  <span>Locate Station</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Station In-Person Verification Pass Modal */}
      {passModalReport && (
        <StationVerificationPassModal
          isOpen={!!passModalReport}
          onClose={() => setPassModalReport(null)}
          report={passModalReport}
        />
      )}

      {/* Police Station Directions & Details Modal */}
      {stationModalReport && (
        <StationLocatorModal
          isOpen={!!stationModalReport}
          onClose={() => setStationModalReport(null)}
          location={stationModalReport.location}
          policeStationName={stationModalReport.policeStation}
          reportReference={stationModalReport.referenceNumber}
          incidentType={stationModalReport.incidentType}
        />
      )}

    </div>
  );
};
