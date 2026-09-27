import React, { useState } from 'react';
import { UserProfile } from '../../types/auth';
import { DetectiveCaseDocket } from '../../types/detective';
import { AuthorisedStationDetective } from '../../types/commander';
import { 
  X, 
  UserPlus, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Briefcase
} from 'lucide-react';

interface CommanderAssignDetectiveModalProps {
  caseDocket: DetectiveCaseDocket;
  detectives: AuthorisedStationDetective[];
  commander: UserProfile;
  onClose: () => void;
  onConfirmAssignment: (params: {
    caseNumber: string;
    detectivePersonnelNumber: string;
    assignmentNotes?: string;
  }) => void;
}

export const CommanderAssignDetectiveModal: React.FC<CommanderAssignDetectiveModalProps> = ({
  caseDocket,
  detectives,
  commander,
  onClose,
  onConfirmAssignment
}) => {
  const [selectedDetectiveNumber, setSelectedDetectiveNumber] = useState<string>(
    detectives[0]?.personnelNumber || ''
  );
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDetective = detectives.find(d => d.personnelNumber === selectedDetectiveNumber);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDetectiveNumber) {
      setError('Please select an authorised detective from the station roster.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    onConfirmAssignment({
      caseNumber: caseDocket.caseNumber,
      detectivePersonnelNumber: selectedDetectiveNumber,
      assignmentNotes: assignmentNotes.trim()
    });

    setIsSubmitting(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Formal Docket Assignment & Handover
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {caseDocket.caseNumber} • {caseDocket.incidentType}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Custody / Assignment State Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Assigned Officer:</span>
              <span className="font-semibold text-white">
                {caseDocket.investigatingOfficerName || 'Unassigned (Awaiting Allocation)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Docket Custodian:</span>
              <span className="font-semibold text-emerald-400 font-mono">
                {caseDocket.currentCustodianName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Complainant:</span>
              <span className="text-slate-300">
                {caseDocket.complainant.fullName} ({caseDocket.complainant.phoneNumber})
              </span>
            </div>
          </div>

          {/* Select Authorised Detective */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Authorised Investigating Officer *
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {detectives.map((det) => {
                const isSelected = selectedDetectiveNumber === det.personnelNumber;
                return (
                  <div
                    key={det.personnelNumber}
                    onClick={() => setSelectedDetectiveNumber(det.personnelNumber)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{det.rank} {det.fullName}</span>
                        <span className="font-mono text-[10px] text-amber-400">
                          {det.personnelNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {det.division}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Spec: {det.specialization}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                          <CheckCircle2 size={14} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-700" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assignment Mandate / Directives */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Supervisory Assignment Directive / Mandate (Optional)
            </label>
            <textarea
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Conduct urgent on-site interview with complainant, review bank statements and submit preliminary report within 7 days."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>

          {/* Traceable Handover Policy Notice */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300/90 text-[11px] leading-relaxed flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-0.5">Traceable Docket Custody Rule</p>
              <p>
                Assigning this docket will record a digital transfer record dispatched by <strong>{commander.rank} {commander.fullName}</strong> to <strong>{selectedDetective?.rank} {selectedDetective?.fullName}</strong>. The transfer will be marked as <span className="font-mono text-amber-300 font-bold">Awaiting Acknowledgement</span> until the detective formally signs for custody.
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <UserPlus size={15} />
              <span>Confirm Formal Assignment</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
