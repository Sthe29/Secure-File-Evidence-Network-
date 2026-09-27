import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types/auth';
import { 
  DetectiveCaseDocket, 
  InvestigationDiaryRecord, 
  CaseDocumentRecord, 
  SupervisorInstruction, 
  DocketTransferMovement, 
  CaseAuditEntry 
} from '../../types/detective';
import { CommanderCaseTab, SupervisoryReviewRecord, AuthorisedStationDetective } from '../../types/commander';
import { commanderService } from '../../services/commanderService';
import { 
  X, 
  Briefcase, 
  Clock, 
  ShieldCheck, 
  ArrowRightLeft, 
  FileText, 
  ClipboardList, 
  FileCheck2, 
  UserPlus, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Plus, 
  Calendar,
  Lock,
  Download,
  Eye,
  AlertCircle
} from 'lucide-react';

interface CommanderCaseWorkspaceModalProps {
  caseDocket: DetectiveCaseDocket;
  commander: UserProfile;
  initialTab?: CommanderCaseTab;
  onClose: () => void;
  onOpenAssignModal: (caseDocket: DetectiveCaseDocket) => void;
  onCaseUpdated: (updatedCase: DetectiveCaseDocket) => void;
}

export const CommanderCaseWorkspaceModal: React.FC<CommanderCaseWorkspaceModalProps> = ({
  caseDocket,
  commander,
  initialTab = 'overview',
  onClose,
  onOpenAssignModal,
  onCaseUpdated
}) => {
  const [activeTab, setActiveTab] = useState<CommanderCaseTab>(initialTab);
  const [currentCase, setCurrentCase] = useState<DetectiveCaseDocket>(caseDocket);

  // Data states
  const [diaryEntries, setDiaryEntries] = useState<InvestigationDiaryRecord[]>([]);
  const [documents, setDocuments] = useState<CaseDocumentRecord[]>([]);
  const [instructions, setInstructions] = useState<SupervisorInstruction[]>([]);
  const [movements, setMovements] = useState<DocketTransferMovement[]>([]);
  const [auditEntries, setAuditEntries] = useState<CaseAuditEntry[]>([]);
  const [reviews, setReviews] = useState<SupervisoryReviewRecord[]>([]);

  // Sub-modal / Action form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [furtherActionRequired, setFurtherActionRequired] = useState('');
  const [nextReviewDate, setNextReviewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [reviewOutcome, setReviewOutcome] = useState<SupervisoryReviewRecord['reviewOutcome']>(
    'Investigation Satisfactory'
  );

  const [showInstructionForm, setShowInstructionForm] = useState(false);
  const [newInstructionText, setNewInstructionText] = useState('');
  const [newInstructionPriority, setNewInstructionPriority] = useState<'Routine' | 'Urgent' | 'Critical'>('Routine');
  const [newInstructionDueDate, setNewInstructionDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');

  const [showCommanderAckModal, setShowCommanderAckModal] = useState(false);
  const [ackNotes, setAckNotes] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCaseData = () => {
    const d = commanderService.getInvestigationDiary(currentCase.caseNumber);
    const docs = commanderService.getCaseDocuments(currentCase.caseNumber);
    const insts = commanderService.getCaseInstructions(currentCase.caseNumber);
    const movs = commanderService.getDocketMovements(currentCase.caseNumber);
    const auds = commanderService.getCaseAuditTrail(currentCase.caseNumber);
    const revs = commanderService.getSupervisoryReviews(currentCase.caseNumber);
    const freshCase = commanderService.getCaseByNumber(currentCase.caseNumber);

    setDiaryEntries(d);
    setDocuments(docs);
    setInstructions(insts);
    setMovements(movs);
    setAuditEntries(auds);
    setReviews(revs);
    if (freshCase) {
      setCurrentCase(freshCase);
    }
  };

  useEffect(() => {
    loadCaseData();
  }, [currentCase.caseNumber]);

  // Keyboard shortcut: Escape key closes workspace (or active submodal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showReviewForm) setShowReviewForm(false);
        else if (showInstructionForm) setShowInstructionForm(false);
        else if (showReturnModal) setShowReturnModal(false);
        else if (showCommanderAckModal) setShowCommanderAckModal(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showReviewForm, showInstructionForm, showReturnModal, showCommanderAckModal, onClose]);

  // Handle Commander formal supervisory review submission
  const handleSubmitSupervisoryReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewNotes.trim()) {
      showToast('Please provide supervisory review notes.');
      return;
    }

    const shouldReturnToDetective = reviewOutcome === 'Further Directives Issued' || furtherActionRequired.trim().length > 0;

    const res = commanderService.recordSupervisoryReview({
      caseNumber: currentCase.caseNumber,
      commander,
      reviewNotes: reviewNotes.trim(),
      furtherActionRequired: furtherActionRequired.trim(),
      nextReviewDate,
      reviewOutcome,
      issueDirectivesAndReturn: shouldReturnToDetective
    });

    if (res.success) {
      if (reviewOutcome === 'Further Directives Issued') {
        showToast('Supervisory Review certified. Directives issued and docket returned to Detective (Awaiting Receipt).');
      } else if (reviewOutcome === 'Ready for NPA / Court Referral') {
        showToast('Supervisory Review certified. Investigation marked Satisfactory & authorized for NPA / Court referral.');
      } else if (reviewOutcome === 'Docket Closure Recommended') {
        showToast('Supervisory Review certified. Investigation marked Satisfactory & authorized for Docket Closure.');
      } else {
        showToast('Supervisory Review formally recorded & cryptographically sealed.');
      }
      setShowReviewForm(false);
      setReviewNotes('');
      setFurtherActionRequired('');
      loadCaseData();
      const updated = commanderService.getCaseByNumber(currentCase.caseNumber);
      if (updated) onCaseUpdated(updated);
    }
  };

  // Handle issuing supervisor SAPS 5 instruction
  const handleIssueInstruction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstructionText.trim()) {
      showToast('Please enter instruction directive text.');
      return;
    }

    const res = commanderService.issueInstruction({
      caseNumber: currentCase.caseNumber,
      instructionText: newInstructionText.trim(),
      priority: newInstructionPriority,
      requiredReviewDate: newInstructionDueDate,
      commander
    });

    if (res.success) {
      showToast('Supervisory Instruction issued and dispatched to Investigating Officer.');
      setShowInstructionForm(false);
      setNewInstructionText('');
      loadCaseData();
    }
  };

  // Handle Commander Custody Acknowledgement
  const handleCommanderAcknowledgeCustody = () => {
    const res = commanderService.acknowledgeDocketReceiptByCommander({
      caseNumber: currentCase.caseNumber,
      commander,
      notes: ackNotes.trim()
    });

    if (res.success) {
      showToast('Docket custody successfully acknowledged. You are now the recorded custodian.');
      setShowCommanderAckModal(false);
      setAckNotes('');
      loadCaseData();
      if (res.updatedCase) onCaseUpdated(res.updatedCase);
    }
  };

  // Handle Return Docket to Detective
  const handleReturnDocket = (e: React.FormEvent) => {
    e.preventDefault();
    const res = commanderService.returnDocketToDetective({
      caseNumber: currentCase.caseNumber,
      commander,
      returnReason: returnReason.trim()
    });

    if (res.success) {
      showToast(res.message);
      setShowReturnModal(false);
      setReturnReason('');
      loadCaseData();
      if (res.updatedCase) onCaseUpdated(res.updatedCase);
    }
  };

  const isCommanderCustodian = 
    currentCase.currentCustodianPersonnelNumber === commander.personnelNumber &&
    currentCase.custodyStatus === 'HELD_BY_SUPERVISOR';

  const isCustodyPendingForCommander = 
    (currentCase.currentCustodianPersonnelNumber === commander.personnelNumber || currentCase.currentCustodianDepartment.includes('Commander')) &&
    (!currentCase.isCustodyAcknowledgedByDetective || currentCase.custodyStatus === 'TRANSFERRED_AWAITING_RECEIPT');

  const isUnassigned = 
    !currentCase.investigatingOfficerPersonnelNumber || 
    currentCase.investigatingOfficerName === 'Unassigned';

  const tabs = [
    { id: 'overview' as CommanderCaseTab, label: 'Overview', icon: <Briefcase size={15} /> },
    { id: 'investigation-progress' as CommanderCaseTab, label: 'Investigation Progress', icon: <FileText size={15} />, badge: diaryEntries.length },
    { id: 'supervisory-review' as CommanderCaseTab, label: 'Supervisory Review', icon: <FileCheck2 size={15} />, badge: reviews.length },
    { id: 'instructions' as CommanderCaseTab, label: 'Instructions (SAPS 5)', icon: <ClipboardList size={15} />, badge: instructions.filter(i => i.status === 'OUTSTANDING').length, highlightBadge: instructions.filter(i => i.status === 'OUTSTANDING').length > 0 },
    { id: 'documents' as CommanderCaseTab, label: 'Documents', icon: <ShieldCheck size={15} />, badge: documents.length },
    { id: 'docket-movement' as CommanderCaseTab, label: 'Docket Movement', icon: <ArrowRightLeft size={15} />, badge: movements.length },
    { id: 'audit-trail' as CommanderCaseTab, label: 'Audit Trail', icon: <Lock size={15} /> }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="commander-case-workspace-modal"
        className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        
        {/* WORKSPACE TOP HEADER */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-black text-amber-300">
                {currentCase.caseNumber}
              </span>
              <span className="text-xs font-semibold text-white">
                {currentCase.incidentType}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {currentCase.currentStatus}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
              <span>Investigating Officer: <strong className={isUnassigned ? 'text-rose-400' : 'text-slate-200'}>{currentCase.investigatingOfficerName}</strong></span>
              <span>•</span>
              <span>Current Custodian: <strong className="text-emerald-400 font-bold">{currentCase.currentCustodianName}</strong></span>
              {!currentCase.isCustodyAcknowledgedByDetective && (
                <span className="text-amber-400 font-bold">(Custody Transfer In-Transit)</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCustodyPendingForCommander && (
              <button
                type="button"
                onClick={() => setShowCommanderAckModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>Acknowledge Docket Receipt</span>
              </button>
            )}

            {isCommanderCustodian && (
              <button
                type="button"
                onClick={() => setShowReturnModal(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowRightLeft size={14} />
                <span>Return to Detective</span>
              </button>
            )}

            {isUnassigned && (
              <button
                type="button"
                onClick={() => onOpenAssignModal(currentCase)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <UserPlus size={14} />
                <span>Assign Detective</span>
              </button>
            )}

            <button
              type="button"
              id="btn-commander-workspace-close"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
            >
              <X size={15} />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="px-4 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1 overflow-x-auto shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-emerald-400 text-emerald-300 bg-slate-900/40'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/20'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    tab.highlightBadge
                      ? 'bg-purple-500 text-white font-bold'
                      : isActive
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-2.5 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 size={15} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TAB CONTENTS (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Custody Responsibility Card (Core SFEN Objective) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Current Docket Custody & Responsibility
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                    currentCase.isCustodyAcknowledgedByDetective
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}>
                    {currentCase.custodyStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 block mb-1">Recorded Custodian:</span>
                    <strong className="text-white text-xs block">{currentCase.currentCustodianName}</strong>
                    <span className="text-[10px] font-mono text-emerald-400">{currentCase.currentCustodianRank}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 block mb-1">Custodian Personnel #:</span>
                    <strong className="text-amber-300 font-mono text-xs block">{currentCase.currentCustodianPersonnelNumber}</strong>
                    <span className="text-[10px] text-slate-400">{currentCase.currentCustodianDepartment}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 block mb-1">Custody Acknowledgement:</span>
                    {currentCase.isCustodyAcknowledgedByDetective ? (
                      <strong className="text-emerald-400 text-xs flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>Receipt Signed</span>
                      </strong>
                    ) : (
                      <strong className="text-amber-400 text-xs flex items-center gap-1">
                        <AlertTriangle size={13} />
                        <span>Awaiting Receipt Signature</span>
                      </strong>
                    )}
                    <span className="text-[10px] font-mono text-slate-400">
                      {currentCase.acknowledgedCustodyAt ? new Date(currentCase.acknowledgedCustodyAt).toLocaleDateString() : 'Pending'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 block mb-1">Scheduled Review Date:</span>
                    <strong className="text-white font-mono text-xs block">{currentCase.scheduledReviewDate || 'None Set'}</strong>
                    <span className="text-[10px] text-slate-400">Last Active: {currentCase.lastActivityDate}</span>
                  </div>
                </div>

                {isCustodyPendingForCommander && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-300">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                      <span>This docket was transferred to Station Command and is awaiting your formal receipt signature.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCommanderAckModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shrink-0 cursor-pointer"
                    >
                      Acknowledge Receipt
                    </button>
                  </div>
                )}
              </div>

              {/* Case & Complainant Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Case Particulars */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase size={14} className="text-blue-400" />
                    <span>Case Registration Particulars</span>
                  </h4>

                  <div className="space-y-2 text-xs divide-y divide-slate-800/60">
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">CAS Reference:</span>
                      <span className="font-mono font-bold text-amber-300">{currentCase.caseNumber}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Offence Classification:</span>
                      <span className="font-semibold text-white">{currentCase.incidentType}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Statutory / Common Law:</span>
                      <span className="font-mono text-slate-300 text-right">{currentCase.statutoryCode || 'Common Law Offence'}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Registration Date:</span>
                      <span className="font-mono text-slate-300">{currentCase.dateReported}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Incident Date & Time:</span>
                      <span className="font-mono text-slate-300">{currentCase.incidentDate} at {currentCase.incidentTime || '12:00'}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Police Station:</span>
                      <span className="text-slate-300 font-semibold">{currentCase.policeStation}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Incident Location:</span>
                      <span className="text-slate-300 text-right">{currentCase.incidentLocation.address}, {currentCase.incidentLocation.suburb}</span>
                    </div>
                  </div>
                </div>

                {/* Complainant & Investigating Officer */}
                <div className="space-y-4">
                  
                  {/* Complainant Particulars */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span>Complainant Information</span>
                    </h4>

                    <div className="space-y-2 text-xs divide-y divide-slate-800/60">
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-400">Full Name:</span>
                        <span className="font-bold text-white">{currentCase.complainant.fullName}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-400">Contact Number:</span>
                        <span className="font-mono text-slate-300">{currentCase.complainant.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-400">Email Address:</span>
                        <span className="text-slate-300">{currentCase.complainant.email || 'None provided'}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-400">National ID:</span>
                        <span className="font-mono text-slate-300">{currentCase.complainant.nationalId || 'Verified at CSC'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-400 block mb-1">Sworn Statement Summary:</span>
                      <p className="text-xs text-slate-300 italic bg-slate-900 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                        "{currentCase.complainant.statementSummary}"
                      </p>
                    </div>
                  </div>

                  {/* Investigating Officer Box */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Assigned Investigating Officer:</span>
                      <strong className="text-sm font-bold text-white block">
                        {currentCase.investigatingOfficerName}
                      </strong>
                      <span className="text-xs font-mono text-slate-400">
                        {currentCase.investigatingOfficerRank} • {currentCase.investigatingOfficerPersonnelNumber || 'Unassigned'}
                      </span>
                    </div>

                    {isUnassigned ? (
                      <button
                        type="button"
                        onClick={() => onOpenAssignModal(currentCase)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <UserPlus size={14} />
                        <span>Assign Now</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenAssignModal(currentCase)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
                      >
                        <span>Re-assign</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: INVESTIGATION PROGRESS (Chronological Detective Diary) */}
          {activeTab === 'investigation-progress' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Chronological Investigation Diary (SAPS 5 Diary of Action)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Read-only supervisory inspection of statements recorded, subpoenas served, and ballistic results
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {diaryEntries.length} chronological entries
                </div>
              </div>

              {diaryEntries.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <FileText size={32} className="text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No investigation entries logged yet</h4>
                  <p className="text-xs text-slate-400">
                    The assigned investigating officer has not yet submitted an investigation diary record.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {diaryEntries.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white">
                            Investigation Entry • {entry.authorRank} {entry.authorName} ({entry.personnelNumber})
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <strong className="text-slate-400 block mb-0.5">Action Taken:</strong>
                          <p className="text-slate-200 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            {entry.actionTaken}
                          </p>
                        </div>

                        <div>
                          <strong className="text-slate-400 block mb-0.5">Result / Outcome:</strong>
                          <p className="text-emerald-300 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            {entry.resultOutcome}
                          </p>
                        </div>

                        {entry.nextActionRequired && (
                          <div>
                            <strong className="text-slate-400 block mb-0.5">Next Action Required:</strong>
                            <p className="text-amber-300/90 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                              {entry.nextActionRequired}
                            </p>
                          </div>
                        )}

                        {entry.documentReference && (
                          <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-slate-400">
                            <span>Referenced Document:</span>
                            <span className="text-blue-400 font-bold">{entry.documentReference}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUPERVISORY REVIEW */}
          {activeTab === 'supervisory-review' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Supervisory Review Log & Integrity Certification
                  </h3>
                  <p className="text-xs text-slate-400">
                    Formally record review outcomes, issue corrective actions, and schedule follow-up dates
                  </p>
                </div>

                <button
                  type="button"
                  id="btn-conduct-supervisory-review"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Plus size={15} />
                  <span>{showReviewForm ? 'Cancel Review' : 'Record Supervisory Review'}</span>
                </button>
              </div>

              {/* Form to Conduct Formal Supervisory Review */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitSupervisoryReview}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <FileCheck2 size={16} />
                      <span>Formal Supervisory Review Form</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Officer: {commander.rank} {commander.fullName} ({commander.personnelNumber})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Review Outcome Assessment *
                      </label>
                      <select
                        value={reviewOutcome}
                        onChange={(e) => setReviewOutcome(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Investigation Satisfactory">Investigation Satisfactory</option>
                        <option value="Further Directives Issued">Further Directives Issued</option>
                        <option value="Ready for NPA / Court Referral">Ready for NPA / Court Referral</option>
                        <option value="Docket Closure Recommended">Docket Closure Recommended</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Next Scheduled Review Date *
                      </label>
                      <input
                        type="date"
                        value={nextReviewDate}
                        onChange={(e) => setNextReviewDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Supervisory Notes & Assessment *
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                      placeholder="Record detailed evaluation of detective's progress, evidence integrity, witness statements, and compliance with directives."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Further Action Required (if applicable)
                    </label>
                    <textarea
                      value={furtherActionRequired}
                      onChange={(e) => setFurtherActionRequired(e.target.value)}
                      rows={2}
                      placeholder="Specific steps the investigating officer must execute before next review."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 size={15} />
                      <span>Certify & Sign Review</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Historical Supervisory Reviews List */}
              {reviews.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <FileCheck2 size={32} className="text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No previous supervisory reviews recorded</h4>
                  <p className="text-xs text-slate-400">
                    Conduct a supervisory review above to establish an immutable audit record for this docket.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {rev.reviewOutcome}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {rev.commanderRank} {rev.commanderName}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          Reviewed: {new Date(rev.reviewDate).toLocaleString()}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <strong className="text-slate-400 block mb-0.5">Review Notes:</strong>
                          <p className="text-slate-200 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            {rev.reviewNotes}
                          </p>
                        </div>

                        {rev.furtherActionRequired && (
                          <div>
                            <strong className="text-slate-400 block mb-0.5">Further Action Mandated:</strong>
                            <p className="text-amber-300/90 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                              {rev.furtherActionRequired}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 font-mono text-[11px]">
                          <span className="text-slate-400">
                            Next Scheduled Review: <strong className="text-emerald-400">{rev.nextReviewDate}</strong>
                          </span>
                          {rev.auditSecurityHash && (
                            <span className="text-slate-500 text-[10px] truncate max-w-xs">
                              {rev.auditSecurityHash}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INSTRUCTIONS (SAPS 5) */}
          {activeTab === 'instructions' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Supervisory Instructions & Directives (SAPS 5)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Issue binding investigation directives to the detective and inspect recorded results
                  </p>
                </div>

                <button
                  type="button"
                  id="btn-issue-supervisor-instruction"
                  onClick={() => setShowInstructionForm(!showInstructionForm)}
                  className="px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Plus size={15} />
                  <span>{showInstructionForm ? 'Cancel Directive' : 'Issue New Instruction'}</span>
                </button>
              </div>

              {/* Form to Issue Instruction */}
              {showInstructionForm && (
                <form
                  onSubmit={handleIssueInstruction}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-4 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                      <ClipboardList size={16} />
                      <span>Issue Case Instruction / SAPS 5 Directive</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Investigator: {currentCase.investigatingOfficerName}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Priority Level *
                      </label>
                      <select
                        value={newInstructionPriority}
                        onChange={(e) => setNewInstructionPriority(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Routine">Routine</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Required Response Deadline *
                      </label>
                      <input
                        type="date"
                        value={newInstructionDueDate}
                        onChange={(e) => setNewInstructionDueDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Directive Text *
                    </label>
                    <textarea
                      value={newInstructionText}
                      onChange={(e) => setNewInstructionText(e.target.value)}
                      rows={3}
                      placeholder="e.g. Subpoena cell tower records under Section 205 and verify CCTV footage from adjacent business premises."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowInstructionForm(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send size={14} />
                      <span>Issue Directive</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Instructions List */}
              {instructions.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <ClipboardList size={32} className="text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No instructions issued yet</h4>
                  <p className="text-xs text-slate-400">
                    Use the button above to issue binding instructions to the investigating officer.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {instructions.map((inst) => (
                    <div
                      key={inst.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                            inst.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : inst.status === 'IN_PROGRESS'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          }`}>
                            {inst.status}
                          </span>
                          <span className="text-xs font-bold text-white">
                            Priority: {inst.priority}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          Issued: {new Date(inst.issuedAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <strong className="text-slate-400 block mb-0.5">Instruction Directive:</strong>
                          <p className="text-white leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            "{inst.instructionText}"
                          </p>
                        </div>

                        {inst.responseActionTaken && (
                          <div>
                            <strong className="text-slate-400 block mb-0.5">Detective Response & Action Taken:</strong>
                            <p className="text-emerald-300 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                              {inst.responseActionTaken}
                            </p>
                          </div>
                        )}

                        {inst.responseResult && (
                          <div>
                            <strong className="text-slate-400 block mb-0.5">Result / Finding:</strong>
                            <p className="text-slate-200 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                              {inst.responseResult}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 font-mono text-[11px] text-slate-400">
                          <span>Issued by: {inst.issuedBy}</span>
                          {inst.requiredReviewDate && (
                            <span className="text-amber-400">Due: {inst.requiredReviewDate}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Authorized Case Documents & Statements
                  </h3>
                  <p className="text-xs text-slate-400">
                    Complete digital repository of sworn statements, Section 205 subpoenas, and forensic reports
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {documents.length} verified documents
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <ShieldCheck size={32} className="text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No documents uploaded yet</h4>
                  <p className="text-xs text-slate-400">
                    Documents uploaded by the investigating officer or CSC intake will be catalogued here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-300">
                            {doc.documentRef}
                          </span>
                          <span className="text-xs font-bold text-white truncate">
                            {doc.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {doc.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-mono pt-1">
                          <span>Cat: {doc.category}</span>
                          <span>•</span>
                          <span>Uploaded by: {doc.addedByRank} {doc.addedBy}</span>
                          <span>•</span>
                          <span>Date: {new Date(doc.addedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                          {doc.fileFormat} • {doc.fileSize}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DOCKET MOVEMENT & CHAIN OF CUSTODY (Critical SFEN Pillar) */}
          {activeTab === 'docket-movement' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Docket Movement History & Chain of Custody
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tamper-evident trail of physical and digital transfers between CSC, Detectives, Commander, and Courts
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isCustodyPendingForCommander && (
                    <button
                      type="button"
                      onClick={() => setShowCommanderAckModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 size={15} />
                      <span>Acknowledge Custody Receipt</span>
                    </button>
                  )}

                  {isCommanderCustodian && (
                    <button
                      type="button"
                      onClick={() => setShowReturnModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowRightLeft size={14} />
                      <span>Return Docket to Detective</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Current Recorded Custodian Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                    Recorded Current Custodian:
                  </span>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{currentCase.currentCustodianName}</span>
                    <span className="text-xs font-mono text-emerald-400">({currentCase.currentCustodianPersonnelNumber})</span>
                  </div>
                  <span className="text-xs text-slate-400">{currentCase.currentCustodianDepartment}</span>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border inline-block ${
                    currentCase.isCustodyAcknowledgedByDetective
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}>
                    {currentCase.isCustodyAcknowledgedByDetective ? 'Receipt Acknowledged' : 'Awaiting Receipt Signature'}
                  </span>
                </div>
              </div>

              {/* Movement History Table */}
              <div className="space-y-3">
                {movements.map((mov, idx) => (
                  <div
                    key={mov.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white">
                          Dispatched by: {mov.senderRank} {mov.senderName} ({mov.senderPersonnelNumber})
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                        mov.status === 'ACKNOWLEDGED_RECEIVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {mov.status === 'ACKNOWLEDGED_RECEIVED' ? 'Receipt Acknowledged' : 'Awaiting Acknowledgement'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Authorised Destination:</span>
                        <span className="font-semibold text-slate-200 block">{mov.destination}</span>
                        {mov.intendedRecipientName && (
                          <span className="text-[11px] text-slate-400">Intended: {mov.intendedRecipientName}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-0.5">Reason for Transfer:</span>
                        <p className="text-slate-300 italic bg-slate-900 p-2 rounded-xl border border-slate-800">
                          "{mov.movementReason}"
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-400">
                      <span>Dispatched: {new Date(mov.dispatchedAt).toLocaleString()}</span>
                      {mov.acknowledgedBy ? (
                        <span className="text-emerald-400">
                          Received by: {mov.acknowledgedBy} on {mov.acknowledgedAt ? new Date(mov.acknowledgedAt).toLocaleString() : ''}
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold">In-Transit / Unacknowledged</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: AUDIT TRAIL (Read-Only Immutable Log) */}
          {activeTab === 'audit-trail' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock size={15} className="text-emerald-400" />
                    <span>Immutable Docket Audit Trail</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chronological, read-only system events. Cannot be modified or deleted by any user or administrator.
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {auditEntries.length} recorded events
                </div>
              </div>

              {auditEntries.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800">
                  <p className="text-xs text-slate-400">No audit events found.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {auditEntries.map((aud) => (
                    <div
                      key={aud.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 text-xs space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-400 font-mono text-[10px] font-bold border border-slate-800">
                            {aud.action}
                          </span>
                          <span className="text-white font-bold">
                            {aud.userRank} {aud.userFullName} ({aud.userPersonnelNumber})
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(aud.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-slate-300 leading-relaxed">
                        {aud.description}
                      </p>

                      <div className="pt-1 border-t border-slate-800/60 font-mono text-[10px] text-slate-500 flex items-center justify-between">
                        <span>Role: {aud.userRole}</span>
                        <span className="truncate max-w-xs">{aud.securityHash}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* PERSISTENT WORKSPACE BOTTOM BAR */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-amber-400 font-bold">{currentCase.caseNumber}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-300">{currentCase.incidentType}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-emerald-400">Custodian: {currentCase.currentCustodianName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-footer-close-commander-workspace"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-700 shadow-xs"
            >
              <X size={15} />
              <span>Close Workspace</span>
            </button>
          </div>
        </div>

      </div>

      {/* SUB-MODAL: Commander Acknowledge Custody */}
      {showCommanderAckModal && (
        <div 
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCommanderAckModal(false);
          }}
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Acknowledge Docket Custody</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowCommanderAckModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              By confirming receipt, you certify that docket <strong className="text-amber-300">{currentCase.caseNumber}</strong> is physically and digitally under your supervisory custody at Station Command.
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Receipt Verification Notes (Optional)
              </label>
              <textarea
                value={ackNotes}
                onChange={(e) => setAckNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Physical docket inspected. Subpoena returns verified intact."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCommanderAckModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommanderAcknowledgeCustody}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 size={15} />
                <span>Confirm Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL: Return Docket to Detective */}
      {showReturnModal && (
        <div 
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReturnModal(false);
          }}
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowRightLeft size={16} className="text-blue-400" />
                <span>Return Docket to Investigating Officer</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will return docket <strong className="text-amber-300">{currentCase.caseNumber}</strong> to Investigating Officer <strong>{currentCase.investigatingOfficerRank} {currentCase.investigatingOfficerName}</strong> for continued investigation. The detective must acknowledge receipt.
            </p>

            <form onSubmit={handleReturnDocket} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Return Mandate / Instructions *
                </label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  rows={3}
                  required
                  placeholder="e.g. Return following 30-day review. Execute Section 205 subpoena and compile final docket for Senior Prosecutor."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <ArrowRightLeft size={15} />
                  <span>Dispatch Docket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
