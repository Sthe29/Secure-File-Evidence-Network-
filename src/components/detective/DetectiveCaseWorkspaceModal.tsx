import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types/auth';
import { 
  DetectiveCaseDocket, 
  CaseWorkspaceTab,
  InvestigationDiaryRecord,
  CaseDocumentRecord,
  SupervisorInstruction,
  DocketTransferMovement,
  CaseAuditEntry
} from '../../types/detective';
import { detectiveService } from '../../services/detectiveService';
import { 
  X, 
  FileText, 
  BookOpen, 
  FolderLock, 
  ClipboardList, 
  ArrowRightLeft, 
  ShieldAlert, 
  Clock, 
  User, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Lock, 
  ChevronRight, 
  Send,
  Building,
  Check,
  ShieldCheck,
  Phone,
  Mail,
  Fingerprint
} from 'lucide-react';

interface DetectiveCaseWorkspaceModalProps {
  caseData: DetectiveCaseDocket;
  detective: UserProfile;
  initialTab?: CaseWorkspaceTab;
  onClose: () => void;
  onCaseUpdated: (updatedCase: DetectiveCaseDocket) => void;
}

export const DetectiveCaseWorkspaceModal: React.FC<DetectiveCaseWorkspaceModalProps> = ({
  caseData,
  detective,
  initialTab = 'overview',
  onClose,
  onCaseUpdated
}) => {
  const [activeTab, setActiveTab] = useState<CaseWorkspaceTab>(initialTab);
  const [currentCase, setCurrentCase] = useState<DetectiveCaseDocket>(caseData);

  // Data sets
  const [diaryEntries, setDiaryEntries] = useState<InvestigationDiaryRecord[]>([]);
  const [documents, setDocuments] = useState<CaseDocumentRecord[]>([]);
  const [instructions, setInstructions] = useState<SupervisorInstruction[]>([]);
  const [movements, setMovements] = useState<DocketTransferMovement[]>([]);
  const [auditLogs, setAuditLogs] = useState<CaseAuditEntry[]>([]);

  // Sub-modals & Form States
  const [showAddDiaryModal, setShowAddDiaryModal] = useState(false);
  const [diaryActionTaken, setDiaryActionTaken] = useState('');
  const [diaryResult, setDiaryResult] = useState('');
  const [diaryDocRef, setDiaryDocRef] = useState('');
  const [diaryNextAction, setDiaryNextAction] = useState('');

  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<CaseDocumentRecord['category']>('Sworn Statement (A1/A2)');
  const [docRefCode, setDocRefCode] = useState('');
  const [docDescription, setDocDescription] = useState('');

  const [selectedInstruction, setSelectedInstruction] = useState<SupervisorInstruction | null>(null);
  const [instructionActionResponse, setInstructionActionResponse] = useState('');
  const [instructionResultResponse, setInstructionResultResponse] = useState('');
  const [markInstructionDone, setMarkInstructionDone] = useState(true);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferDestination, setTransferDestination] = useState('Forensic Science Laboratory (FSL) - Ballistics');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferReason, setTransferReason] = useState('');

  const [showCustodyAckModal, setShowCustodyAckModal] = useState(false);
  const [custodyAckNotes, setCustodyAckNotes] = useState('');

  const [statusUpdateMessage, setStatusUpdateMessage] = useState<string | null>(null);

  // Load initial tab data and record docket access in audit trail
  useEffect(() => {
    // Record automatic docket access audit log
    detectiveService.recordDocketAccessAudit(currentCase.caseNumber, detective);
    loadAllCaseData();
  }, [currentCase.caseNumber]);

  // Keyboard shortcut: Escape key closes workspace (or active submodal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCustodyAckModal) setShowCustodyAckModal(false);
        else if (showAddDiaryModal) setShowAddDiaryModal(false);
        else if (showAddDocModal) setShowAddDocModal(false);
        else if (selectedInstruction) setSelectedInstruction(null);
        else if (showTransferModal) setShowTransferModal(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCustodyAckModal, showAddDiaryModal, showAddDocModal, selectedInstruction, showTransferModal, onClose]);

  const loadAllCaseData = () => {
    const d = detectiveService.getInvestigationDiary(currentCase.caseNumber);
    const docs = detectiveService.getCaseDocuments(currentCase.caseNumber);
    const insts = detectiveService.getSupervisorInstructions({ caseNumber: currentCase.caseNumber });
    const movs = detectiveService.getDocketMovements(currentCase.caseNumber);
    const auds = detectiveService.getCaseAuditTrail(currentCase.caseNumber);

    setDiaryEntries(d);
    setDocuments(docs);
    setInstructions(insts);
    setMovements(movs);
    setAuditLogs(auds);
  };

  // Reload current case from storage
  const refreshCase = () => {
    const updated = detectiveService.getCaseByNumber(currentCase.caseNumber, detective.personnelNumber);
    if (updated) {
      setCurrentCase(updated);
      onCaseUpdated(updated);
    }
    loadAllCaseData();
  };

  // Handle Custody Acknowledgment
  const handleAcknowledgeCustody = () => {
    const res = detectiveService.acknowledgeDocketCustody(
      currentCase.caseNumber,
      detective,
      custodyAckNotes.trim() || undefined
    );
    if (res.success) {
      setShowCustodyAckModal(false);
      setCustodyAckNotes('');
      setStatusUpdateMessage(res.message);
      refreshCase();
      setTimeout(() => setStatusUpdateMessage(null), 4000);
    }
  };

  // Handle Add Diary Entry
  const handleSaveDiaryEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryActionTaken.trim() || !diaryResult.trim() || !diaryNextAction.trim()) return;

    detectiveService.addInvestigationDiaryEntry({
      caseNumber: currentCase.caseNumber,
      actionTaken: diaryActionTaken,
      resultOutcome: diaryResult,
      documentReference: diaryDocRef.trim() || undefined,
      nextActionRequired: diaryNextAction
    }, detective);

    setDiaryActionTaken('');
    setDiaryResult('');
    setDiaryDocRef('');
    setDiaryNextAction('');
    setShowAddDiaryModal(false);
    refreshCase();
  };

  // Handle Add Document
  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docDescription.trim()) return;

    detectiveService.addCaseDocument({
      caseNumber: currentCase.caseNumber,
      title: docTitle,
      category: docCategory,
      documentRef: docRefCode.trim() || `DOC-${Date.now().toString().slice(-4)}`,
      description: docDescription
    }, detective);

    setDocTitle('');
    setDocRefCode('');
    setDocDescription('');
    setShowAddDocModal(false);
    refreshCase();
  };

  // Handle Respond to Instruction
  const handleSaveInstructionResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstruction || !instructionActionResponse.trim() || !instructionResultResponse.trim()) return;

    detectiveService.respondToInstruction(
      selectedInstruction.id,
      instructionActionResponse,
      instructionResultResponse,
      markInstructionDone,
      detective
    );

    setSelectedInstruction(null);
    setInstructionActionResponse('');
    setInstructionResultResponse('');
    refreshCase();
  };

  // Handle Docket Transfer
  const handleSaveTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferDestination.trim() || !transferReason.trim()) return;

    if (transferDestination.includes('Station Commander')) {
      const res = detectiveService.transferDocketToCommander({
        caseNumber: currentCase.caseNumber,
        reason: transferReason
      }, detective);
      if (res.success) {
        setStatusUpdateMessage('Docket transferred to Station Commander. Awaiting Commander receipt.');
        setTimeout(() => setStatusUpdateMessage(null), 4000);
      }
    } else {
      detectiveService.initiateDocketTransfer({
        caseNumber: currentCase.caseNumber,
        destination: transferDestination,
        intendedRecipientName: transferRecipient.trim() || undefined,
        movementReason: transferReason
      }, detective);
      setStatusUpdateMessage(`Docket dispatched to ${transferDestination}. Status: Awaiting Receipt.`);
      setTimeout(() => setStatusUpdateMessage(null), 4000);
    }

    setShowTransferModal(false);
    setTransferReason('');
    setTransferRecipient('');
    refreshCase();
  };

  // Handle Status Update
  const handleUpdateStatus = (newStatus: DetectiveCaseDocket['currentStatus']) => {
    const success = detectiveService.updateCaseStatus(
      currentCase.caseNumber,
      newStatus,
      `Status updated by Lead Investigating Officer ${detective.rank} ${detective.fullName}`,
      detective
    );
    if (success) {
      refreshCase();
      setStatusUpdateMessage(`Case status updated to ${newStatus}`);
      setTimeout(() => setStatusUpdateMessage(null), 3000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        id="case-docket-workspace"
        className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* TOP BAR / DOCKET HEADER */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm sm:text-base font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                {currentCase.caseNumber}
              </span>
              {currentCase.reportReference && (
                <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Ref: {currentCase.reportReference}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {currentCase.currentStatus}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentCase.priorityLevel === 'Critical' || currentCase.priorityLevel === 'Urgent'
                  ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {currentCase.priorityLevel}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="font-bold text-white">{currentCase.incidentType}</span>
              <span>•</span>
              <span className="text-slate-400">{currentCase.policeStation}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Status message */}
            {statusUpdateMessage && (
              <div className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-lg flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 size={13} />
                <span>{statusUpdateMessage}</span>
              </div>
            )}

            <button
              type="button"
              id="btn-close-case-workspace"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
              title="Close Workspace"
            >
              <X size={15} />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS (6 CLEAR SECTIONS) */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-3 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={15} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diary')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'diary'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={15} />
            <span>Investigation Diary ({diaryEntries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderLock size={15} />
            <span>Documents ({documents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('instructions')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'instructions'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardList size={15} />
            <span>Instructions ({instructions.length})</span>
            {instructions.some(i => i.status === 'OUTSTANDING') && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('movements')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'movements'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft size={15} />
            <span>Docket Movement ({movements.length})</span>
            {movements.some(m => m.status === 'AWAITING_ACKNOWLEDGEMENT') && (
              <span className="w-2 h-2 rounded-full bg-amber-400 " />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert size={15} />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {/* WORKSPACE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* CURRENT DOCKET CUSTODIAN & LIFECYCLE RESPONSIBILITY (CRITICAL SFEN CHAIN) */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                !currentCase.isCustodyAcknowledgedByDetective || currentCase.custodyStatus === 'TRANSFERRED_AWAITING_RECEIPT'
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-amber-400 flex items-center gap-1">
                        <Lock size={12} />
                        Chain of Custody & Responsibility
                      </span>
                      {!currentCase.isCustodyAcknowledgedByDetective ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono animate-pulse">
                          Awaiting Your Receipt Acknowledgement
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono flex items-center gap-1">
                          <Check size={10} />
                          Held by Lead Investigating Officer
                        </span>
                      )}
                      {currentCase.requiresSupervisoryReview && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
                          Transferred to Station Commander
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                          Registered By (CSC Officer)
                        </span>
                        <p className="font-bold text-white mt-0.5">
                          {currentCase.registeredByOfficerName 
                            ? `${currentCase.registeredByOfficerRank || 'Constable'} ${currentCase.registeredByOfficerName}`
                            : 'Constable Sarah Ndlovu'}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {currentCase.registeredByPersonnelNumber || 'POL-10824'}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                          Current Docket Custodian
                        </span>
                        <p className="font-bold text-amber-300 mt-0.5">
                          {currentCase.currentCustodianName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {currentCase.currentCustodianDepartment}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                          Previous Custodian
                        </span>
                        <p className="font-bold text-slate-300 mt-0.5">
                          {currentCase.previousCustodianName || 'CSC Frontline Intake'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Transfer Handover Verified
                        </p>
                      </div>
                    </div>

                    {currentCase.acknowledgedCustodyAt && (
                      <p className="text-[11px] text-slate-500 font-mono pt-1">
                        Custody Formally Confirmed: {new Date(currentCase.acknowledgedCustodyAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Actions: Acknowledge OR Transfer to Station Commander */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                    {!currentCase.isCustodyAcknowledgedByDetective ? (
                      <button
                        type="button"
                        id="btn-acknowledge-custody"
                        onClick={() => setShowCustodyAckModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                      >
                        <CheckCircle2 size={16} />
                        <span>Acknowledge Docket Custody</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        id="btn-transfer-to-commander"
                        onClick={() => {
                          setTransferDestination('Station Commander (Snr. Supt. Elena Vance) - Supervisory Review & Inspection');
                          setTransferRecipient('Senior Superintendent Elena Vance');
                          setTransferReason('Docket transferred to Station Commander for supervisory inspection of Investigation Diary and directives.');
                          setShowTransferModal(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                      >
                        <ShieldCheck size={16} />
                        <span>Transfer to Station Commander</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* TWO COLUMN GRID: Case Particulars + Complainant */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT: Incident & Offence Specifics */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">
                      Offence & Incident Particulars
                    </h4>
                    <span className="font-mono text-xs text-amber-400 font-bold">
                      {currentCase.statutoryCode || 'Common Law Offence'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500">Date Reported:</span>
                      <p className="font-semibold text-white">{currentCase.dateReported}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500">Incident Occurrence:</span>
                      <p className="font-semibold text-white">
                        {currentCase.incidentDate} {currentCase.incidentTime ? `at ${currentCase.incidentTime}` : ''}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500">Assigned Detective:</span>
                      <p className="font-semibold text-white">
                        {currentCase.investigatingOfficerRank} {currentCase.investigatingOfficerName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500">Officer Personnel #:</span>
                      <p className="font-mono font-semibold text-amber-300">
                        {currentCase.investigatingOfficerPersonnelNumber}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500">Date Assigned:</span>
                      <p className="font-semibold text-white">{currentCase.assignedDate}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500">Last System Activity:</span>
                      <p className="font-semibold text-white">{currentCase.lastActivityDate}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      Incident Location:
                    </span>
                    <p className="text-xs font-medium text-slate-300">
                      {currentCase.incidentLocation.address}, {currentCase.incidentLocation.suburb}, {currentCase.incidentLocation.city}
                    </p>
                  </div>

                  {/* Stage Progress & Status Updates */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <label className="text-xs text-slate-400 font-semibold block">
                      Investigation Phase / Stage Progression:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {(['Investigation Active', 'Evidence Analysis', 'Docket at NPA / Court', 'Case Finalized'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateStatus(st)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer ${
                            currentCase.currentStatus === st
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Complainant Details & Sworn Summary */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">
                      Complainant Information
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Confidential Victim Details
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm shrink-0">
                        {currentCase.complainant.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">
                          {currentCase.complainant.fullName}
                        </p>
                        {currentCase.complainant.nationalId && (
                          <p className="text-[11px] font-mono text-slate-400">
                            ID: {currentCase.complainant.nationalId}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-300">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                        <Phone size={13} className="text-amber-400 shrink-0" />
                        <span className="font-mono text-xs">{currentCase.complainant.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 truncate">
                        <Mail size={13} className="text-amber-400 shrink-0" />
                        <span className="text-xs truncate">{currentCase.complainant.email}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-xs text-slate-400 font-semibold block">
                        Complainant Initial Statement Synopsis:
                      </span>
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto">
                        "{currentCase.complainant.statementSummary}"
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: INVESTIGATION DIARY */}
          {/* ========================================================================= */}
          {activeTab === 'diary' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <BookOpen size={18} className="text-amber-400" />
                    Investigation Diary (Chronological SAPS 5 Record)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Immutable chronological record of investigative work performed. Every entry is stamped with your personnel ID.
                  </p>
                </div>

                <button
                  type="button"
                  id="btn-add-investigation-entry"
                  onClick={() => setShowAddDiaryModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={15} />
                  <span>Add Investigation Entry</span>
                </button>
              </div>

              {/* Diary Entries List */}
              {diaryEntries.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <BookOpen size={32} className="text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-white">No diary entries recorded yet</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Record witness interviews, subpoena applications, field inspections, or victim consultations to establish an accountable record.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {diaryEntries.map((entry, idx) => (
                    <div 
                      key={entry.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            #{diaryEntries.length - idx}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-white">
                              {entry.authorRank} {entry.authorName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono ml-2">
                              ({entry.personnelNumber})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <Clock size={12} />
                          <span>{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-semibold text-slate-400">Action Taken:</span>
                          <p className="text-slate-200 mt-0.5 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                            {entry.actionTaken}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-400">Result / Outcome:</span>
                          <p className="text-slate-200 mt-0.5 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                            {entry.resultOutcome}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {entry.documentReference && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                              <FileText size={12} className="text-amber-400" />
                              <span>Referenced Doc: <strong className="font-mono text-slate-200">{entry.documentReference}</strong></span>
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 sm:justify-end">
                            <span className="font-semibold text-slate-400">Next Action:</span>
                            <span className="text-slate-200 truncate">{entry.nextActionRequired}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: DOCUMENTS */}
          {/* ========================================================================= */}
          {activeTab === 'documents' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <FolderLock size={18} className="text-amber-400" />
                    Authorised Digital Docket Documents
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sworn statements, Section 205 CPA directives, forensic reports, and documentary evidence associated with this docket.
                  </p>
                </div>

                <button
                  type="button"
                  id="btn-attach-document"
                  onClick={() => setShowAddDocModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={15} />
                  <span>Attach Document</span>
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <FolderLock size={32} className="text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-white">No documents uploaded to this docket</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Attach sworn witness affidavits, forensic certificates, or warrant applications.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {doc.documentRef}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1">
                              {doc.title}
                            </h4>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 shrink-0">
                            {doc.fileFormat} • {doc.fileSize}
                          </span>
                        </div>

                        <span className="inline-block text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                          {doc.category}
                        </span>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {doc.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-500 font-mono">
                        <div className="flex items-center justify-between">
                          <span>Added by: <strong className="text-slate-300">{doc.addedByRank} {doc.addedBy}</strong></span>
                          <span>{doc.addedByPersonnelNumber}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span>Date: {new Date(doc.addedAt).toLocaleString()}</span>
                          <span className="text-emerald-400 flex items-center gap-1 font-bold">
                            <Fingerprint size={11} />
                            Verified Seal
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: SUPERVISOR INSTRUCTIONS */}
          {/* ========================================================================= */}
          {activeTab === 'instructions' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <ClipboardList size={18} className="text-amber-400" />
                  Supervisor & Commander Directives for this Case
                </h3>
                <p className="text-xs text-slate-400">
                  Directives issued by Branch Commanders or Station Leadership. All completed instructions are preserved for supervisory accountability.
                </p>
              </div>

              {instructions.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <ClipboardList size={32} className="text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-white">No supervisor instructions pending</p>
                  <p className="text-xs text-slate-400">
                    The Branch Commander has not issued any specific directives for this docket.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {instructions.map((inst) => (
                    <div 
                      key={inst.id}
                      className={`p-5 rounded-2xl border transition-all space-y-3 ${
                        inst.status === 'COMPLETED'
                          ? 'bg-slate-950/60 border-slate-800/80'
                          : 'bg-slate-950 border-amber-500/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inst.status === 'COMPLETED'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : inst.status === 'IN_PROGRESS'
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}>
                            {inst.status}
                          </span>
                          <span className="text-xs text-slate-400">
                            Priority: <strong className="text-white">{inst.priority}</strong>
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono">
                          Issued by {inst.issuedByRank} {inst.issuedBy} on {new Date(inst.issuedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-slate-400">Commander Directive:</span>
                        <p className="text-xs sm:text-sm font-medium text-white leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                          {inst.instructionText}
                        </p>
                      </div>

                      {inst.requiredReviewDate && (
                        <div className="text-xs text-amber-300 flex items-center gap-1 font-medium">
                          <Calendar size={13} />
                          <span>Required Review Date: {inst.requiredReviewDate}</span>
                        </div>
                      )}

                      {/* Detective response if provided */}
                      {inst.responseActionTaken && (
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs">
                          <span className="font-bold text-amber-400">Detective Response Logged:</span>
                          <p className="text-slate-300">
                            <strong>Action:</strong> {inst.responseActionTaken}
                          </p>
                          <p className="text-slate-300">
                            <strong>Result:</strong> {inst.responseResult}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Responded by {inst.respondedBy} at {inst.respondedAt ? new Date(inst.respondedAt).toLocaleString() : ''}
                          </p>
                        </div>
                      )}

                      {/* Action buttons */}
                      {inst.status !== 'COMPLETED' && (
                        <div className="pt-2 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInstruction(inst);
                              setInstructionActionResponse(inst.responseActionTaken || '');
                              setInstructionResultResponse(inst.responseResult || '');
                              setMarkInstructionDone(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Send size={13} />
                            <span>Record Action / Complete Directive</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: DOCKET MOVEMENT & CHAIN OF CUSTODY */}
          {/* ========================================================================= */}
          {activeTab === 'movements' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <ArrowRightLeft size={18} className="text-amber-400" />
                    Docket Transfers & Custody History
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tracks every transfer of responsibility. Records who held the docket, where it moved, and confirms verified receipt.
                  </p>
                </div>

                {currentCase.custodyStatus === 'HELD_BY_INVESTIGATING_OFFICER' && (
                  <button
                    type="button"
                    id="btn-initiate-transfer"
                    onClick={() => setShowTransferModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <ArrowRightLeft size={15} />
                    <span>Initiate Docket Transfer</span>
                  </button>
                )}
              </div>

              {/* Movement Records */}
              <div className="space-y-4">
                {movements.map((mov, idx) => (
                  <div 
                    key={mov.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          Transfer #{movements.length - idx}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          mov.status === 'ACKNOWLEDGED_RECEIVED'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 '
                        }`}>
                          {mov.status === 'ACKNOWLEDGED_RECEIVED' ? 'Receipt Acknowledged' : 'Awaiting Acknowledgement'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono">
                        Dispatched: {new Date(mov.dispatchedAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                          Transferred From (Sender)
                        </span>
                        <p className="font-bold text-white">
                          {mov.senderRank} {mov.senderName}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">{mov.senderPersonnelNumber}</p>
                        <p className="text-[11px] text-slate-500">{mov.senderStation}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                          Destination (Authorized Receiver)
                        </span>
                        <p className="font-bold text-amber-300">
                          {mov.destination}
                        </p>
                        {mov.intendedRecipientName && (
                          <p className="text-[11px] text-slate-300">
                            Attention: {mov.intendedRecipientName} ({mov.intendedRecipientRole || 'Official'})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-slate-400">Transfer Reason:</span>
                      <p className="text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                        {mov.movementReason}
                      </p>
                    </div>

                    {mov.status === 'ACKNOWLEDGED_RECEIVED' && mov.acknowledgedBy && (
                      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-emerald-400 font-mono">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          Formally Acknowledged by: <strong>{mov.acknowledgedByRank} {mov.acknowledgedBy}</strong> ({mov.acknowledgedByPersonnelNumber})
                        </span>
                        <span className="text-slate-500">
                          At: {mov.acknowledgedAt ? new Date(mov.acknowledgedAt).toLocaleString() : ''}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: AUDIT TRAIL (IMMUTABLE) */}
          {/* ========================================================================= */}
          {activeTab === 'audit' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert size={18} className="text-amber-400" />
                  System-Generated Immutable Case Audit Register
                </h3>
                <p className="text-xs text-slate-400">
                  SFEN automatically cryptographically records every docket view, entry, document, response, and transfer. Ordinary users cannot edit or delete audit records.
                </p>
              </div>

              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div 
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {log.action}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {log.userRank} {log.userFullName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({log.userPersonnelNumber})
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {log.description}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Security Seal: {log.securityHash}</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <ShieldCheck size={11} />
                        Tamper-Evident Sealed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* WORKSPACE PERSISTENT BOTTOM BAR */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-amber-400 font-bold">{currentCase.caseNumber}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-300">{currentCase.currentStatus}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-footer-close-case"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-700 shadow-xs"
            >
              <X size={15} />
              <span>Close Case</span>
            </button>
          </div>
        </div>

      </div>

      {/* SUB-MODAL 1: ACKNOWLEDGE DOCKET CUSTODY */}
      {showCustodyAckModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={18} className="text-amber-400" />
                Acknowledge Docket Custody
              </h4>
              <button 
                type="button" 
                onClick={() => setShowCustodyAckModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Confirming receipt verifies that you, <strong className="text-white">{detective.rank} {detective.fullName} ({detective.personnelNumber})</strong>, assume formal physical and legal investigative custody of docket <strong className="text-amber-400 font-mono">{currentCase.caseNumber}</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Intake Inspection Notes (Optional):
              </label>
              <textarea
                value={custodyAckNotes}
                onChange={(e) => setCustodyAckNotes(e.target.value)}
                placeholder="e.g., Physical docket folder received. Section A sworn statements verified complete."
                className="w-full h-20 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCustodyAckModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-custody-ack"
                onClick={handleAcknowledgeCustody}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <CheckCircle2 size={15} />
                <span>Confirm Custody Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: ADD INVESTIGATION ENTRY */}
      {showAddDiaryModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen size={18} className="text-amber-400" />
                Add Chronological Diary Entry (SAPS 5)
              </h4>
              <button 
                type="button" 
                onClick={() => setShowAddDiaryModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDiaryEntry} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Action Taken <span className="text-red-400">*</span>:
                </label>
                <textarea
                  required
                  value={diaryActionTaken}
                  onChange={(e) => setDiaryActionTaken(e.target.value)}
                  placeholder="e.g., Interviewed store manager; inspected CCTV server; served Section 205 subpoena on bank..."
                  className="w-full h-20 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Result or Outcome <span className="text-red-400">*</span>:
                </label>
                <textarea
                  required
                  value={diaryResult}
                  onChange={(e) => setDiaryResult(e.target.value)}
                  placeholder="e.g., CCTV extraction secured showing suspect getaway vehicle; bank froze destination account balance..."
                  className="w-full h-18 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Relevant Doc / Statement Ref:
                  </label>
                  <input
                    type="text"
                    value={diaryDocRef}
                    onChange={(e) => setDiaryDocRef(e.target.value)}
                    placeholder="e.g., DOC-S205-001"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Next Action Required <span className="text-red-400">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={diaryNextAction}
                    onChange={(e) => setDiaryNextAction(e.target.value)}
                    placeholder="e.g., Issue subpoena returns notice"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-900 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Author: <strong>{detective.rank} {detective.fullName}</strong></span>
                <span className="font-mono text-amber-400">{detective.personnelNumber}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDiaryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-diary-entry"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check size={15} />
                  <span>Save to Investigation Diary</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: ATTACH DOCUMENT */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <FolderLock size={18} className="text-amber-400" />
                Attach Authorised Docket Document
              </h4>
              <button 
                type="button" 
                onClick={() => setShowAddDocModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Document Title <span className="text-red-400">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g., Witness Statement A2 - Security Officer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Category:
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Sworn Statement (A1/A2)">Sworn Statement (A1/A2)</option>
                    <option value="Section 205 Subpoena">Section 205 Subpoena</option>
                    <option value="Crime Scene Photos">Crime Scene Photos</option>
                    <option value="Forensic / Ballistic Report">Forensic / Ballistic Report</option>
                    <option value="CCTV Footage Extraction">CCTV Footage Extraction</option>
                    <option value="Search & Seizure Warrant">Search & Seizure Warrant</option>
                    <option value="Medical / J88 Examination">Medical / J88 Examination</option>
                    <option value="Documentary / Financial Audit">Documentary / Financial Audit</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Document Ref Code:
                  </label>
                  <input
                    type="text"
                    value={docRefCode}
                    onChange={(e) => setDocRefCode(e.target.value)}
                    placeholder="e.g., DOC-A2-004"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Description & Context <span className="text-red-400">*</span>:
                </label>
                <textarea
                  required
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  placeholder="Details of the evidence or statement..."
                  className="w-full h-18 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-case-document"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check size={15} />
                  <span>Attach to Docket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 4: RESPOND TO INSTRUCTION */}
      {selectedInstruction && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <ClipboardList size={18} className="text-amber-400" />
                Respond to Supervisor Directive
              </h4>
              <button 
                type="button" 
                onClick={() => setSelectedInstruction(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                Directive Issued by {selectedInstruction.issuedByRank} {selectedInstruction.issuedBy}:
              </span>
              <p className="text-xs text-white font-medium">
                "{selectedInstruction.instructionText}"
              </p>
            </div>

            <form onSubmit={handleSaveInstructionResponse} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Action Taken in Response <span className="text-red-400">*</span>:
                </label>
                <textarea
                  required
                  value={instructionActionResponse}
                  onChange={(e) => setInstructionActionResponse(e.target.value)}
                  placeholder="Record investigative steps performed to satisfy this instruction..."
                  className="w-full h-20 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Result / Outcome <span className="text-red-400">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={instructionResultResponse}
                  onChange={(e) => setInstructionResultResponse(e.target.value)}
                  placeholder="e.g., CCTV secured; bank freeze verified."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={markInstructionDone}
                  onChange={(e) => setMarkInstructionDone(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-800 focus:ring-0"
                />
                <span className="text-xs text-slate-300 font-medium">
                  Mark directive as Completed (Preserved in accountability register)
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedInstruction(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-instruction-response"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check size={15} />
                  <span>Submit Response</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 5: INITIATE DOCKET TRANSFER */}
      {showTransferModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-amber-400" />
                Transfer Docket Responsibility
              </h4>
              <button 
                type="button" 
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Initiating a transfer marks the docket as <strong className="text-amber-300">Awaiting Acknowledgement</strong> until the receiving destination confirms receipt. Previous movement history is immutably preserved.
            </p>

            <form onSubmit={handleSaveTransfer} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Authorised Destination <span className="text-red-400">*</span>:
                </label>
                <select
                  value={transferDestination}
                  onChange={(e) => {
                    const dest = e.target.value;
                    setTransferDestination(dest);
                    if (dest.includes('Station Commander')) {
                      setTransferRecipient('Senior Superintendent Elena Vance (Station Commander)');
                      if (!transferReason.trim()) {
                        setTransferReason('Docket transferred to Station Commander for supervisory inspection and directive review.');
                      }
                    } else if (dest.includes('NPA')) {
                      setTransferRecipient('Senior Public Prosecutor (Commercial Crimes)');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Station Commander (Snr. Supt. Elena Vance) - Supervisory Review & Inspection">
                    Station Commander (Snr. Supt. Elena Vance) - Supervisory Review & Inspection
                  </option>
                  <option value="National Prosecuting Authority (NPA) - Court Specialist Desk">
                    National Prosecuting Authority (NPA) - Court Specialist Desk
                  </option>
                  <option value="Specialised Commercial Crime Court - Prosecutor Desk">
                    Specialised Commercial Crime Court - Prosecutor Desk
                  </option>
                  <option value="Forensic Science Laboratory (FSL) - Ballistics & Cyber Evidence">
                    Forensic Science Laboratory (FSL) - Ballistics & Cyber Evidence
                  </option>
                  <option value="Forensic Science Laboratory (FSL) - Biology & DNA">
                    Forensic Science Laboratory (FSL) - Biology & DNA
                  </option>
                  <option value="SAPS Regional Archive / Safe Repository">
                    SAPS Regional Archive / Safe Repository
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Intended Recipient / Officer Attention:
                </label>
                <input
                  type="text"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  placeholder="e.g., Senior Public Prosecutor Van Zyl / Analyst Nkosi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Reason for Movement <span className="text-red-400">*</span>:
                </label>
                <textarea
                  required
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="e.g., Handed over for trial readiness decision and bail argument preparation..."
                  className="w-full h-20 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-docket-transfer"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Send size={15} />
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
