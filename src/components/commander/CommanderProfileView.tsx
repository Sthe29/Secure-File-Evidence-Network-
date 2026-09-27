import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { 
  UserCheck, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  FileCheck2,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface CommanderProfileViewProps {
  commander: UserProfile;
}

export const CommanderProfileView: React.FC<CommanderProfileViewProps> = ({
  commander
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setMessage({ text: 'Please enter your current operational password.', type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ text: 'New password must be at least 8 characters long.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match. Please re-enter.', type: 'error' });
      return;
    }

    setMessage({
      text: 'Operational credentials successfully updated. Cryptographic session reaffirmed.',
      type: 'success'
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div id="commander-profile-view" className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Station Commander Profile & Credentials
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Supervisory credentials, station jurisdiction authorization, and account security
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-lg flex items-center justify-center font-mono">
              {commander.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {commander.rank} {commander.fullName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Commander
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Personnel Number: <strong className="text-amber-300 font-mono">{commander.personnelNumber}</strong>
              </p>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Security Clearance</span>
            <span className="text-xs font-bold font-mono text-emerald-400">Level 3 Station Supervisory Clearance</span>
          </div>
        </div>

        {/* Station Particulars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 block text-[11px]">Assigned Station Jurisdiction:</span>
            <strong className="text-white text-sm block">{commander.station || 'SAPS Sandton Police Station'}</strong>
            <span className="text-[10px] text-slate-400">Gauteng Provincial Division</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 block text-[11px]">Primary Role:</span>
            <strong className="text-white text-sm block">Station Commander / Supervisor</strong>
            <span className="text-[10px] text-emerald-400 font-mono">Case Oversight, Docket Tracking & Reviews</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 block text-[11px]">Official Contact Email:</span>
            <strong className="text-slate-200 block font-mono">{commander.email}</strong>
            <span className="text-[10px] text-slate-400">SFEN Government Secured CID Gateway</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 block text-[11px]">Station Direct Line:</span>
            <strong className="text-slate-200 block font-mono">011 555 4900 (Commander Desk)</strong>
            <span className="text-[10px] text-slate-400">24/7 Priority Command Switchboard</span>
          </div>
        </div>

        {/* Separation of Duties Notice */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <ShieldAlert size={15} />
            <span>Role Separation Protocol</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Station Commanders have full supervisory authority over cases, detective workloads, docket handovers, instructions, and service complaints. System administration functions (such as creating user credentials or configuring system-wide roles) are strictly restricted to the SFEN System Administrator.
          </p>
        </div>
      </div>

      {/* Password Management Form */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <KeyRound size={18} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white">
            Manage Operational Password
          </h3>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Current Password *
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              New Password *
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Confirm New Password *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Lock size={14} />
            <span>Update Security Credentials</span>
          </button>
        </form>
      </div>

    </div>
  );
};
