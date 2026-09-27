import React, { useState } from 'react';
import { ComplainantNotification, ComplainantTab } from '../../types/complainant';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../../services/complainantService';
import { 
  Bell, 
  CheckCheck, 
  FileText, 
  Briefcase, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';

interface NotificationsViewProps {
  notifications: ComplainantNotification[];
  onRefreshData: () => void;
  onNavigate: (tab: ComplainantTab) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onRefreshData,
  onNavigate
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    onRefreshData();
  };

  const handleNotificationClick = (notif: ComplainantNotification) => {
    if (!notif.read) {
      markNotificationAsRead(notif.id);
      onRefreshData();
    }
    if (notif.linkedTab) {
      onNavigate(notif.linkedTab);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'case':
        return <Briefcase size={15} className="text-blue-400" />;
      case 'report':
        return <FileText size={15} className="text-emerald-400" />;
      case 'complaint':
        return <AlertCircle size={15} className="text-amber-400" />;
      default:
        return <ShieldCheck size={15} className="text-purple-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div id="notifications-view" className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Notifications
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Status updates regarding your reports, case dockets, and inquiries.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 self-start sm:self-center transition-colors cursor-pointer"
          >
            <CheckCheck size={14} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'report', 'case', 'complaint'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold capitalize transition-all cursor-pointer ${
              filterType === type
                ? 'bg-slate-800 border border-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            {type === 'all' ? `All (${notifications.length})` : `${type}s`}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Bell size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-300">No notifications</h3>
          <p className="text-xs text-slate-500">You're up to date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 group ${
                !notif.read
                  ? 'bg-slate-900/95 border-emerald-500/40 shadow-xs hover:border-emerald-500/60'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs sm:text-sm font-bold ${!notif.read ? 'text-white' : 'text-slate-300'}`}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-500">
                    {new Date(notif.timestamp).toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  {notif.linkedTab && (
                    <ArrowRight size={13} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-8">
                {notif.message}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
