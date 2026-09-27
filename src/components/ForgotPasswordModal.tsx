import React, { useState } from 'react';
import { KeyRound, Mail, X, CheckCircle2, PhoneCall, ShieldQuestion, ArrowRight, Loader2 } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIdentifier?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialIdentifier = ''
}) => {
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'commander'>('email');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 900);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setIdentifier('');
    onClose();
  };

  return (
    <div 
      id="forgot-password-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
    >
      <div 
        id="forgot-password-dialog"
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-7 relative overflow-hidden"
      >
        {/* Subtle accent border at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />

        {/* Close Button */}
        <button
          id="btn-close-modal"
          onClick={handleReset}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <KeyRound size={22} className="stroke-[2]" />
          </div>
          <div>
            <h3 id="forgot-password-title" className="text-lg font-bold text-white tracking-tight">
              Password Recovery Procedure
            </h3>
            <p className="text-xs text-slate-400">
              SFEN Police Case Docket & Evidence System
            </p>
          </div>
        </div>

        {isSubmitted ? (
          <div id="recovery-success-state" className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3.5">
              <CheckCircle2 size={22} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-emerald-300 text-sm">
                  Recovery Dispatch Initiated
                </p>
                <p className="text-slate-300 leading-relaxed">
                  If the identifier <strong className="text-white font-mono">{identifier}</strong> matches an active officer record in the SFEN database, a one-time cryptographic reset token has been dispatched to your official police email.
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 leading-relaxed">
              <span className="font-semibold text-slate-300">Important Note:</span> For security auditing, reset tokens expire in <span className="text-amber-300">15 minutes</span>. If you are operating on a frontline terminal without email access, request authorization from your Docket Commander.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                id="btn-return-login"
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
              >
                Return to Login
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Tabs for Recovery Mode */}
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                id="tab-self-service"
                onClick={() => setActiveTab('email')}
                className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-all ${
                  activeTab === 'email'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Self-Service Reset
              </button>
              <button
                type="button"
                id="tab-command-support"
                onClick={() => setActiveTab('commander')}
                className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-all ${
                  activeTab === 'commander'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Docket Commander Protocol
              </button>
            </div>

            {activeTab === 'email' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your registered Email address, mobile telephone number, or Police Personnel Number (e.g., <span className="font-mono text-blue-300">POL-20491</span>). A one-time verification link will be routed to your authorized contact.
                </p>

                <div className="space-y-1.5">
                  <label htmlFor="recovery-identifier" className="text-xs font-semibold text-slate-200 block">
                    Email, Mobile Phone Number, or Personnel ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      id="recovery-identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. you@email.com, 082 123 4567, or POL-10824"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-submit-recovery"
                    type="submit"
                    disabled={isSubmitting || !identifier.trim()}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all flex items-center gap-2 shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Verifying Officer...
                      </>
                    ) : (
                      <>
                        Send Recovery Token
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3.5 text-xs text-slate-300">
                <p className="leading-relaxed">
                  In accordance with the National Case Docket Security Directive, if an investigator is locked out during an active emergency or court hearing:
                </p>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <ShieldQuestion size={16} />
                    <span>Station Commander Override Protocol</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Contact your shift Commander or the Central Docket Supervisor on duty. They possess dual-custody authorization to issue a transient 4-hour docket review passcode.
                  </p>
                  <div className="pt-1 flex flex-col gap-1 text-slate-300 font-mono text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <PhoneCall size={12} className="text-blue-400" />
                      Police ICT Support: ext. 4409 / +27 (0) 12 393 1000
                    </span>
                    <span>Direct Case Docket Desk: dockets-support@sfen.police.gov</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
