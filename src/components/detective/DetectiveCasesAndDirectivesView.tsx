import React, { useState } from 'react';
import { DetectiveCaseDocket, SupervisorInstruction, CaseWorkspaceTab } from '../../types/detective';
import { 
  Briefcase, 
  Search, 
  Filter, 
  ArrowRight, 
  Calendar, 
  Clock, 
  FolderOpen
} from 'lucide-react';

interface DetectiveCasesAndDirectivesViewProps {
  cases: DetectiveCaseDocket[];
  instructions: SupervisorInstruction[];
  onOpenCase: (caseData: DetectiveCaseDocket, initialTab?: CaseWorkspaceTab) => void;
  initialSubTab?: 'cases' | 'directives';
}

export const DetectiveCasesAndDirectivesView: React.FC<DetectiveCasesAndDirectivesViewProps> = ({
  cases,
  instructions,
  onOpenCase
}) => {
  // Search & Filter state for Cases
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [caseStatusFilter, setCaseStatusFilter] = useState<'ALL' | 'Investigation Active' | 'Evidence Analysis' | 'Docket at NPA / Court' | 'Case Finalized'>('ALL');

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.caseNumber.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
      c.incidentType.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
      c.complainant.fullName.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
      (c.reportReference && c.reportReference.toLowerCase().includes(caseSearchQuery.toLowerCase()));

    const matchesStatus = caseStatusFilter === 'ALL' || c.currentStatus === caseStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const casesNeedingCustodyAckCount = cases.filter(c => !c.isCustodyAcknowledgedByDetective).length;

  return (
    <div id="detective-cases-view" className="space-y-6">
      
      {/* Floating Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Assigned Dockets
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Criminal Investigation Directorate (CID) dockets assigned to your desk for active investigation
          </p>
        </div>

        {/* Quick Statistics */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            {cases.length} {cases.length === 1 ? 'Docket' : 'Dockets'}
          </span>
          {casesNeedingCustodyAckCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs font-mono">
              {casesNeedingCustodyAckCount} Receipt Pending
            </span>
          )}
        </div>
      </div>

      {/* ================= ASSIGNED CASES ================= */}
      <div className="space-y-4">
        {/* Filter & Search for Cases */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={caseSearchQuery}
              onChange={(e) => setCaseSearchQuery(e.target.value)}
              placeholder="Search dockets by CAS number (e.g. CAS 342), offence, complainant..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={caseStatusFilter}
              onChange={(e) => setCaseStatusFilter(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">All Case Phases</option>
              <option value="Investigation Active">Investigation Active</option>
              <option value="Evidence Analysis">Evidence Analysis</option>
              <option value="Docket at NPA / Court">Docket at NPA / Court</option>
              <option value="Case Finalized">Case Finalized</option>
            </select>
          </div>
        </div>

        {filteredCases.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
            <Briefcase size={32} className="text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No assigned cases found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {caseSearchQuery 
                ? 'No assigned dockets match your search query.'
                : 'You currently have no investigation cases assigned to your personnel profile.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCases.map((c) => {
              const needsCustodyAck = !c.isCustodyAcknowledgedByDetective;
              const caseDirectives = instructions.filter(i => i.caseNumber === c.caseNumber);
              const pendingDirectives = caseDirectives.filter(i => i.status === 'OUTSTANDING');

              return (
                <div
                  key={c.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                    needsCustodyAck
                      ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {/* Essential Info Left */}
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-sm sm:text-base font-bold text-amber-300">
                        {c.caseNumber}
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {c.currentStatus}
                      </span>

                      {needsCustodyAck && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 ">
                          Awaiting Your Receipt
                        </span>
                      )}

                      {pendingDirectives.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onOpenCase(c, 'instructions')}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 cursor-pointer transition-colors"
                        >
                          {pendingDirectives.length} Directive{pendingDirectives.length > 1 ? 's' : ''}
                        </button>
                      )}

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.priorityLevel === 'Critical' || c.priorityLevel === 'Urgent'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {c.priorityLevel}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                        {c.incidentType}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        Complainant: <strong className="text-slate-300">{c.complainant.fullName}</strong> • Contact: {c.complainant.phoneNumber}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-500" />
                        <span>Registered: {new Date(c.dateReported).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-500" />
                        <span>Last activity: {new Date(c.lastActivityDate).toLocaleDateString()}</span>
                      </span>
                      {c.policeStation && (
                        <span className="flex items-center gap-1">
                          <FolderOpen size={12} className="text-slate-500" />
                          <span>Station: {c.policeStation}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      id={`btn-open-workspace-${c.caseNumber}`}
                      onClick={() => onOpenCase(c, 'overview')}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>Open Docket</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
