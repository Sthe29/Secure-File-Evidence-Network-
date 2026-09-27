import React, { useState } from 'react';
import { CommanderNotification } from '../../types/commander';
import { 
  Bell, 
  CheckCheck, 
  Briefcase, 
  ArrowRightLeft, 
  Clock, 
  ClipboardList, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  Filter
} from 'lucide-react';

interface CommanderNotificationsViewProps {
  notifications: CommanderNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onOpenCaseByNumber: (caseNumber: string) => void;
  onOpenComplaint: (complaintId: string) => void;
}

export const CommanderNotificationsView: React.FC<CommanderNotificationsViewProps> = ({
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onOpenCaseByNumber,
  onOpenComplaint
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'urgent'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filterMode === 'unread') return !n.read;
    if (filterMode === 'urgent') return n.priority === 'urgent';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type: CommanderNotification['type']) => {
    switch (type) {
      case 'CASE_AWAITING_ASSIGNMENT':
        return <Briefcase size={16} className="text-amber-400" />;
      case 'DOCKET_AWAITING_ACKNOWLEDGEMENT':
        return <ArrowRightLeft size={16} className="text-blue-400" />;
      case 'CASE_REQUIRES_REVIEW':
        return <Clock size={16} className="text-emerald-400" />;
      case 'INSTRUCTION_RESPONDED':
        return <ClipboardList size={16} className="text-purple-400" />;
      case 'SERVICE_COMPLAINT':
        return <AlertTriangle size={16} className="text-rose-400" />;
      default:
        return <ShieldCheck size={16} className="text-slate-400" />;
    }
  };

  const handleNotificationClick = (item: CommanderNotification) => {
    if (!item.read) {
      onMarkNotificationAsRead(item.id);
    }

    if (item.caseNumber) {
      onOpenCaseByNumber(item.caseNumber);
    } else if (item.complaintId) {
      onOpenComplaint(item.complaintId);
    }
  };

  return (
    <div id="commander-notifications-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Supervisory Notifications & Action Alerts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time alerts for unassigned dockets, custody transfers, scheduled review milestones, and service complaints
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllNotificationsAsRead}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 hover:text-emerald-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck size={15} />
            <span>Mark All Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all' as const, label: 'All Alerts', count: notifications.length },
          { id: 'unread' as const, label: 'Unread Only', count: unreadCount, highlight: unreadCount > 0 },
          { id: 'urgent' as const, label: 'Urgent Priority', count: notifications.filter(n => n.priority === 'urgent').length }
        ].map((tab) => {
          const isActive = filterMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                tab.highlight && !isActive
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : isActive
                  ? 'bg-emerald-500/30 text-emerald-200'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {filteredNotifications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <Bell size={36} className="text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No notifications in this view</h3>
          <p className="text-xs text-slate-400">
            You are fully caught up with all supervisory command events.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 group ${
                !n.read
                  ? 'bg-slate-900 border-emerald-500/40 hover:border-emerald-500/60 shadow-xs'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 shrink-0 mt-0.5">
                  {getNotifIcon(n.type)}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-emerald-500 text-slate-950">
                        NEW
                      </span>
                    )}
                    {n.priority === 'urgent' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        URGENT
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {n.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
                    {n.caseNumber && (
                      <span className="text-amber-400 font-bold">
                        {n.caseNumber}
                      </span>
                    )}
                    <span>{new Date(n.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-center">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 group-hover:bg-slate-700 text-xs font-bold text-slate-300 group-hover:text-white border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  <span>Inspect</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
