import React, { useState } from 'react';
import { SupervisorInstruction, DetectiveCaseDocket } from '../../types/detective';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  ArrowRight
} from 'lucide-react';

interface DetectiveInstructionsViewProps {
  instructions: SupervisorInstruction[];
  cases: DetectiveCaseDocket[];
  onOpenCaseToInstructions: (caseData: DetectiveCaseDocket) => void;
}

export const DetectiveInstructionsView: React.FC<DetectiveInstructionsViewProps> = ({
  instructions,
  cases,
  onOpenCaseToInstructions
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OUTSTANDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInstructions = instructions.filter(i => {
    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    const matchesSearch = 
      i.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.instructionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.issuedBy.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const outstandingCount = instructions.filter(i => i.status === 'OUTSTANDING').length;
  const inProgressCount = instructions.filter(i => i.status === 'IN_PROGRESS').length;

  return (
    <div id="detective-instructions-view" className="space-y-6">
      
      {/* Floating Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Supervisor & Commander Directives
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory directives and SAPS 5 docket instructions issued by branch commanders and supervisors
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
            {outstandingCount} Outstanding
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/30">
            {inProgressCount} In Progress
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by case number, instruction directive, or supervisor..."
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
            <option value="ALL">All Directive Statuses</option>
            <option value="OUTSTANDING">Outstanding</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* INSTRUCTIONS LIST */}
      {filteredInstructions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
          <ClipboardList size={32} className="text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">No directives found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery 
              ? 'No instructions match your search criteria.' 
              : 'There are currently no supervisor directives on your assigned dockets.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInstructions.map((inst) => {
            const matchedCase = cases.find(c => c.caseNumber === inst.caseNumber);

            return (
              <div
                key={inst.id}
                onClick={() => {
                  if (matchedCase) onOpenCaseToInstructions(matchedCase);
                }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer space-y-3 group ${
                  inst.status === 'COMPLETED'
                    ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                    : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs sm:text-sm font-bold text-amber-300">
                      {inst.caseNumber}
                    </span>
                    {inst.offenceCategory && (
                      <span className="text-xs text-slate-400">
                        • {inst.offenceCategory}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inst.status === 'COMPLETED'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : inst.status === 'IN_PROGRESS'
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {inst.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Issued by: {inst.issuedByRank} {inst.issuedBy} ({inst.issuedByPersonnelNumber})
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                    "{inst.instructionText}"
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span>Issued: {new Date(inst.issuedAt).toLocaleDateString()}</span>
                    {inst.requiredReviewDate && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400 font-semibold">Review Due: {inst.requiredReviewDate}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all">
                    <span>Open Case to Respond</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
