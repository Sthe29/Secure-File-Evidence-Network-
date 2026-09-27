import React, { useState } from 'react';
import { IncidentReport } from '../../types/complainant';
import { UserProfile } from '../../types/auth';
import { CaseRegistrationInput } from '../../types/officer';
import { 
  FolderPlus, 
  ShieldCheck, 
  UserCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck2,
  ArrowRight,
  Shield,
  Layers,
  FileText
} from 'lucide-react';

interface OfficerCaseRegistrationModalProps {
  report: IncidentReport;
  officer: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (caseNumber: string) => void;
  onRegisterCase: (input: CaseRegistrationInput) => { success: boolean; caseNumber: string; message: string };
}

const STATUTORY_OFFENCES: Record<string, { code: string; defaultDest: string }> = {
  'Theft / Burglary': {
    code: 'SEC 82 - Common Law Theft & Residential/Business Burglary',
    defaultDest: 'Detective Branch - General Crimes Desk'
  },
  'Robbery': {
    code: 'SEC 89 - Common Law Robbery (Aggravating Circumstances)',
    defaultDest: 'Detective Branch - Serious & Violent Crimes Desk'
  },
  'Assault / GBH': {
    code: 'SEC 110 - Assault with Intent to do Grievous Bodily Harm',
    defaultDest: 'Detective Branch - General Crimes Desk'
  },
  'Fraud / Cybercrime': {
    code: 'SEC 128 - Statutory Fraud & Cybercrimes Act No. 19 of 2020',
    defaultDest: 'Commercial Crime Section - Specialist Branch'
  },
  'Domestic Violence / Harassment': {
    code: 'Domestic Violence Act 116 of 1998 / Protection from Harassment Act',
    defaultDest: 'Family Violence, Child Protection & Sexual Offences (FCS) Unit'
  },
  'Vehicle Theft / Hijacking': {
    code: 'SEC 94 - Theft of Motor Vehicle / Armed Hijacking Protocol',
    defaultDest: 'Vehicle Crime Investigation Unit (VCIU)'
  },
  'Malicious Damage to Property': {
    code: 'SEC 84 - Malicious Injury to Property',
    defaultDest: 'Detective Branch - General Crimes Desk'
  },
  'Missing Person / Property': {
    code: 'SAPS National Instruction 2/2012 - Missing Persons Protocol',
    defaultDest: 'Detective Branch - General Crimes Desk'
  },
  'Suspicious Activity': {
    code: 'Criminal Procedure Act 51 of 1977 - Section 20 Inquiry',
    defaultDest: 'Sector Policing & Detective Inquiries'
  },
  'Other Criminal Incident': {
    code: 'Statutory Offence - Initial Criminal Code Classification',
    defaultDest: 'Detective Branch - General Crimes Desk'
  }
};

const DESTINATION_UNITS = [
  'Detective Branch - General Crimes Desk',
  'Detective Branch - Serious & Violent Crimes Desk',
  'Commercial Crime Section - Specialist Branch',
  'Family Violence, Child Protection & Sexual Offences (FCS) Unit',
  'Vehicle Crime Investigation Unit (VCIU)',
  'Branch Commander - Intake Review Desk'
];

