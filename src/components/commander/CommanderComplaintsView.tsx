import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { StationComplaintRecord } from '../../types/commander';
import { commanderService } from '../../services/commanderService';
import { 
  AlertCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Send, 
  Briefcase, 
  Phone, 
  Mail, 
  User, 
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CommanderComplaintsViewProps {
  commander: UserProfile;
  complaints: StationComplaintRecord[];
  onOpenCaseByNumber?: (caseNumber: string) => void;
  onRefreshComplaints: () => void;
}

export const CommanderComplaintsView: React.FC<CommanderComplaintsViewProps> = ({
  commander,
  complaints,
  onOpenCaseByNumber,
  onRefreshComplaints
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  // Form states for complaint handling
  const [activeHandlingStatus, setActiveHandlingStatus] = useState<StationComplaintRecord['status']>('Under Investigation');
  const [commanderNotes, setCommanderNotes] = useState('');
  const [outcomeResponse, setOutcomeResponse] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectComplaint = (comp: StationComplaintRecord) => {
    if (selectedComplaintId === comp.id) {
      setSelectedComplaintId(null);
    } else {
      setSelectedComplaintId(comp.id);
      setActiveHandlingStatus(comp.status === 'Pending Review' ? 'Under Investigation' : comp.status);
      setCommanderNotes(comp.commanderNotes || '');
      setOutcomeResponse(comp.outcomeResponse || '');
    }
  };

  const handleSaveResolution = (e: React.FormEvent, complaintId: string) => {
    e.preventDefault();
    if (!commanderNotes.trim()) {
      showToast('Please provide internal supervisory investigation notes.');
      return;
    }

    const res = commanderService.handleComplaint({
      complaintId,
      status: activeHandlingStatus,
      commanderNotes: commanderNotes.trim(),
      outcomeResponse: outcomeResponse.trim(),
      commander
    });

    if (res.success) {
      showToast(res.message);
      onRefreshComplaints();
    }
  };

  const filteredComplaints = complaints.filter((comp) => {
    const matchesSearch = 
      comp.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.complainantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comp.linkedCaseNumber && comp.linkedCaseNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      comp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.details.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'pending') return comp.status === 'Pending Review';
    if (filterStatus === 'under_investigation') return comp.status === 'Under Investigation';
    if (filterStatus === 'resolved') return comp.status === 'Resolved' || comp.status === 'Action Taken';

    return true;
  });

  return (
    <div id="commander-complaints-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Service Delivery & Case Complaints
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Supervise service accountability, investigate frontline delays, and record formal station commander resolutions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            <strong className="text-rose-400">{complaints.filter(c => c.status === 'Pending Review').length}</strong> Awaiting Review
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'all', label: 'All Complaints', count: complaints.length },
            { id: 'pending', label: 'Pending Review', count: complaints.filter(c => c.status === 'Pending Review').length, highlight: complaints.filter(c => c.status === 'Pending Review').length > 0 },
            { id: 'under_investigation', label: 'Under Investigation', count: complaints.filter(c => c.status === 'Under Investigation').length },
            { id: 'resolved', label: 'Resolved / Action Taken', count: complaints.filter(c => c.status === 'Resolved' || c.status === 'Action Taken').length }
          ].map((tab) => {
            const isActive = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  tab.highlight && !isActive
                    ? 'bg-rose-500/20 text-rose-300 font-bold'
                    : isActive
                    ? 'bg-rose-500/30 text-rose-200'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference, victim, CAS..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/60 transition-colors"
          />
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <AlertCircle size={36} className="text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No complaints found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No complaints match your active filter or search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((comp) => {
            const isExpanded = selectedComplaintId === comp.id;

            return (
              <div
                key={comp.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden transition-all"
              >
                {/* Main Card Header */}
                <div
                  onClick={() => handleSelectComplaint(comp)}
                  className="p-4 sm:p-5 hover:bg-slate-850/60 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-400">
                        {comp.referenceNumber}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {comp.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                        comp.status === 'Resolved'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : comp.status === 'Action Taken'
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          : comp.status === 'Under Investigation'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}>
                        {comp.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      "{comp.details}"
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                      <span>Complainant: <strong className="text-slate-200">{comp.complainantName}</strong> ({comp.complainantPhone})</span>
                      <span>•</span>
                      <span>Lodged: {comp.dateSubmitted}</span>
                      {comp.linkedCaseNumber && (
                        <>
                          <span>•</span>
                          <span>Linked Case: <strong className="text-amber-300">{comp.linkedCaseNumber}</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {comp.linkedCaseNumber && onOpenCaseByNumber && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCaseByNumber(comp.linkedCaseNumber!);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Briefcase size={13} />
                        <span>Inspect Linked Case</span>
                      </button>
                    )}

                    <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Review & Resolution Panel */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-slate-950 border-t border-slate-800/80 space-y-5 animate-in fade-in">
                    
                    {/* Full Grievance Particulars */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-slate-300 uppercase tracking-wider">
                          Full Complainant Statement & Desired Resolution
                        </span>
                        <span className="font-mono text-slate-400">
                          Contact: {comp.complainantEmail || comp.complainantPhone}
                        </span>
                      </div>
                      <p className="text-slate-200 leading-relaxed italic">
                        "{comp.details}"
                      </p>
                      {comp.desiredResolution && (
                        <div className="pt-2 border-t border-slate-800/60">
                          <strong className="text-slate-400 block mb-0.5">Desired Resolution:</strong>
                          <span className="text-emerald-300">{comp.desiredResolution}</span>
                        </div>
                      )}
                    </div>

                    {/* Historical Handling Log if previously handled */}
                    {comp.handledByCommanderName && (
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                          <span>Handled by: {comp.handledByRank} {comp.handledByCommanderName} ({comp.handledByPersonnelNumber})</span>
                          {comp.resolvedAt && <span>Timestamp: {new Date(comp.resolvedAt).toLocaleString()}</span>}
                        </div>
                        {comp.commanderNotes && (
                          <div>
                            <strong className="text-slate-400 block mb-0.5">Commander Internal Notes:</strong>
                            <p className="text-slate-200">{comp.commanderNotes}</p>
                          </div>
                        )}
                        {comp.outcomeResponse && (
                          <div>
                            <strong className="text-emerald-400 block mb-0.5">Formal Station Response to Victim:</strong>
                            <p className="text-emerald-300">{comp.outcomeResponse}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Form to Update / Resolve Complaint */}
                    <form onSubmit={(e) => handleSaveResolution(e, comp.id)} className="space-y-4 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <ShieldCheck size={15} className="text-rose-400" />
                          <span>Record Supervisory Resolution & Action</span>
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          Supervisor: {commander.rank} {commander.fullName}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-300">
                          Update Complaint Status *
                        </label>
                        <select
                          value={activeHandlingStatus}
                          onChange={(e) => setActiveHandlingStatus(e.target.value as any)}
                          className="w-full sm:w-72 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                        >
                          <option value="Under Investigation">Under Investigation</option>
                          <option value="Action Taken">Action Taken (Disciplinary / Directives)</option>
                          <option value="Resolved">Resolved & Closed</option>
                          <option value="Pending Review">Pending Review</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-300">
                          Internal Supervisory Notes & Action Undertaken *
                        </label>
                        <textarea
                          value={commanderNotes}
                          onChange={(e) => setCommanderNotes(e.target.value)}
                          rows={2}
                          required
                          placeholder="e.g. Conducted interview with CSC shift commander; verified docket delay was due to magistrate signature turnaround; instructed detective to lodge interim briefing."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-300">
                          Formal Outcome Response (Transmitted to Complainant)
                        </label>
                        <textarea
                          value={outcomeResponse}
                          onChange={(e) => setOutcomeResponse(e.target.value)}
                          rows={2}
                          placeholder="Official station feedback communicated to the complainant explaining actions taken and providing direct supervisory reassurance."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Send size={14} />
                          <span>Save Supervisory Resolution</span>
                        </button>
                      </div>
                    </form>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
