import React, { useState } from 'react';
import { RegisteredCase } from '../../types/complainant';
import { UserProfile } from '../../types/auth';
import { 
  Briefcase, 
  Search, 
  Eye, 
  Calendar, 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  FileCheck2, 
  X,
  ArrowRightLeft
} from 'lucide-react';

interface OfficerRegisteredCasesViewProps {
  cases: RegisteredCase[];
  officer: UserProfile;
  onNavigateToDocketMovement?: () => void;
}

export const OfficerRegisteredCasesView: React.FC<OfficerRegisteredCasesViewProps> = ({
  cases,
  officer,
  onNavigateToDocketMovement
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<RegisteredCase | null>(null);

  const filteredCases = cases.filter((c) => {
    return (
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.incidentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.reportReference && c.reportReference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.currentStatus.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Case Registered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Case Registered
          </span>
        );
      case 'Investigation Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Investigation Active
          </span>
        );
      case 'Docket at NPA / Court':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Docket at NPA / Court
          </span>
        );
      case 'Case Finalized':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 size={12} className="text-emerald-400" />
            Finalized
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="officer-registered-cases-view" className="space-y-6">
      
      {/* Floating Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Registered Crime Cases
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official police CAS dockets registered through {officer.station || 'SAPS Sandton Police Station'} • Frontline crime registry
          </p>
        </div>

        {onNavigateToDocketMovement && (
          <button
            type="button"
            onClick={onNavigateToDocketMovement}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <ArrowRightLeft size={15} />
            <span>Docket Movement Register</span>
          </button>
        )}
      </div>

      {/* Search and Context Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search CAS number, crime type, or report reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-bold text-white">
            {filteredCases.length} Dockets
          </span>
        </div>
      </div>

      {/* Role Boundary Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck size={18} className="text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-white">CSC Registration Overview & Chain of Custody</p>
          <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
            As a CSC frontline officer, your responsibility is confirming correct registration and initiating docket movement. Subpoenas, forensic analysis, and investigative logs are conducted inside the Detective Branch workspace.
          </p>
        </div>
      </div>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <Briefcase size={36} className="text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No registered cases found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? 'Try changing your search terms.' : 'Cases will appear here once you or your station colleagues complete official case registration from online reports.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-850/80 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800">
                    {c.caseNumber}
                  </span>
                  {c.reportReference && (
                    <span className="font-mono text-[11px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                      Linked: {c.reportReference}
                    </span>
                  )}
                  {getStatusBadge(c.currentStatus)}
                </div>

                <div className="space-y-0.5">
                  <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-blue-300 transition-colors">
                    {c.incidentType}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {c.lastUpdateSummary}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-slate-500" />
                    <span>Registered: {c.dateRegistered}</span>
                  </span>
                  <span>•</span>
                  <span>Station: {c.policeStation}</span>
                  <span>•</span>
                  <span className="text-slate-300 font-medium">Assigned: {c.investigatingOfficer}</span>
                </div>
              </div>

              {/* View Action */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 group-hover:border-blue-500/50 group-hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye size={13} />
                  <span>View Registration Record</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CASE REGISTRATION DETAILS MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl my-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Official Case Registration Record
                  </h3>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {selectedCase.caseNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Registered under Criminal Procedure Act • {selectedCase.policeStation}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-mono">Current Judicial Status</span>
                  <span className="text-sm font-bold text-white">{selectedCase.currentStatus}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-mono">Registered Date</span>
                  <span className="text-xs font-mono text-slate-300">{selectedCase.dateRegistered}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-mono">Assigned Branch Officer</span>
                  <span className="text-xs font-medium text-blue-300">{selectedCase.investigatingOfficer}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Incident Details</h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Offence Classification:</span>
                    <span className="font-bold text-white">{selectedCase.incidentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Police Station:</span>
                    <span className="text-white">{selectedCase.policeStation}</span>
                  </div>
                  {selectedCase.reportReference && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Linked Online Report:</span>
                      <span className="font-mono text-purple-300 font-bold">{selectedCase.reportReference}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Investigator Rank:</span>
                    <span className="font-mono text-slate-300">{selectedCase.officerRank || 'Detective Sergeant'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Case Docket Summary</h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {selectedCase.lastUpdateSummary}
                </div>
              </div>

              {/* Docket Transfer Prompt */}
              {onNavigateToDocketMovement && (
                <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">Physical & Digital Docket Movement</p>
                    <p className="text-[11px] text-slate-400">Transfer this docket to Detective Branch or specialist branch.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCase(null);
                      onNavigateToDocketMovement();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    <ArrowRightLeft size={13} />
                    <span>Transfer Docket</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
