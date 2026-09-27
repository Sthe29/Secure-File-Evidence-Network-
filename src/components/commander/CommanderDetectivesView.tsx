import React, { useState } from 'react';
import { CommanderDetectiveWorkload } from '../../types/commander';
import { DetectiveCaseDocket } from '../../types/detective';
import { 
  Users, 
  Briefcase, 
  Clock, 
  ClipboardList, 
  Mail, 
  Phone, 
  FolderOpen, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface CommanderDetectivesViewProps {
  detectivesWorkload: CommanderDetectiveWorkload[];
  cases: DetectiveCaseDocket[];
  onOpenCase: (caseDocket: DetectiveCaseDocket, initialTab?: any) => void;
  onFilterCasesByDetective: (detectivePersonnelNumber: string) => void;
}

export const CommanderDetectivesView: React.FC<CommanderDetectivesViewProps> = ({
  detectivesWorkload,
  cases,
  onOpenCase,
  onFilterCasesByDetective
}) => {
  const [selectedDetectiveNumber, setSelectedDetectiveNumber] = useState<string | null>(null);

  const selectedWorkload = detectivesWorkload.find(
    w => w.detective.personnelNumber === selectedDetectiveNumber
  );

  const selectedDetectiveCases = selectedDetectiveNumber
    ? cases.filter(c => c.investigatingOfficerPersonnelNumber === selectedDetectiveNumber)
    : [];

  return (
    <div id="commander-detectives-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Station Detectives & Workload Supervision
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Supervise investigating officer caseloads, pending directives, and docket custody under station command
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            <strong className="text-emerald-400">{detectivesWorkload.length}</strong> Authorized Investigating Officers
          </span>
        </div>
      </div>

      {/* Detectives Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {detectivesWorkload.map((item) => {
          const det = item.detective;
          const isSelected = selectedDetectiveNumber === det.personnelNumber;

          return (
            <div
              key={det.personnelNumber}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500/50 shadow-md'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top details */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-bold flex items-center justify-center text-sm font-mono">
                      {det.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{det.rank} {det.fullName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300">
                          {det.personnelNumber}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        {det.division}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {det.status}
                  </span>
                </div>

                {/* Specialization & Contact */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  <div className="text-slate-300">
                    <strong className="text-slate-400">Focus:</strong> {det.specialization}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Phone size={11} className="text-slate-500" />
                      <span>{det.phone}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail size={11} className="text-slate-500" />
                      <span>{det.email}</span>
                    </span>
                  </div>
                </div>

                {/* Workload Metrics (Clean supervision, no gamified ranking) */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Active Cases</span>
                    <strong className="text-sm font-bold font-mono text-white">
                      {item.activeAssignedCasesCount}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Pending Directives</span>
                    <strong className={`text-sm font-bold font-mono ${item.outstandingDirectivesCount > 0 ? 'text-purple-400' : 'text-slate-400'}`}>
                      {item.outstandingDirectivesCount}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Reviews Due</span>
                    <strong className={`text-sm font-bold font-mono ${item.casesRequiringReviewCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {item.casesRequiringReviewCount}
                    </strong>
                  </div>
                </div>

                {item.unacknowledgedDocketsCount > 0 && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
                    <AlertTriangle size={13} className="shrink-0" />
                    <span>{item.unacknowledgedDocketsCount} docket transfer(s) awaiting detective receipt signature.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDetectiveNumber(
                      selectedDetectiveNumber === det.personnelNumber ? null : det.personnelNumber
                    );
                  }}
                  className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{isSelected ? 'Hide Case List' : 'Inspect Active Dockets'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onFilterCasesByDetective(det.personnelNumber)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  <Briefcase size={13} className="text-emerald-400" />
                  <span>View in Cases</span>
                  <ArrowRight size={12} className="text-slate-400" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Selected Detective Docket Breakdown */}
      {selectedWorkload && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Dockets Allocated to {selectedWorkload.detective.rank} {selectedWorkload.detective.fullName}</span>
                <span className="text-xs font-mono text-amber-400">
                  ({selectedDetectiveCases.length} dockets)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Click any docket to open the supervisory workspace
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDetectiveNumber(null)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>

          {selectedDetectiveCases.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No active cases currently allocated to this detective.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedDetectiveCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onOpenCase(c, 'overview')}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-850 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-300">
                      {c.caseNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {c.currentStatus}
                    </span>
                  </div>

                  <p className="text-xs text-white font-semibold truncate">
                    {c.incidentType}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                    <span>Custodian: {c.currentCustodianName.split(' ')[0]}</span>
                    <span>Last Act: {c.lastActivityDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
