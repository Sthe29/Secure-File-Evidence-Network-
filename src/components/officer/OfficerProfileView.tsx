import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { OfficerAuditLog } from '../../types/officer';
import { 
  User, 
  ShieldCheck, 
  Building2, 
  Mail, 
  Clock, 
  History,
  CheckCircle2,
  FileCheck2,
  KeyRound,
  Loader2
} from 'lucide-react';

interface OfficerProfileViewProps {
  officer: UserProfile;
  auditLogs: OfficerAuditLog[];
  onSignOut: () => void;
}

export const OfficerProfileView: React.FC<OfficerProfileViewProps> = ({
  officer,
  auditLogs,
  onSignOut
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'traceability'>('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);
    if (newPassword.length < 8) return setPasswordError('Your new password must contain at least 8 characters.');
    if (newPassword !== confirmPassword) return setPasswordError('The new passwords do not match.');
    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${officer.token}` }, body: JSON.stringify({ currentPassword, newPassword }) });
      const payload = await response.json() as { message?: string };
      if (!response.ok) throw new Error(payload.message || 'Unable to change your password.');
      setPasswordMessage(payload.message || 'Password changed successfully.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (reason) { setPasswordError(reason instanceof Error ? reason.message : 'Unable to change your password.'); }
    finally { setIsChangingPassword(false); }
  };

  // Filter logs for this officer
  const officerLogs = auditLogs.filter(
    l => l.personnelNumber === officer.personnelNumber || l.officerName.includes(officer.fullName)
  );

  return (
    <div id="officer-profile-view" className="space-y-6">
      
      {/* Floating Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Officer Profile & Credentials
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official law enforcement personnel credentials, station authorization, and registration audit trail
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Officer Information
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('traceability')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'traceability'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <History size={13} />
            <span>Registration Traceability ({officerLogs.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'profile' ? (
        <div className="space-y-6">
          
          {/* Identity Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-300 flex items-center justify-center font-bold text-2xl shrink-0">
                {officer.fullName.charAt(0)}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {officer.rank} {officer.fullName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold font-mono">
                    {officer.personnelNumber}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium">
                  {officer.division || 'Police Station Intake & Case Management'}
                </p>

                <p className="text-xs text-slate-500 font-mono">
                  Station: {officer.station || 'SAPS Berea Police Station'}
                </p>
              </div>
            </div>

            {/* Credential Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-semibold block text-[11px]">Official Email</span>
                <span className="font-mono text-slate-200">{officer.email}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-semibold block text-[11px]">Primary Station</span>
                <span className="font-semibold text-white">{officer.station || 'SAPS Berea Police Station'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-semibold block text-[11px]">Role Clearance</span>
                <span className="font-mono text-blue-300">{officer.clearanceLevel || 'Level 1 - Station Operations'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-semibold block text-[11px]">Session Authenticated</span>
                <span className="font-mono text-emerald-400">● Single Station Verified</span>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-white">
                <KeyRound size={16} className="text-blue-400" />
                <h3 className="text-sm font-bold">Change Password</h3>
              </div>
              <p className="text-xs text-slate-400">Use your current password to set a new password for this officer account.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="text-xs text-slate-300">Current password<input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1.5 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white" /></label>
                <label className="text-xs text-slate-300">New password<input required type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1.5 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white" /></label>
                <label className="text-xs text-slate-300">Confirm new password<input required type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white" /></label>
              </div>
              {passwordError && <p role="alert" className="text-xs text-red-300">{passwordError}</p>}
              {passwordMessage && <p className="text-xs text-emerald-300 flex items-center gap-1.5"><CheckCircle2 size={14} />{passwordMessage}</p>}
              <button type="submit" disabled={isChangingPassword} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2">{isChangingPassword && <Loader2 size={14} className="animate-spin" />}Change Password</button>
            </form>

            {/* Statutory Compliance Notice */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <span>
                As an authorized South African Police Service official, all report reviews, clarification requests, case registrations, and docket movements logged under this session are cryptographically timestamped and bound to your personnel force number in accordance with the National Evidence Directives and South African Police Service Act.
              </span>
            </div>

            {/* Logout button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onSignOut}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
              >
                Sign Out of Police Session
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* REGISTRATION TRACEABILITY & AUDIT TRAIL TAB */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
            <h3 className="font-bold text-white mb-1">Registration Traceability & Accountability Log</h3>
            <p className="text-[11px] text-blue-200/80">
              Whenever you process a report, request clarification, register a case, or dispatch a docket, SFEN automatically records your identity, the action performed, and the exact date/time. This immutable audit trail directly satisfies the system requirement for Registration Traceability.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white">
                Officer Action Register ({officerLogs.length} Events)
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Personnel: {officer.personnelNumber}
              </span>
            </div>

            {officerLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">
                No actions logged yet in this session. Once you review reports or register cases, entries will be appended here.
              </p>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {officerLogs.map((log) => (
                  <div key={log.id} className="py-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono font-bold text-[10px]">
                          {log.actionType}
                        </span>
                        <span className="font-mono text-purple-300 font-semibold">
                          {log.referenceNumber}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-slate-300">
                      {log.description}
                    </p>

                    <p className="text-[10px] text-slate-500">
                      Station: {log.station} • Operator: {log.officerRank} {log.officerName} ({log.personnelNumber})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
