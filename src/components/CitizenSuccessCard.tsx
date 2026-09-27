import React from 'react';
import { CitizenProfile } from '../types/auth';
import { CheckCircle2, Mail, Phone, Shield, FileText, LogOut, ArrowRight, BellRing } from 'lucide-react';

interface CitizenSuccessCardProps {
  citizen: CitizenProfile;
  onSignOut: () => void;
}

export const CitizenSuccessCard: React.FC<CitizenSuccessCardProps> = ({
  citizen,
  onSignOut
}) => {
  return (
    <div 
      id="citizen-success-card" 
      className="w-full max-w-lg mx-auto bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden animate-fade-in"
    >
      <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500" />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <CheckCircle2 size={26} className="stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              Citizen Access Verified
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Dual-Channel Verified
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Welcome to SFEN Public Portal
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {/* Verified Profile Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div>
            <p className="text-xs font-medium text-slate-400">Registered Citizen</p>
            <p className="text-base font-bold text-white">{citizen.fullName}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Mail size={14} className="text-emerald-400 shrink-0" />
              <span className="truncate font-mono">{citizen.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone size={14} className="text-emerald-400 shrink-0" />
              <span className="font-mono">{citizen.phoneNumber}</span>
            </div>
          </div>
        </div>

        {/* Public Services Available */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Shield size={15} />
            <span>Public Docket Tracking Services Active</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 pl-1">
            <li className="flex items-center gap-2">
              <FileText size={13} className="text-emerald-400 shrink-0" />
              <span>Track registered criminal dockets (CAS numbers)</span>
            </li>
            <li className="flex items-center gap-2">
              <BellRing size={13} className="text-emerald-400 shrink-0" />
              <span>Receive real-time investigation updates via SMS & Email</span>
            </li>
            <li className="flex items-center gap-2">
              <Shield size={13} className="text-emerald-400 shrink-0" />
              <span>Securely upload digital evidence & statements to assigned detectives</span>
            </li>
          </ul>
        </div>

        {/* Note about future backend connection */}
        <div className="text-xs text-slate-400 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
          <strong className="text-slate-200">System Integration:</strong> This citizen session is validated with the required email, phone number, and secure password. When the Node.js/Express and PostgreSQL database is connected, this session token routes directly to the citizen case docket view.
        </div>

        {/* Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            id="btn-citizen-sign-out"
            type="button"
            onClick={onSignOut}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
          >
            <LogOut size={15} />
            Sign Out
          </button>
          <button
            id="btn-citizen-track-docket"
            type="button"
            onClick={() => alert(`Docket Tracking query portal will open once the PostgreSQL database is attached.`)}
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>Search Case Docket</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
