import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const SecurityNoticeBanner: React.FC = () => {
  return (
    <div 
      id="sfen-security-notice" 
      className="w-full bg-black/60 border border-blue-600/40 rounded-lg p-3 sm:p-3.5 flex items-start gap-3 backdrop-blur-sm"
    >
      <div className="p-1 rounded bg-blue-600/10 text-blue-500 shrink-0 mt-0.5">
        <ShieldAlert size={16} className="stroke-[2.2]" />
      </div>
      <div className="text-xs leading-relaxed text-slate-300">
        <span className="font-semibold text-blue-400 uppercase tracking-wide mr-1.5 inline-flex items-center gap-1">
          Authorised Personnel Only:
        </span>
        This is a restricted National Police Service portal. All docket queries, authentication attempts, and evidence modifications are logged with cryptographic timestamps for chain-of-custody compliance.
      </div>
    </div>
  );
};

