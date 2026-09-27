import React, { useState, useMemo } from 'react';
import { DetectiveCaseDocket } from '../../types/detective';
import { 
  Search, 
  Filter, 
  Briefcase, 
  UserPlus, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  FolderOpen,
  Calendar,
  UserCheck
} from 'lucide-react';

interface CommanderCasesViewProps {
  cases: DetectiveCaseDocket[];
  initialFilter?: string;
  onOpenCase: (caseDocket: DetectiveCaseDocket, initialTab?: any) => void;
  onOpenAssignModal: (caseDocket: DetectiveCaseDocket) => void;
}

export const CommanderCasesView: React.FC<CommanderCasesViewProps> = ({
  cases,
  initialFilter = 'all',
  onOpenCase,
  onOpenAssignModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);

  const today = new Date().toISOString().split('T')[0];

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Search query filter
      const matchesSearch = 
        c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.incidentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.investigatingOfficerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.complainant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.currentCustodianName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Status filters
      if (statusFilter === 'unassigned') {
        return !c.investigatingOfficerPersonnelNumber || c.investigatingOfficerName === 'Unassigned' || c.investigatingOfficerRank === 'Awaiting Allocation';
      }
      if (statusFilter === 'active') {
        return c.currentStatus === 'Investigation Active' || c.currentStatus === 'Evidence Analysis';
      }
      if (statusFilter === 'review_due') {
        return c.scheduledReviewDate && c.scheduledReviewDate <= today;
      }
      if (statusFilter === 'awaiting_ack') {
        return !c.isCustodyAcknowledgedByDetective || c.custodyStatus === 'TRANSFERRED_AWAITING_RECEIPT';
      }
      if (statusFilter === 'court_npa') {
        return c.currentStatus === 'Docket at NPA / Court' || c.currentStatus === 'Case Finalized';
      }

      return true;
    });
  }, [cases, searchQuery, statusFilter, today]);

  const unassignedCount = cases.filter(
    c => !c.investigatingOfficerPersonnelNumber || c.investigatingOfficerName === 'Unassigned'
  ).length;

  const reviewDueCount = cases.filter(
    c => c.scheduledReviewDate && c.scheduledReviewDate <= today
  ).length;

  const awaitingAckCount = cases.filter(
    c => !c.isCustodyAcknowledgedByDetective || c.custodyStatus === 'TRANSFERRED_AWAITING_RECEIPT'
  ).length;

  return (
    <div id="commander-cases-view" className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Station Case Supervision & Dockets
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Supervise case progression, verify docket custody, and inspect investigation integrity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            Showing <strong className="text-white">{filteredCases.length}</strong> of {cases.length} dockets
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Simple Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'all', label: 'All Cases', count: cases.length },
            { id: 'unassigned', label: 'Awaiting Assignment', count: unassignedCount, highlight: unassignedCount > 0 },
            { id: 'active', label: 'Active Investigation', count: cases.filter(c => c.currentStatus === 'Investigation Active' || c.currentStatus === 'Evidence Analysis').length },
            { id: 'review_due', label: 'Requiring Review', count: reviewDueCount, highlight: reviewDueCount > 0 },
            { id: 'awaiting_ack', label: 'Awaiting Acknowledgement', count: awaitingAckCount },
            { id: 'court_npa', label: 'Court / NPA Ready', count: cases.filter(c => c.currentStatus === 'Docket at NPA / Court' || c.currentStatus === 'Case Finalized').length }
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  tab.highlight && !isActive
                    ? 'bg-amber-500/20 text-amber-300 font-bold'
                    : isActive
                    ? 'bg-emerald-500/30 text-emerald-200'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search CAS, crime, officer..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>

      </div>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <Briefcase size={36} className="text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No matching dockets found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or switching to another filter state above.
          </p>
          {statusFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-semibold transition-colors cursor-pointer"
            >
              Reset to All Cases
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCases.map((c) => {
            const isUnassigned = !c.investigatingOfficerPersonnelNumber || c.investigatingOfficerName === 'Unassigned';
            const isAwaitingAck = !c.isCustodyAcknowledgedByDetective;
            const isReviewDue = c.scheduledReviewDate && c.scheduledReviewDate <= today;

            return (
              <div
                key={c.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
              >
                {/* Left Case Core Information */}
                <div className="space-y-2 min-w-0 flex-1">
                  
                  {/* Top Bar: CAS Reference, Offence Type & Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-amber-300">
                      {c.caseNumber}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {c.incidentType}
                    </span>
                    {c.offenceSubcategory && (
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        • {c.offenceSubcategory}
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                      c.currentStatus === 'Case Finalized' || c.currentStatus === 'Docket at NPA / Court'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                    }`}>
                      {c.currentStatus}
                    </span>

                    {isUnassigned ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Unassigned - Action Required
                      </span>
                    ) : isAwaitingAck ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Awaiting Custody Acknowledgement
                      </span>
                    ) : null}

                    {isReviewDue && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Review Due
                      </span>
                    )}
                  </div>

                  {/* Complainant & Incident Location */}
                  <p className="text-xs text-slate-400">
                    Complainant: <strong className="text-slate-300 font-semibold">{c.complainant.fullName}</strong> • Loc: {c.incidentLocation.address}, {c.incidentLocation.suburb}
                  </p>

                  {/* Bottom Line: Assigned Detective, Current Custodian, Last Activity */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                    <div>
                      <span>Investigating Officer: </span>
                      <strong className={isUnassigned ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                        {c.investigatingOfficerName}
                      </strong>
                    </div>

                    <span>•</span>

                    <div>
                      <span>Current Custodian: </span>
                      <strong className="text-emerald-400 font-bold">
                        {c.currentCustodianName}
                      </strong>
                    </div>

                    <span>•</span>

                    <div>
                      <span>Last Activity: </span>
                      <span className="text-slate-300">{c.lastActivityDate}</span>
                    </div>

                    {c.scheduledReviewDate && (
                      <>
                        <span>•</span>
                        <div>
                          <span>Next Review: </span>
                          <span className={isReviewDue ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                            {c.scheduledReviewDate}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  {isUnassigned && (
                    <button
                      type="button"
                      onClick={() => onOpenAssignModal(c)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <UserPlus size={14} />
                      <span>Assign Detective</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenCase(c, 'overview')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-700/80"
                  >
                    <FolderOpen size={14} className="text-emerald-400" />
                    <span>Open Docket Workspace</span>
                    <ArrowRight size={13} className="text-slate-400" />
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
