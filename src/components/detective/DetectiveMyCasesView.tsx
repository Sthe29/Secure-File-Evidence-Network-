import React, { useState } from 'react';
import { DetectiveCaseDocket } from '../../types/detective';
import { 
  Briefcase, 
  Search, 
  Filter, 
  ArrowRight, 
  Calendar, 
  Clock, 
  FolderOpen
} from 'lucide-react';

interface DetectiveMyCasesViewProps {
  cases: DetectiveCaseDocket[];
  onOpenCase: (caseData: DetectiveCaseDocket) => void;
}

export const DetectiveMyCasesView: React.FC<DetectiveMyCasesViewProps> = ({
  cases,
  onOpenCase
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Investigation Active' | 'Evidence Analysis' | 'Docket at NPA / Court' | 'Case Finalized'>('ALL');

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.incidentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.complainant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.reportReference && c.reportReference.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || c.currentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div id="detective-my-cases-view" className="space-y-6">
      
      {/* Floating Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Assigned Cases
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Confidential case dockets allocated strictly to your personnel ID • Cryptographically sealed evidence records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            {cases.length} Allocated {cases.length === 1 ? 'Docket' : 'Dockets'}
          </span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by CAS number (e.g. CAS 342), offence, or complainant..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
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

      {/* CASES LIST: INITIAL VIEW SHOWS ONLY ESSENTIAL INFORMATION AS REQUIRED */}
      {filteredCases.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
          <Briefcase size={32} className="text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">No assigned cases found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery 
              ? 'No assigned dockets match your search query.'
              : 'You currently have no investigation cases assigned to your personnel profile.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCases.map((c) => {
            const needsCustodyAck = !c.isCustodyAcknowledgedByDetective;

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

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.priorityLevel === 'Urgent' || c.priorityLevel === 'Critical'
                        ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {c.priorityLevel} Priority
                    </span>
                  </div>

                  {/* Offence / Category */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {c.incidentType}
                    </h3>
                    {c.offenceSubcategory && (
                      <p className="text-xs text-slate-400 truncate">
                        {c.offenceSubcategory}
                      </p>
                    )}
                  </div>

                  {/* Date Assigned & Date of Last Activity (Essential fields requested) */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-500" />
                      Date Assigned: <strong className="text-slate-300">{c.assignedDate}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-slate-500" />
                      Last Activity: <strong className="text-slate-300">{c.lastActivityDate}</strong>
                    </span>
                  </div>
                </div>

                {/* Right: Open Case Action */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  <button
                    type="button"
                    id={`btn-open-case-${c.caseNumber.replace(/[^a-zA-Z0-9]/g, '-')}`}
                    onClick={() => onOpenCase(c)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <FolderOpen size={15} />
                    <span>Open Case</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
