import React, { useState } from 'react';
import { RegisteredCase, ComplainantTab } from '../../types/complainant';
import { 
  Briefcase, 
  Search, 
  Calendar, 
  Building2, 
  Clock, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  FileText,
  UserCheck,
  Scale
} from 'lucide-react';

interface MyCasesViewProps {
  cases: RegisteredCase[];
  onNavigate: (tab: ComplainantTab) => void;
}

export const MyCasesView: React.FC<MyCasesViewProps> = ({ cases, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [detailCase, setDetailCase] = useState<RegisteredCase | null>(null);

  const filteredCases = cases.filter((c) => {
    return (
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.incidentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.policeStation.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div id="my-cases-view" className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            My Registered Cases
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track official police case dockets (CAS) and ongoing investigation progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('my-reports')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 self-start sm:self-center cursor-pointer"
        >
          <FileText size={15} />
          <span>View Online Reports</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search by CAS number, incident type, or police station..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Briefcase size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-300">No registered police cases found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery 
              ? 'No cases match your search keywords.' 
              : 'When an online report is verified and accepted at the station, the official CAS docket will appear here.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('my-reports')}
            className="text-xs font-bold text-blue-400 hover:underline cursor-pointer"
          >
            Check your submitted incident reports →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5 group"
            >
              {/* Row 1: CAS Number, Status Badge, and Incident Type */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono font-extrabold text-sm text-blue-400">
                    {c.caseNumber}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-semibold">
                    {c.currentStatus}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {c.incidentType}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar size={13} className="text-slate-500" />
                    <span>Registered: {c.dateRegistered}</span>
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">
                    Last Updated: <strong className="text-slate-300 font-mono">{c.lastUpdateDate}</strong>
                  </span>
                </div>
              </div>

              {/* Row 2: Police Station & View Case Progress Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Building2 size={14} className="text-blue-400 shrink-0" />
                  <span className="font-semibold text-slate-200">{c.policeStation}</span>
                </div>

                <button
                  type="button"
                  id={`btn-view-case-${c.id}`}
                  onClick={() => setDetailCase(c)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
                >
                  <span>View Case Progress</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Case Details & Progress Modal */}
      {detailCase && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto space-y-5">
            <button
              type="button"
              onClick={() => setDetailCase(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-extrabold text-lg text-blue-400">
                  {detailCase.caseNumber}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-semibold">
                  {detailCase.currentStatus}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                {detailCase.incidentType} • {detailCase.policeStation}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Registered on {detailCase.dateRegistered} • Last updated {detailCase.lastUpdateDate}
              </p>
            </div>

            {/* Officer & Dates Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5 font-semibold">
                  <UserCheck size={13} className="text-blue-400" />
                  <span>Investigating Officer</span>
                </span>
                <p className="text-white font-medium">
                  {detailCase.investigatingOfficer}
                </p>
                <p className="text-[11px] text-slate-400">
                  Rank: {detailCase.officerRank}
                </p>
              </div>

              {detailCase.nextCourtDate ? (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                  <span className="text-emerald-300 text-[11px] flex items-center gap-1.5 font-semibold">
                    <Scale size={13} className="text-emerald-400" />
                    <span>Court Appearance</span>
                  </span>
                  <p className="text-white font-medium font-mono">
                    {detailCase.nextCourtDate}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Scheduled judicial appearance
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1.5 font-semibold">
                    <Clock size={13} className="text-blue-400" />
                    <span>Current Stage</span>
                  </span>
                  <p className="text-white font-medium">
                    Stage {detailCase.progressStage} of 5
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {detailCase.currentStatus}
                  </p>
                </div>
              )}
            </div>

            {/* Latest Progress Brief */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Clock size={14} className="text-blue-400" />
                <span>Investigation Progress Brief</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {detailCase.lastUpdateSummary}
              </p>
            </div>

            {/* Progress Timeline */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-300">
                Investigation Timeline
              </h4>

              <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {detailCase.timeline.map((event, index) => (
                  <div key={index} className="relative space-y-1">
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        event.completed
                          ? 'bg-blue-600 text-white'
                          : event.current
                          ? 'bg-emerald-500 text-slate-950 '
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {event.completed ? (
                        <CheckCircle2 size={11} className="stroke-[3]" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold ${
                          event.current ? 'text-emerald-300' : event.completed ? 'text-white' : 'text-slate-500'
                        }`}>
                          {event.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {event.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDetailCase(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
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
