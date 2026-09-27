import React, { useState, useMemo } from 'react';
import { AdminActivityLog, AdminActivityType } from '../../types/admin';
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  KeyRound, 
  RefreshCw, 
  Building2, 
  UserPlus, 
  XCircle,
  FileText,
  X
} from 'lucide-react';

interface AdminActivityViewProps {
  activityLogs: AdminActivityLog[];
}

export const AdminActivityView: React.FC<AdminActivityViewProps> = ({ activityLogs }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      if (filterType !== 'ALL' && log.actionType !== filterType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = log.title.toLowerCase().includes(q);
        const matchesDesc = log.description.toLowerCase().includes(q);
        const matchesUser = log.affectedUser ? log.affectedUser.toLowerCase().includes(q) : false;
        const matchesAdmin = log.adminName.toLowerCase().includes(q) || log.adminPersonnelNumber.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesUser || matchesAdmin;
      }
      return true;
    });
  }, [activityLogs, filterType, searchQuery]);

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activityLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sfen_admin_audit_log_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getActionBadge = (type: AdminActivityType) => {
    switch (type) {
      case 'ACCOUNT_CREATED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300">
            <UserPlus size={11} />
            <span>Account Created</span>
          </span>
        );
      case 'ACCOUNT_ACTIVATED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <CheckCircle2 size={11} />
            <span>Account Activated</span>
          </span>
        );
      case 'ACCOUNT_DEACTIVATED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-300">
            <XCircle size={11} />
            <span>Account Deactivated</span>
          </span>
        );
      case 'ROLE_CHANGED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300">
            <RefreshCw size={11} />
            <span>Role Reassigned</span>
          </span>
        );
      case 'PASSWORD_RESET':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <KeyRound size={11} />
            <span>Password Reset</span>
          </span>
        );
      case 'STATION_UPDATED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
            <Building2 size={11} />
            <span>Station Updated</span>
          </span>
        );
      case 'PROFILE_UPDATED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/15 border border-slate-500/30 text-slate-300">
            <User size={11} />
            <span>Profile Updated</span>
          </span>
        );
      case 'SYSTEM_ACTIVITY':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
            <FileText size={11} />
            <span>Case System Event</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
            {type}
          </span>
        );
    }
  };

  return (
    <div id="admin-activity-view" className="space-y-6">
      {/* Floating Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Activity & Audit Log
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable trace of administrative events, account modifications, and security operations.
          </p>
        </div>

        <button
          type="button"
          id="btn-export-audit-log"
          onClick={handleExportLogs}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-center"
        >
          <Download size={14} className="text-purple-400" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Filter Dropdown / Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400">Filter Event:</span>
          <select
            aria-label="Filter events by action type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
          >
            <option value="ALL">All Event Types ({activityLogs.length})</option>
            <option value="ACCOUNT_CREATED">Account Created</option>
            <option value="ACCOUNT_ACTIVATED">Account Activated</option>
            <option value="ACCOUNT_DEACTIVATED">Account Deactivated</option>
            <option value="ROLE_CHANGED">Role Reassigned</option>
            <option value="PASSWORD_RESET">Password Reset</option>
            <option value="STATION_UPDATED">Station Updated</option>
            <option value="PROFILE_UPDATED">Profile Updated</option>
            <option value="SYSTEM_ACTIVITY">Case System Events</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search action, affected user, or administrator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Activity Log List */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Activity size={28} className="mx-auto text-slate-600" />
            <p className="text-sm font-bold text-white">No activity records found</p>
            <p className="text-xs text-slate-400">
              No audit records match the current filter or search criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 sm:p-5 hover:bg-slate-900/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                {/* Event Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-white text-sm">
                      {log.title}
                    </span>
                    {getActionBadge(log.actionType)}
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed">
                    {log.description}
                  </p>

                  {log.affectedUser && (
                    <div className="flex items-center gap-1.5 text-[11px] text-purple-300 pt-0.5">
                      <span className="font-semibold text-slate-400">Reference:</span>
                      <span className="font-mono">{log.affectedUser}</span>
                    </div>
                  )}
                  {log.linkedReference && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 pt-0.5">
                      <span className="font-semibold text-slate-400">Linked Online Report:</span>
                      <span className="font-mono">{log.linkedReference}</span>
                    </div>
                  )}
                  {log.eventDetails && (
                    <div className="text-[11px] text-slate-400 pt-0.5">{log.eventDetails}</div>
                  )}
                </div>

                {/* Metadata: action actor & date/time */}
                <div className="flex flex-row md:flex-col md:items-end justify-between text-[11px] text-slate-400 shrink-0 font-mono gap-1 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800/60">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <User size={13} className="text-purple-400" />
                    <span>{log.adminName}</span>
                    <span className="text-slate-500">({log.adminPersonnelNumber})</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar size={12} />
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
