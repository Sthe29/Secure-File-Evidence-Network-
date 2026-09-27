import React from 'react';
import { DetectiveNotification, DetectiveCaseDocket } from '../../types/detective';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  ArrowRight, 
  Briefcase, 
  ClipboardList, 
  ArrowRightLeft, 
  AlertTriangle, 
  Clock 
} from 'lucide-react';

interface DetectiveNotificationsViewProps {
  notifications: DetectiveNotification[];
  cases: DetectiveCaseDocket[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onOpenCase: (caseData: DetectiveCaseDocket, initialTab?: 'overview' | 'diary' | 'documents' | 'instructions' | 'movements' | 'audit') => void;
}

export const DetectiveNotificationsView: React.FC<DetectiveNotificationsViewProps> = ({
  notifications,
  cases,
  onMarkRead,
  onMarkAllRead,
  onOpenCase
}) => {
  const getNotificationIcon = (type: DetectiveNotification['type']) => {
    switch (type) {
      case 'ASSIGNMENT': return <Briefcase size={16} className="text-amber-400" />;
      case 'INSTRUCTION': return <ClipboardList size={16} className="text-purple-400" />;
      case 'MOVEMENT': return <ArrowRightLeft size={16} className="text-blue-400" />;
      case 'REVIEW_DUE': return <AlertTriangle size={16} className="text-red-400" />;
      default: return <Bell size={16} className="text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div id="detective-notifications-view" className="space-y-6">
      
      {/* Floating Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Docket & Case Notifications
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time alerts for docket transfers, supervisor instructions, inspection schedules, and case milestones
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <CheckCheck size={14} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
          <Bell size={32} className="text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">No notifications</p>
          <p className="text-xs text-slate-400">
            You will receive notifications when dockets are assigned, moved, or updated.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const matchedCase = notif.caseNumber 
              ? cases.find(c => c.caseNumber === notif.caseNumber)
              : null;

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  notif.read
                    ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                    : 'bg-slate-900 border-amber-500/30 text-white'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                      {notif.caseNumber && (
                        <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                          {notif.caseNumber}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono pt-0.5">
                      <Clock size={11} />
                      <span>{new Date(notif.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => onMarkRead(notif.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs cursor-pointer"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}

                  {matchedCase && (
                    <button
                      type="button"
                      onClick={() => {
                        onMarkRead(notif.id);
                        onOpenCase(
                          matchedCase, 
                          notif.type === 'INSTRUCTION' ? 'instructions' : notif.type === 'MOVEMENT' ? 'movements' : 'overview'
                        );
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <span>View Case</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
