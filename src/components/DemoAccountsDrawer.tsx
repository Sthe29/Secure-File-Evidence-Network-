import React, { useState } from 'react';
import { DEMO_ACCOUNTS, ROLE_DETAILS } from '../services/authService';
import { DemoAccount } from '../types/auth';
import { Shield, ChevronDown, ChevronUp, Copy, Check, Users } from 'lucide-react';

interface DemoAccountsDrawerProps {
  onSelectAccount: (account: DemoAccount) => void;
}

export const DemoAccountsDrawer: React.FC<DemoAccountsDrawerProps> = ({ onSelectAccount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSelect = (account: DemoAccount) => {
    onSelectAccount(account);
    setCopiedId(account.personnelNumber);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div id="demo-credentials-drawer" className="w-full max-w-md mx-auto mt-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
        <button
          id="btn-toggle-demo-credentials"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users size={12} />
            </div>
            <span>Quick-Fill Sample Credentials (4 Future Roles)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <span>{isOpen ? 'Hide' : 'Show Accounts'}</span>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>

        {isOpen && (
          <div className="p-3.5 border-t border-slate-800 space-y-2.5 bg-slate-950/60">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Click any sample officer profile below to automatically populate the login fields. The system will determine their clearance level and role automatically without a role dropdown.
            </p>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {DEMO_ACCOUNTS.map((acc) => {
                const roleInfo = ROLE_DETAILS[acc.role];
                const isSelected = copiedId === acc.personnelNumber;

                return (
                  <button
                    key={acc.personnelNumber}
                    id={`btn-demo-${acc.role.toLowerCase()}`}
                    type="button"
                    onClick={() => handleSelect(acc)}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-850 transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white group-hover:text-blue-300 transition-colors">
                          {acc.fullName} ({acc.rank})
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40 font-mono">
                          {acc.personnelNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Shield size={11} className="text-slate-500" />
                        <span>Role: <strong className="text-slate-300">{roleInfo.label}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-blue-400 font-medium shrink-0 ml-2">
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                          <Check size={13} />
                          Loaded
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 group-hover:text-blue-300 text-[11px]">
                          <Copy size={12} />
                          Use
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="text-[10px] text-slate-400 text-center pt-1 font-mono">
              Common Password: <span className="text-slate-300">DocketSecure2026!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
