import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { CommanderDetectiveWorkload, StationComplaintRecord } from '../../types/commander';
import { DetectiveCaseDocket } from '../../types/detective';
import { CommanderDetectivesView } from './CommanderDetectivesView';
import { CommanderComplaintsView } from './CommanderComplaintsView';
import { Users, AlertCircle } from 'lucide-react';

interface CommanderDetectivesAndComplaintsViewProps {
  commander: UserProfile;
  detectivesWorkload: CommanderDetectiveWorkload[];
  complaints: StationComplaintRecord[];
  cases: DetectiveCaseDocket[];
  initialSubTab?: 'detectives' | 'complaints';
  onOpenCase: (caseDocket: DetectiveCaseDocket, initialTab?: any) => void;
  onOpenCaseByNumber?: (caseNumber: string) => void;
  onFilterCasesByDetective: (detectivePersonnelNumber: string) => void;
  onRefreshComplaints: () => void;
}

export const CommanderDetectivesAndComplaintsView: React.FC<CommanderDetectivesAndComplaintsViewProps> = ({
  commander,
  detectivesWorkload,
  complaints,
  cases,
  initialSubTab = 'detectives',
  onOpenCase,
  onOpenCaseByNumber,
  onFilterCasesByDetective,
  onRefreshComplaints
}) => {
  const [subTab, setSubTab] = useState<'detectives' | 'complaints'>(initialSubTab);

  const pendingComplaintsCount = complaints.filter(
    c => c.status === 'Pending Review' || c.status === 'Under Investigation'
  ).length;

  return (
    <div id="commander-detectives-and-complaints-view" className="space-y-6">
      
      {/* Combined Header & Sub-Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Personnel & Grievances Oversight
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Supervise CID detective caseload allocations alongside citizen service delivery complaints
          </p>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <button
            type="button"
            id="btn-subtab-detectives"
            onClick={() => setSubTab('detectives')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'detectives'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users size={15} />
            <span>Detectives</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
              subTab === 'detectives' ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {detectivesWorkload.length}
            </span>
          </button>

          <button
            type="button"
            id="btn-subtab-complaints"
            onClick={() => setSubTab('complaints')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'complaints'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <AlertCircle size={15} />
            <span>Complaints</span>
            {pendingComplaintsCount > 0 ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold ">
                {pendingComplaintsCount} new
              </span>
            ) : (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                subTab === 'complaints' ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {complaints.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Dynamic Sub-View Render */}
      {subTab === 'detectives' && (
        <CommanderDetectivesView
          detectivesWorkload={detectivesWorkload}
          cases={cases}
          onOpenCase={onOpenCase}
          onFilterCasesByDetective={onFilterCasesByDetective}
        />
      )}

      {subTab === 'complaints' && (
        <CommanderComplaintsView
          commander={commander}
          complaints={complaints}
          onOpenCaseByNumber={onOpenCaseByNumber}
          onRefreshComplaints={onRefreshComplaints}
        />
      )}
    </div>
  );
};
