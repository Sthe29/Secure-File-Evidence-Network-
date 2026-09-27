import React, { useState } from 'react';
import { OfficerNotification, OfficerTab } from '../../types/officer';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  FileText, 
  ArrowRightLeft, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';

interface OfficerNotificationsViewProps {
  notifications: OfficerNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate: (tab: OfficerTab) => void;
}

export const OfficerNotificationsView: React.FC<OfficerNotificationsViewProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'NEW_REPORT':
        return <FileText size={16} className="text-amber-400" />;
      case 'REPORT_UPDATE':
        return <FileText size={16} className="text-blue-400" />;
      case 'DOCKET_MOVEMENT':
        return <ArrowRightLeft size={16} className="text-emerald-400" />;
      default:
        return <ShieldCheck size={16} className="text-purple-400" />;
    }
  };

  return (
    <div id="officer-notifications-view" className="space-y-6">
      
      {/* Floating Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Operational Notifications
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Station dispatch alerts, incoming digital submissions, and docket custody confirmations
          </p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            type="button"
            id="btn-officer-mark-all-read"
            onClick={onMarkAllAsRead}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <CheckCheck size={14} />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            filter === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('UNREAD')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
            filter === 'UNREAD'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
          }`}
        >
          Unread ({notifications.filter(n => !n.read).length})
        </button>
      </div>

      {/* Notification List */}
      {filteredNotifs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <Bell size={36} className="text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No notifications</h3>
          <p className="text-xs text-slate-400">
            {filter === 'UNREAD' ? 'You have read all operational notices.' : 'Operational alerts will appear here as citizens submit reports or dockets move.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !notif.read
                  ? 'bg-slate-900/90 border-blue-500/40 shadow-xs'
                  : 'bg-slate-900/50 border-slate-800/80 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white">
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 pt-1">
                    <Clock size={11} />
                    <span>{new Date(notif.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {notif.linkedTab && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!notif.read) onMarkAsRead(notif.id);
                      onNavigate(notif.linkedTab!);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View
                  </button>
                )}

                {!notif.read && (
                  <button
                    type="button"
                    onClick={() => onMarkAsRead(notif.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
