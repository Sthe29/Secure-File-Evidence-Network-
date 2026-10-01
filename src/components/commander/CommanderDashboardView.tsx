import React from 'react';
import { UserProfile } from '../../types/auth';
import { DetectiveCaseDocket, SupervisorInstruction } from '../../types/detective';
import { StationComplaintRecord } from '../../types/commander';
import { 
  Briefcase, 
  UserPlus, 
  Clock, 
  ClipboardList, 
  ArrowRightLeft, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  FileText
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CommanderDashboardViewProps {
  commander: UserProfile;
  cases: DetectiveCaseDocket[];
  instructions: SupervisorInstruction[];
  complaints: StationComplaintRecord[];
  onOpenCase: (caseDocket: DetectiveCaseDocket, initialTab?: any) => void;
  onNavigateToCases: (filter?: string) => void;
  onNavigateToDetectives: () => void;
  onNavigateToComplaints: () => void;
  onOpenAssignModal: (caseDocket: DetectiveCaseDocket) => void;
}

export const CommanderDashboardView: React.FC<CommanderDashboardViewProps> = ({
  commander,
  cases,
  instructions,
  complaints,
  onOpenCase,
  onNavigateToCases,
  onNavigateToDetectives,
  onNavigateToComplaints,
  onOpenAssignModal
}) => {
  const { isDark } = useTheme();
  const today = new Date().toISOString().split('T')[0];

  const unassignedCases = cases.filter(
    c => !c.investigatingOfficerPersonnelNumber || c.investigatingOfficerName === 'Unassigned' || c.investigatingOfficerRank === 'Awaiting Allocation'
  );

  const casesRequiringReview = cases.filter(
    c => c.scheduledReviewDate && c.scheduledReviewDate <= today
  );

  const outstandingInstructions = instructions.filter(i => i.status === 'OUTSTANDING');

  const docketsAwaitingAck = cases.filter(
    c => !c.isCustodyAcknowledgedByDetective || c.custodyStatus === 'TRANSFERRED_AWAITING_RECEIPT'
  );

  const immediateAttentionCases = cases.filter(c => {
    const isUnassigned = !c.investigatingOfficerPersonnelNumber || c.investigatingOfficerName === 'Unassigned';
    const isCommanderCustodyPending = c.currentCustodianPersonnelNumber === commander.personnelNumber && !c.isCustodyAcknowledgedByDetective;
    const isReviewDue = c.scheduledReviewDate && c.scheduledReviewDate <= today;
    const isCritical = c.priorityLevel === 'Critical';
    return isUnassigned || isCommanderCustodyPending || isReviewDue || isCritical;
  });

  return (
    <div id="commander-dashboard-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Supervisory Command Overview
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {commander.rank} {commander.fullName} ({commander.personnelNumber}) • {commander.station || 'SAPS Berea Police Station'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateToCases('unassigned')}
            className={`px-3 py-1.5 border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              isDark 
                ? 'border-blue-600 text-blue-500 hover:bg-blue-600 hover:text-white' 
                : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
            }`}
          >
            <UserPlus size={14} />
            <span>Assign Dockets ({unassignedCases.length})</span>
          </button>
        </div>
      </div>

      {/* 5 Core Supervisory Operational Metric Cards (Boxes on Dashboard retained) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* 1. Cases Under Supervision */}
        <div 
          className={`p-4 rounded-md border flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Under Supervision</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <Briefcase size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {cases.length}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>cases</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              Station dockets
            </p>
          </div>
        </div>

        {/* 2. Cases Awaiting Detective Assignment */}
        <div 
          className={`p-4 rounded-md border flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Awaiting Assignment</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <UserPlus size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {unassignedCases.length}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>pending</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              Needs investigator
            </p>
          </div>
        </div>

        {/* 3. Cases Requiring Review */}
        <div 
          className={`p-4 rounded-md border flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Requiring Review</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {casesRequiringReview.length}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>due</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              Scheduled review date
            </p>
          </div>
        </div>

        {/* 4. Outstanding Supervisor Instructions */}
        <div 
          className={`p-4 rounded-md border flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Directives Issued</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <ClipboardList size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {outstandingInstructions.length}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>active</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              SAPS 5 instructions
            </p>
          </div>
        </div>

        {/* 5. Dockets Awaiting Acknowledgement */}
        <div 
          className={`p-4 rounded-md border flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Transfers Pending</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <ArrowRightLeft size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {docketsAwaitingAck.length}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>in-transit</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              Custody handover
            </p>
          </div>
        </div>

      </div>

      {/* CASES REQUIRING IMMEDIATE ATTENTION (Flat list separated by lines) */}
      <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-blue-600" />
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              Cases Requiring Immediate Attention ({immediateAttentionCases.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToCases('unassigned')}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-black/10'}`}>
          {immediateAttentionCases.slice(0, 5).map((c) => (
            <div key={c.caseNumber} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600">{c.caseNumber}</span>
                  <span className={`text-[10px] px-2 py-0.5 border font-semibold ${
                    c.priorityLevel === 'Critical'
                      ? 'bg-red-600 border-red-500 text-white'
                      : c.priorityLevel === 'Urgent'
                        ? (isDark ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-red-100 border-red-300 text-red-700')
                        : c.priorityLevel === 'High Priority'
                          ? (isDark ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-800')
                          : (isDark ? 'bg-slate-800/70 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-700')
                  }`}>
                    {c.priorityLevel}
                  </span>
                </div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>{c.incidentType}</p>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Complainant: {c.complainant.fullName} • Officer: {c.investigatingOfficerName}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenCase(c)}
                  className={`px-2.5 py-1 text-xs border transition-colors cursor-pointer ${
                    isDark ? 'border-white/20 text-white hover:bg-slate-900' : 'border-black/20 text-black hover:bg-slate-100'
                  }`}
                >
                  Supervise
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accountable Governance Footnote */}
      <div className={`p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isDark ? 'border-white/10 text-slate-400 bg-black' : 'border-black/10 text-slate-600 bg-white'
      }`}>
        <div className="flex items-center gap-3">
          <ShieldCheck size={16} className="text-blue-600 shrink-0" />
          <div>
            <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              SFEN Supervisory Accountability Framework
            </p>
            <p className="text-[11px]">
              No docket can be transferred or closed without documented supervisory oversight.
            </p>
          </div>
        </div>

        <div className="font-mono text-[11px] text-blue-600 shrink-0">
          <span>Commander Clearance: Level 3</span>
        </div>
      </div>

    </div>
  );
};
