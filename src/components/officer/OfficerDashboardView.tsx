import React from 'react';
import { IncidentReport, RegisteredCase } from '../../types/complainant';
import { UserProfile } from '../../types/auth';
import { OfficerNotification, OfficerTab, OfficerAuditLog } from '../../types/officer';
import { 
  FileText, 
  Briefcase, 
  Clock, 
  ShieldCheck, 
  ArrowRightLeft
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface OfficerDashboardViewProps {
  reports: IncidentReport[];
  cases: RegisteredCase[];
  notifications: OfficerNotification[];
  auditLogs: OfficerAuditLog[];
  officer: UserProfile;
  movementsCount?: number;
  onNavigate: (tab: OfficerTab) => void;
  onOpenReport?: (report: IncidentReport) => void;
}

export const OfficerDashboardView: React.FC<OfficerDashboardViewProps> = ({
  reports,
  cases,
  auditLogs,
  officer,
  movementsCount = 0,
  onNavigate
}) => {
  const { isDark } = useTheme();
  const awaitingReviewReports = reports.filter(r => r.status === 'Awaiting Review');
  const inProgressReports = reports.filter(r => r.status === 'Under Station Review' || r.status === 'Additional Info Required');

  return (
    <div id="officer-dashboard-view" className="space-y-6">
      
      {/* Header */}
      <div className="pt-1 pb-1">
        <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
          Police Station Overview
        </h1>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Frontline Station Intake, Official Case Registration, and Docket Movement
        </p>
      </div>

      {/* 4 Core Operational Metric KPI Boxes (Dashboard boxes retained) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Reports Awaiting Review */}
        <div
          onClick={() => onNavigate('records')}
          className={`p-4 rounded-md border transition-colors cursor-pointer group flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800 hover:border-blue-600' : 'bg-white border-slate-200 hover:border-blue-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Awaiting Review</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {awaitingReviewReports.length}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>submissions</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              {awaitingReviewReports.length > 0 ? 'Frontline review required' : 'All reports processed'}
            </p>
          </div>
        </div>

        {/* 2. In Processing */}
        <div
          onClick={() => onNavigate('records')}
          className={`p-4 rounded-md border transition-colors cursor-pointer group flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800 hover:border-blue-600' : 'bg-white border-slate-200 hover:border-blue-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>In Processing</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <FileText size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {inProgressReports.length}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>active</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              Under review or pending info
            </p>
          </div>
        </div>

        {/* 3. Registered Cases */}
        <div
          onClick={() => onNavigate('records')}
          className={`p-4 rounded-md border transition-colors cursor-pointer group flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800 hover:border-blue-600' : 'bg-white border-slate-200 hover:border-blue-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Registered Cases</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <Briefcase size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {cases.length}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>official CAS</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              Station crime dockets
            </p>
          </div>
        </div>

        {/* 4. Docket Movement */}
        <div
          onClick={() => onNavigate('docket-movement')}
          className={`p-4 rounded-md border transition-colors cursor-pointer group flex flex-col justify-between ${
            isDark ? 'bg-black border-slate-800 hover:border-blue-600' : 'bg-white border-slate-200 hover:border-blue-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Docket Movement</span>
            <div className="p-2 rounded-sm bg-blue-600/10 text-blue-600">
              <ArrowRightLeft size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                {movementsCount}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>transfers</span>
            </div>
            <p className={`text-[11px] pt-1 mt-2 border-t ${
              isDark ? 'border-white/10 text-slate-400' : 'border-black/10 text-slate-600'
            }`}>
              Branch handovers & transit
            </p>
          </div>
        </div>

      </div>

      {/* RECENT OPERATIONAL TRACEABILITY & ACTIVITY REGISTER (Flat, separated by lines) */}
      <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-600" />
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              Recent Registration Traceability & Action Logs
            </h3>
          </div>

          <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Automated Officer Audit Log
          </span>
        </div>

        <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-black/10'}`}>
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                    {log.description}
                  </p>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Officer: <strong>{log.officerRank} {log.officerName}</strong> ({log.personnelNumber}) • Ref: <span className="font-mono text-blue-600">{log.referenceNumber}</span>
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-mono shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
