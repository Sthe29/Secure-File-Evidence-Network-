import React from 'react';
import { UserProfile } from '../types/auth';
import { ROLE_DETAILS } from '../services/authService';
import { CheckCircle, Shield, ArrowRight, LogOut, Key, UserCheck, MapPin } from 'lucide-react';

interface AuthenticationSuccessModalProps {
  user: UserProfile;
  onSignOut: () => void;
}

export const AuthenticationSuccessModal: React.FC<AuthenticationSuccessModalProps> = ({
  user,
  onSignOut
}) => {
  const roleInfo = ROLE_DETAILS[user.role];

  return (
    <div 
      id="auth-success-card" 
      className="w-full max-w-lg mx-auto bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden animate-fade-in"
    >
      <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500" />
      
      <div className="flex items-center gap-3.5 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <CheckCircle size={26} className="stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              Access Granted
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Session Authenticated
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Officer Credentials Verified
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {/* Officer Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Officer Name & Rank</p>
              <p className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck size={18} className="text-blue-400" />
                {user.rank} {user.fullName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-400">Personnel ID</p>
              <p className="text-sm font-bold font-mono text-blue-300">{user.personnelNumber}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400" />
              <span>{user.station}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-slate-400">
              <Key size={12} />
              <span>Token Active</span>
            </div>
          </div>
        </div>

        {/* Automatic Role Resolution Showcase */}
        <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Shield size={16} />
            <span>Automatic Role Resolution</span>
          </div>
          <p className="text-sm font-bold text-white">
            Assigned Role: <span className="text-blue-300">{roleInfo.label}</span>
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            {roleInfo.clearance}
          </p>
          <div className="pt-2 text-xs font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded border border-slate-800">
            Target Docket Route: <span className="text-emerald-400 font-semibold">{roleInfo.redirectTarget}</span>
          </div>
        </div>

        {/* Note about backend and future dashboard phase */}
        <div className="text-xs text-slate-400 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
          <strong className="text-slate-200">System Architecture Note:</strong> As specified, the dashboard and PostgreSQL backend will be connected in the subsequent phase. The frontend login page has verified the input, handled credential mapping, and established the mock session payload ready for the Express API.
        </div>

        {/* Action buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            id="btn-test-another"
            type="button"
            onClick={onSignOut}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <LogOut size={15} />
            Sign Out / Test Another Officer
          </button>
          <button
            id="btn-future-dashboard"
            type="button"
            onClick={() => alert(`In the next phase, this will route automatically to ${roleInfo.redirectTarget} once the backend dockets API is connected.`)}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            Simulate Dashboard Entry
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
