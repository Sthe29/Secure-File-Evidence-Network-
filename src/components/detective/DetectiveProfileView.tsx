import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { 
  UserCheck, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Building, 
  BadgeCheck, 
  CheckCircle2, 
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface DetectiveProfileViewProps {
  user: UserProfile;
}

export const DetectiveProfileView: React.FC<DetectiveProfileViewProps> = ({ user }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordStatus({ success: false, message: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus({ success: false, message: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ success: false, message: 'New passwords do not match.' });
      return;
    }

    setPasswordStatus({ 
      success: true, 
      message: 'Account password updated successfully. SFEN security credential re-verified.' 
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus(null), 4000);
  };

  return (
    <div id="detective-profile-view" className="space-y-6">
      
      {/* Floating Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Personnel Profile & Credentials
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official SAPS Detective / Investigating Officer service record, security clearance, and access authorization
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold self-start sm:self-auto">
          <BadgeCheck size={14} />
          <span>Active Service Record</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Official Service Details Card */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xl">
              {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {user.rank} {user.fullName}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Personnel ID: <strong className="text-amber-400">{user.personnelNumber}</strong>
              </p>
              <p className="text-xs text-slate-400">
                Official Email: <span className="text-slate-300">{user.email}</span>
              </p>
            </div>
          </div>

          {/* Service Information Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                Appointed Division
              </span>
              <p className="font-bold text-white">
                {user.division || 'Criminal Investigation Directorate (CID)'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                Assigned Station
              </span>
              <p className="font-bold text-white">
                {user.station || 'SAPS Sandton Police Station'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                Operational Clearance
              </span>
              <p className="font-bold text-amber-400 flex items-center gap-1.5">
                <Lock size={12} />
                <span>{user.clearanceLevel || 'Level 2 - Specialist Docket Custody & CID'}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                Session Protocol
              </span>
              <p className="font-mono text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck size={12} />
                <span>SFEN Tamper-Evident Active</span>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-white font-bold">
              <FileCheck size={15} className="text-amber-400" />
              <span>Chain of Custody Legal Accountability</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              In terms of the South African Police Service Act and the Criminal Procedure Act 51 of 1977, investigating officers maintain personal legal custody of allocated dockets. Every document upload, investigation diary entry, and transfer dispatch is recorded in an immutable SFEN audit log.
            </p>
          </div>
        </div>

        {/* Right: Security Credentials / Password Update Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <KeyRound size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Security Credentials
            </h3>
          </div>

          <p className="text-xs text-slate-400">
            Maintain your SFEN terminal password to ensure encrypted session verification.
          </p>

          {passwordStatus && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              passwordStatus.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              {passwordStatus.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{passwordStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Current Password:
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                New Password:
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Confirm New Password:
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs mt-2"
            >
              <KeyRound size={14} />
              <span>Update Password</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
