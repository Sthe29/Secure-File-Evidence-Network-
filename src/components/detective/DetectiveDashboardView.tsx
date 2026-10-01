import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { DetectiveCaseDocket, SupervisorInstruction, CaseWorkspaceTab } from '../../types/detective';
import { 
  Briefcase, 
  ClipboardList, 
  AlertTriangle, 
  ShieldCheck, 
  Lock,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface DetectiveDashboardViewProps {
  detective: UserProfile;
  cases: DetectiveCaseDocket[];
  instructions: SupervisorInstruction[];
  onOpenCase: (caseData: DetectiveCaseDocket, initialTab?: CaseWorkspaceTab) => void;
  onNavigateToCases: (subTab?: 'cases' | 'directives') => void;
  onNavigateToInstructions: () => void;
}

export const DetectiveDashboardView: React.FC<DetectiveDashboardViewProps> = ({
  detective,
  cases,
  instructions,
  onOpenCase,
  onNavigateToCases,
  onNavigateToInstructions
}) => {
  const { isDark } = useTheme();
  const [isRecentActivityOpen, setIsRecentActivityOpen] = useState(false);
  const [isDirectivesOpen, setIsDirectivesOpen] = useState(false);

  // Cases requiring attention
  const casesRequiringAttention = cases.filter(
    c => !c.isCustodyAcknowledgedByDetective || c.priorityLevel === 'Urgent' || c.priorityLevel === 'Critical'
  );

  const outstandingInstructions = instructions.filter(i => i.status === 'OUTSTANDING');
  const finalizedCases = cases.filter(c => c.currentStatus === 'Case Finalized' || c.currentStatus === 'Docket at NPA / Court');

  const recentCases = [...cases].sort(
    (a, b) => new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime()
  ).slice(0, 4);

  return (
    <div id="detective-dashboard-view" className="space-y-6">
      
      {/* Header */}
      <div className="pt-1 pb-1">
        <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
          Detective Workspace Overview
        </h1>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {detective.rank} {detective.fullName} ({detective.personnelNumber}) • {detective.division || 'Commercial Crime & Serious Offence Desk'}
        </p>
      </div>

      {/* 4 Core Operational Metric KPI Boxes (Dashboard boxes retained) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Assigned Cases */}
        <div 
          className={`p-4 rounded-md border flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Assigned Dockets</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <Briefcase size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {cases.length}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>dockets</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              Allocated to your desk
            </p>
          </div>
        </div>

        {/* 2. Requiring Attention */}
        <div 
          className={`p-4 rounded-md border flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Requiring Attention</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {casesRequiringAttention.length}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>actions</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              Receipts or urgent priority
            </p>
          </div>
        </div>

        {/* 3. Outstanding Supervisor Directives */}
        <div 
          className={`p-4 rounded-md border flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Directives</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <ClipboardList size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {outstandingInstructions.length}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>outstanding</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              Commander instructions
            </p>
          </div>
        </div>

        {/* 4. Court Ready / Finalized */}
        <div 
          className={`p-4 rounded-md border flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>NPA / Court Ready</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <FileCheck2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {finalizedCases.length}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>advanced</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              Completed investigations
            </p>
          </div>
        </div>

      </div>

      {/* Expandable Sections (Separated by clean lines) */}
      <div className={`space-y-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        
        {/* Accordion 1: Recent Docket Activity */}
        <div className={`border transition-colors ${
          isDark ? 'border-white/10 bg-black' : 'border-black/10 bg-white'
        }`}>
          <button
            type="button"
            onClick={() => setIsRecentActivityOpen(!isRecentActivityOpen)}
            className={`w-full p-4 flex items-center justify-between text-left transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase size={16} className="text-blue-600" />
              <div>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                  Recent Docket Activity & Custody Status
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {recentCases.length} dockets recently updated or transferred
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isRecentActivityOpen ? 'Collapse' : 'Expand'}
              </span>
              {isRecentActivityOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {isRecentActivityOpen && (
            <div className={`p-4 border-t divide-y ${
              isDark ? 'border-white/10 divide-white/10' : 'border-black/10 divide-black/10'
            }`}>
              {recentCases.map((c) => (
                <div 
                  key={c.caseNumber} 
                  onClick={() => onOpenCase(c)}
                  className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs cursor-pointer ${
                    isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600">{c.caseNumber}</span>
                      <span className={`text-[10px] px-2 py-0.5 border ${
                        isDark ? 'border-white/20 text-slate-300' : 'border-black/20 text-slate-700'
                      }`}>
                        {c.currentStatus}
                      </span>
                    </div>
                    <p className={`mt-1 font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{c.incidentType}</p>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Complainant: {c.complainant.fullName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1">
                      <span>Open Workspace</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accordion 2: Supervisor Directives */}
        <div className={`border transition-colors ${
          isDark ? 'border-white/10 bg-black' : 'border-black/10 bg-white'
        }`}>
          <button
            type="button"
            onClick={() => setIsDirectivesOpen(!isDirectivesOpen)}
            className={`w-full p-4 flex items-center justify-between text-left transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <ClipboardList size={16} className="text-blue-600" />
              <div>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                  Supervisor Directives & Inspection Review
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {outstandingInstructions.length} instructions requiring investigation response
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isDirectivesOpen ? 'Collapse' : 'Expand'}
              </span>
              {isDirectivesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {isDirectivesOpen && (
            <div className={`p-4 border-t divide-y ${
              isDark ? 'border-white/10 divide-white/10' : 'border-black/10 divide-black/10'
            }`}>
              {instructions.slice(0, 5).map((inst) => (
                <div key={inst.id} className="py-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-600">{inst.caseNumber}</span>
                    <span className={`text-[10px] px-2 py-0.5 border ${
                      inst.status === 'OUTSTANDING'
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : isDark ? 'border-white/20 text-slate-400' : 'border-black/20 text-slate-600'
                    }`}>
                      {inst.status}
                    </span>
                  </div>
                  <p className={isDark ? 'text-white' : 'text-black'}>{inst.instructionText}</p>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Issued by: {inst.issuedByRank} {inst.issuedBy} • Due: {inst.requiredReviewDate || 'Immediate'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Accountability Principle Banner - clean line separated */}
      <div className={`p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isDark ? 'border-white/10 text-slate-400 bg-black' : 'border-black/10 text-slate-600 bg-white'
      }`}>
        <div className="flex items-center gap-3">
          <Lock size={16} className="text-blue-600 shrink-0" />
          <div>
            <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              SFEN Custody & Tamper-Evident Accountability
            </p>
            <p className="text-[11px]">
              All docket actions, statements, and movement handovers are cryptographically logged.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px] text-blue-600 shrink-0">
          <ShieldCheck size={14} />
          <span>Active CID ID: {detective.personnelNumber}</span>
        </div>
      </div>

    </div>
  );
};