export const OfficerCaseRegistrationModal: React.FC<OfficerCaseRegistrationModalProps> = ({
  report,
  officer,
  isOpen,
  onClose,
  onRegistered,
  onRegisterCase
}) => {
  const offenceMapping = STATUTORY_OFFENCES[report.incidentType] || {
    code: 'Common Law Offence - General Crime Classification',
    defaultDest: 'Detective Branch - General Crimes Desk'
  };

  const [complainantName, setComplainantName] = useState(report.complainantName);
  const [complainantPhone, setComplainantPhone] = useState(report.complainantPhone);
  const [complainantEmail, setComplainantEmail] = useState(report.complainantEmail);
  const [incidentType, setIncidentType] = useState(report.incidentType);
  const [chargeDescription, setChargeDescription] = useState(report.incidentType);
  const [statutoryCode, setStatutoryCode] = useState(offenceMapping.code);
  const [priorityLevel, setPriorityLevel] = useState<'Standard' | 'Urgent' | 'High Priority'>('Standard');
  const [destinationUnit, setDestinationUnit] = useState(offenceMapping.defaultDest);
  const [complainantIdNumber, setComplainantIdNumber] = useState('920412 5082 089');
  const [complainantPresentAtDesk, setComplainantPresentAtDesk] = useState(true);
  const [idVerified, setIdVerified] = useState(true);
  const [swornDeclarationAccepted, setSwornDeclarationAccepted] = useState(true);
  const [officerIntakeNotes, setOfficerIntakeNotes] = useState(
    `Complainant attended police station in-person. Online submission ${report.referenceNumber} reviewed with complainant. ID verified, sworn affidavit formalized and registered into official CAS crime register. Docket dispatched to Detective Branch.`
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredCasResult, setRegisteredCasResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!complainantPresentAtDesk) {
      setErrorMsg('Please confirm the complainant is present at the station desk to open an official criminal case.');
      return;
    }

    if (!idVerified) {
      setErrorMsg('Please verify the complainant ID Book, Smart ID Card, or Passport.');
      return;
    }

    if (!swornDeclarationAccepted) {
      setErrorMsg('You must certify the official sworn intake declaration before registering.');
      return;
    }

    if (!statutoryCode.trim()) {
      setErrorMsg('Please specify the statutory offence code / classification.');
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CaseRegistrationInput = {
        reportId: report.id,
        reportReference: report.referenceNumber,
        complainantName,
        complainantPhone,
        complainantEmail,
        incidentType,
        incidentDate: report.incidentDate,
        incidentTime: report.incidentTime,
        locationAddress: report.location?.address || 'Location Specified on Digital Map',
        locationSuburb: report.location?.suburb || 'Precinct Area',
        chargeDescription,
        statutoryCode,
        priorityLevel,
        initialDocketDestination: destinationUnit,
        officerIntakeNotes
      };

      const res = onRegisterCase(input);
      if (res.success) {
        setRegisteredCasResult(res.caseNumber);
        setTimeout(() => {
          onRegistered(res.caseNumber);
        }, 1800);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('An unexpected error occurred during case registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <FolderPlus size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Official Police Case Registration
                </h2>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {report.referenceNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Register official CAS docket linked to complainant submission • {officer.station || 'SAPS Sandton Police Station'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {registeredCasResult ? (
          /* SUCCESS STATE */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto ">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">
                Official Case Docket Registered!
              </h3>
              <p className="text-sm text-slate-300">
                Official Reference: <span className="font-mono font-bold text-emerald-400">{registeredCasResult}</span>
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto pt-2">
                Linked to online submission <strong className="text-purple-300">{report.referenceNumber}</strong>. The docket has been transferred to <strong className="text-white">{destinationUnit}</strong>.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono">
              Registering Officer: {officer.rank} {officer.fullName} ({officer.personnelNumber})
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Traceability Callout */}
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Registration Traceability & Traceable Linkage</p>
                <p className="text-blue-200/80 text-[11px] mt-0.5">
                  The complainant's online report <strong className="text-purple-300">{report.referenceNumber}</strong> will remain preserved in the system and linked directly to the newly generated official CAS number. Your officer details (<strong className="text-white">{officer.personnelNumber}</strong>) will be immutably recorded as the registering official.
                </p>
              </div>
            </div>

            {/* Online Filed Report Overview for In-Station Officer Review */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-400" />
                  <span>Complainant's Online Filed Overview</span>
                </span>
                <span className="text-[11px] font-mono text-purple-300">{report.referenceNumber}</span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                "{report.description}"
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-0.5 font-mono">
                <span>Date: {report.incidentDate} at {report.incidentTime}</span>
                <span>•</span>
                <span>Reported Scene: {report.location?.address || 'Designated Station Area'}</span>
              </div>
            </div>

            {/* In-Person Attendance & Identity Verification Checklist */}
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-3">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block">
                In-Person Station Desk Verification
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={complainantPresentAtDesk}
                    onChange={(e) => setComplainantPresentAtDesk(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
                  />
                  <span>Complainant physically present at desk</span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={idVerified}
                    onChange={(e) => setIdVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
                  />
                  <span>SA ID / Smart Card / Passport verified</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Complainant National ID / Passport Number
                </label>
                <input
                  type="text"
                  value={complainantIdNumber}
                  onChange={(e) => setComplainantIdNumber(e.target.value)}
                  placeholder="e.g. 920412 5082 089"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* Section 1: Complainant Details Confirmation */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <UserCheck size={14} className="text-blue-400" />
                <span>1. Verified Complainant Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Complainant Full Name
                  </label>
                  <input
                    type="text"
                    value={complainantName}
                    onChange={(e) => setComplainantName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={complainantPhone}
                    onChange={(e) => setComplainantPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={complainantEmail}
                    onChange={(e) => setComplainantEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Offence Classification */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Shield size={14} className="text-blue-400" />
                <span>2. Offence & Crime Classification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Offence Category
                  </label>
                  <input
                    type="text"
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Case Priority Rating
                  </label>
                  <select
                    value={priorityLevel}
                    onChange={(e) => setPriorityLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Standard">Standard Priority</option>
                    <option value="Urgent">Urgent (Witness/Evidence Risk)</option>
                    <option value="High Priority">High Priority (Violent / Aggravated)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Statutory Offence Code / South African Legal Charge
                </label>
                <input
                  type="text"
                  value={statutoryCode}
                  onChange={(e) => setStatutoryCode(e.target.value)}
                  placeholder="e.g., SEC 82 - Common Law Theft"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* Section 3: Docket Handover Destination */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Layers size={14} className="text-blue-400" />
                <span>3. Initial Docket Handover Destination</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Receiving Detective / Investigation Desk
                </label>
                <select
                  value={destinationUnit}
                  onChange={(e) => setDestinationUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {DESTINATION_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Upon registration, an initial Docket Movement entry will be logged into this receiving unit.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Station Officer Sworn Intake Notes
                </label>
                <textarea
                  rows={2}
                  value={officerIntakeNotes}
                  onChange={(e) => setOfficerIntakeNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Certification Checkbox */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={swornDeclarationAccepted}
                  onChange={(e) => setSwornDeclarationAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-300 leading-relaxed">
                  I, <strong>{officer.rank} {officer.fullName} (Badge: {officer.personnelNumber})</strong>, certify that I have reviewed the submitted complainant information, incident narrative, and location, and hereby formally register this matter as an official criminal case docket.
                </span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                id="btn-confirm-register-case"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <FolderPlus size={15} />
                <span>{isSubmitting ? 'Registering Docket...' : 'Register Official CAS & Transfer to Detective Branch'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
