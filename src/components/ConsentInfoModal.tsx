import React from 'react';
import { ShieldCheck, X, FileText, CheckCircle2 } from 'lucide-react';

interface ConsentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  isAgreed: boolean;
}

export const ConsentInfoModal: React.FC<ConsentInfoModalProps> = ({
  isOpen,
  onClose,
  onAgree,
  isAgreed
}) => {
  if (!isOpen) return null;

  return (
    <div 
      id="consent-info-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-title"
    >
      <div 
        id="consent-info-dialog"
        className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl p-6 sm:p-7 relative overflow-hidden"
      >
        {/* Subtle accent border at top */}
        <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />

        {/* Close Button */}
        <button
          id="btn-close-consent-modal"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <FileText size={22} className="stroke-[2]" />
          </div>
          <div>
            <h3 id="consent-modal-title" className="text-lg font-bold text-white tracking-tight">
              User Consent & Privacy Notice
            </h3>
            <p className="text-xs text-slate-400">
              Secure File & Evidence Network (SFEN)
            </p>
          </div>
        </div>

        {/* Exact Consent Content requested by user */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-slate-200 text-xs leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          <div className="space-y-3">
            <p>
              By creating an account on this system, I agree to provide my personal information for the purpose of accessing and managing services available through the Secure File & Evidence Network. I understand that my information may be used to identify my account, link me to relevant case or complaint information, provide case-related updates, and communicate important information through the system.
            </p>

            <p>
              I understand that my information will only be accessible to authorised users of the system and that certain investigation information may be restricted from complainant access.
            </p>

            <p className="font-semibold text-emerald-300">
              I confirm that the information I provide is accurate and that I have read and understood how my information will be used.
            </p>
          </div>
        </div>

        {/* Security badge note */}
        <div className="mt-4 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 flex items-center gap-2 text-[11px] text-emerald-300">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <span>Statutory Protection: Your data is protected under National Data Privacy & Evidence Acts.</span>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            id="btn-close-consent"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          
          <button
            type="button"
            id="btn-accept-consent-modal"
            onClick={() => {
              onAgree();
              onClose();
            }}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 size={15} />
            <span>{isAgreed ? 'Consent Accepted' : 'Agree & Accept Consent'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
