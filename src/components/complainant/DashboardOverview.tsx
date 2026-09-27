import React, { useState } from 'react';
import { CitizenProfile } from '../../types/auth';
import { 
  IncidentReport, 
  RegisteredCase, 
  ServiceComplaint, 
  ComplainantTab 
} from '../../types/complainant';
import { 
  FileText, 
  Briefcase, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Building2, 
  ChevronDown, 
  ChevronUp,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface DashboardOverviewProps {
  citizen: CitizenProfile;
  reports: IncidentReport[];
  cases: RegisteredCase[];
  complaints: ServiceComplaint[];
  onNavigate: (tab: ComplainantTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  citizen,
  reports,
  cases,
  complaints,
  onNavigate
}) => {
  const { isDark } = useTheme();
  const [isCasesOpen, setIsCasesOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];
  const awaitingReports = reports.filter((r) => r.status === 'Awaiting Review' || r.status === 'Under Station Review');
  const activeCases = cases.filter((c) => c.currentStatus !== 'Case Finalized');

  return (
    <div id="complainant-dashboard-view" className="space-y-6 animate-fade-in">
      
      {/* Floating Welcome Header */}
      <div className="pt-1 pb-1">
        <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
          Welcome back, {citizen.fullName || 'User'}
        </h1>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Citizen Case and Incident Docket Tracking Dashboard
        </p>
      </div>

      {/* Metric KPI Boxes - retained on Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Registered Cases */}
        <div 
          onClick={() => onNavigate('my-cases')}
          className={`p-4 rounded-md border transition-colors cursor-pointer group flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800 hover:border-blue-600' : 'bg-white border-slate-200 hover:border-blue-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Registered Cases (CAS)</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <Briefcase size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>{cases.length}</span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>cases</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-600">
              <ShieldCheck size={12} />
              <span>{activeCases.length} active investigations</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Incident Reports */}
        <div 
          onClick={() => onNavigate('my-reports')}
          className={`p-4 rounded-md border transition-colors cursor-pointer group flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800 hover:border-blue-600' : 'bg-white border-slate-200 hover:border-blue-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Incident Reports</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <FileText size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>{reports.length}</span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>submitted</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-600">
              <Clock size={12} />
              <span>{awaitingReports.length} awaiting station review</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Service Complaints */}
        <div 
          onClick={() => onNavigate('complaints')}
          className={`p-4 rounded-md border transition-colors cursor-pointer group flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800 hover:border-blue-600' : 'bg-white border-slate-200 hover:border-blue-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Service Complaints</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>{complaints.length}</span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>logged</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-600">
              <Building2 size={12} />
              <span>Station Commander level</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion / Expandable Docket Panels */}
      <div className="space-y-4">
        
        {/* Panel 1: Registered Cases */}
        <div className={`rounded-md border overflow-hidden ${
          isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <button
            type="button"
            id="btn-toggle-cases-dropdown"
            onClick={() => setIsCasesOpen((prev) => !prev)}
            className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-blue-600/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600 shrink-0">
                <Briefcase size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    Registered Cases (CAS)
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-sm bg-blue-600 text-white font-mono font-semibold">
                    {cases.length} {cases.length === 1 ? 'Docket' : 'Dockets'}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {isCasesOpen ? 'Click to collapse case information' : 'Click to view registered police cases and detective progress'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400 shrink-0">
              <span className="text-xs font-semibold hidden sm:inline">
                {isCasesOpen ? 'Close' : 'Open'}
              </span>
              <div className="p-1 rounded-sm border border-slate-600">
                {isCasesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          </button>

          {isCasesOpen && (
            <div className={`p-5 pt-3 border-t space-y-3 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
              {cases.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No registered police cases yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {cases.map((c) => (
                    <div 
                      key={c.id} 
                      className={`p-3.5 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-sm bg-blue-600/10 text-blue-600 shrink-0">
                          <Briefcase size={16} />
                        </div>
                        <span className="font-mono font-bold text-sm sm:text-base text-blue-600">
                          {c.caseNumber}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onNavigate('my-cases')}
                        className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
                      >
                        <span>View Docket Timeline</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel 2: Recent Incident Reports */}
        <div className={`rounded-md border overflow-hidden ${
          isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <button
            type="button"
            id="btn-toggle-reports-dropdown"
            onClick={() => setIsReportsOpen((prev) => !prev)}
            className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-blue-600/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600 shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    Recent Incident Reports
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-sm bg-blue-600 text-white font-mono font-semibold">
                    {reports.length} {reports.length === 1 ? 'Report' : 'Reports'}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {isReportsOpen ? 'Click to collapse report details' : 'Click to view submitted online incident reports'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400 shrink-0">
              <span className="text-xs font-semibold hidden sm:inline">
                {isReportsOpen ? 'Close' : 'Open'}
              </span>
              <div className="p-1 rounded-sm border border-slate-600">
                {isReportsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          </button>

          {isReportsOpen && (
            <div className={`p-5 pt-3 border-t space-y-4 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
              {reports.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                  <p>You haven't submitted any incident reports yet.</p>
                  <button
                    type="button"
                    onClick={() => onNavigate('my-reports')}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    View Reports in My Records
                  </button>
                </div>
              ) : (
                <>
                  {reports.length > 1 && (
                    <div className="space-y-1.5">
                      <label htmlFor="select-dashboard-report" className="text-xs font-semibold block">
                        Select Incident Report:
                      </label>
                      <select
                        id="select-dashboard-report"
                        value={activeReport?.id || ''}
                        onChange={(e) => setSelectedReportId(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-md text-xs border font-medium ${
                          isDark ? 'bg-black border-slate-700 text-white' : 'bg-white border-slate-300 text-black'
                        }`}
                      >
                        {reports.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.referenceNumber} - {r.incidentType} ({r.policeStation})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {activeReport && (
                    <div className={`p-4 rounded-md border space-y-3 ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono font-bold text-sm sm:text-base text-blue-600">
                              {activeReport.referenceNumber}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm border border-blue-600 text-blue-600">
                              {activeReport.status}
                            </span>
                          </div>
                          <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-white' : 'text-black'}`}>
                            {activeReport.incidentType}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {activeReport.policeStation}
                        </span>
                      </div>

                      <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {activeReport.description}
                      </p>

                      <div className={`pt-2 border-t flex justify-end ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                        <button
                          type="button"
                          onClick={() => onNavigate('my-reports')}
                          className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Full Report in Records</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
