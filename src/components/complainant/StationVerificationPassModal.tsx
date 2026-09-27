import React from 'react';
import { 
  X, 
  Building2, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Briefcase
} from 'lucide-react';
import { IncidentReport } from '../../types/complainant';

interface StationVerificationPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: IncidentReport;
}

export const StationVerificationPassModal: React.FC<StationVerificationPassModalProps> = ({
  isOpen,
  onClose,
  report
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isCaseRegistered = report.status === 'Registered to Case' && report.linkedCaseNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Pass Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 font-mono block">
                SAPS Citizen Digital Intake
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                Station Case Opening Pass
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pass Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Main Reference Hero Card */}
          <div className="p-5 rounded-md bg-black border border-blue-600 text-center space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/10">
              <span className="font-semibold uppercase tracking-wider">Online Report Reference</span>
              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                isCaseRegistered 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-black text-blue-400 border border-blue-600'
              }`}>
                {isCaseRegistered ? 'Official CAS Assigned' : 'Awaiting Station Visit'}
              </span>
            </div>

            <div className="py-2">
              <div className="font-mono font-black text-3xl sm:text-4xl text-blue-400 tracking-wider">
                {report.referenceNumber}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Show this reference code to the officer at the police station desk
              </p>
            </div>

            {/* QR / Barcode aesthetic indicator */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <QrCode size={20} className="text-blue-400 shrink-0" />
                <span className="text-[11px]">Digital Verification Record</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">{new Date(report.submittedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* IN-PERSON INSTRUCTION CARD */}
          {!isCaseRegistered ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <AlertTriangle size={15} />
                <span>What to do when you arrive at the station:</span>
              </div>
              <ol className="text-xs text-slate-300 space-y-1.5 list-decimal pl-4 leading-relaxed">
                <li>
                  Proceed to <strong className="text-white">{report.policeStation}</strong>.
                </li>
                <li>
                  Present this reference (<strong className="font-mono text-amber-300">{report.referenceNumber}</strong>) or show this screen to the police officer at the desk.
                </li>
                <li>
                  The officer will pull up your filed report on their screen and verify what occurred with you.
                </li>
                <li>
                  The officer will verify your identity (bring your SA ID or Passport) and take your sworn statement.
                </li>
                <li>
                  The officer will generate your official <strong className="text-blue-300">CAS Docket Number</strong> and transfer your case to the <strong className="text-white">Detective Branch</strong>.
                </li>
              </ol>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 size={16} />
                <span>Case Officially Opened at Police Station</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your online report has been formalized into an official criminal case docket:
              </p>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs">
                <span className="text-slate-400">Official CAS Number:</span>
                <span className="font-mono font-extrabold text-sm text-emerald-400">{report.linkedCaseNumber}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                The docket has been dispatched to the Detective Branch for investigation assignment.
              </p>
            </div>
          )}

          {/* Incident Overview Details */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Filed Incident Overview
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block text-[11px]">Complainant</span>
                <strong className="text-white">{report.complainantName}</strong>
                <span className="text-slate-400 block text-[11px] font-mono">{report.complainantPhone}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Designated Station</span>
                <strong className="text-white flex items-center gap-1">
                  <Building2 size={13} className="text-blue-400" />
                  <span>{report.policeStation}</span>
                </strong>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Incident Category</span>
                <span className="text-slate-200 font-semibold">{report.incidentType}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Date & Time</span>
                <span className="text-slate-200 font-mono">{report.incidentDate} at {report.incidentTime}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-slate-500 block text-[11px]">What Occurred (Online Statement Overview)</span>
              <p className="text-slate-300 leading-relaxed mt-1 text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 line-clamp-3">
                {report.description}
              </p>
            </div>

            {report.location?.address && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-slate-400">
                <MapPin size={13} className="text-rose-400 shrink-0" />
                <span className="truncate">Scene: {report.location.address}</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Printer size={14} />
            <span>Print / Save Pass</span>
          </button>
        </div>

      </div>
    </div>
  );
};
