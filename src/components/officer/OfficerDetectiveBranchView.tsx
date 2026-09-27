import React, { useState } from 'react';
import { RegisteredCase, IncidentReport } from '../../types/complainant';
import { UserProfile } from '../../types/auth';
import { 
  DocketMovementRecord, 
  DetectiveOfficer, 
  InvestigationDiaryEntry, 
  CaseExhibit 
} from '../../types/officer';
import { officerService } from '../../services/officerService';
import { 
  Briefcase, 
  Search, 
  Filter, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  Clock, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Phone, 
  Mail, 
  Plus, 
  FolderPlus, 
  Layers, 
  ArrowRight, 
  X, 
  Send, 
  BookOpen, 
  CheckCircle,
  Shield,
  FileCheck2,
  Paperclip,
  Tag,
  ArrowRightLeft
} from 'lucide-react';

interface OfficerDetectiveBranchViewProps {
  cases: RegisteredCase[];
  reports: IncidentReport[];
  movements: DocketMovementRecord[];
  officer: UserProfile;
  onRefreshData: () => void;
  onNavigateToMovements?: () => void;
}

export const OfficerDetectiveBranchView: React.FC<OfficerDetectiveBranchViewProps> = ({
  cases,
  reports,
  movements,
  officer,
  onRefreshData,
  onNavigateToMovements
}) => {
  // Tabs within Detective Branch
  const [activeSubTab, setActiveSubTab] = useState<'incoming' | 'active' | 'roster'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<RegisteredCase | null>(null);

  // Allocation Modal State
  const [allocatingCase, setAllocatingCase] = useState<RegisteredCase | null>(null);
  const [selectedDetectiveId, setSelectedDetectiveId] = useState<string>('');
  const [allocationDirective, setAllocationDirective] = useState<string>('');
  const [isSubmittingAllocation, setIsSubmittingAllocation] = useState(false);

  // New Diary Entry State
  const [diaryNoteText, setDiaryNoteText] = useState('');
  const [diaryEntryType, setDiaryEntryType] = useState<InvestigationDiaryEntry['entryType']>('INVESTIGATION_NOTE');
  const [isSubmittingDiary, setIsSubmittingDiary] = useState(false);

  // New Exhibit State
  const [isAddingExhibit, setIsAddingExhibit] = useState(false);
  const [exhibitNumber, setExhibitNumber] = useState(`SAP13/2026/${Math.floor(1000 + Math.random() * 9000)}`);
  const [exhibitDescription, setExhibitDescription] = useState('');
  const [exhibitCategory, setExhibitCategory] = useState<CaseExhibit['category']>('PHYSICAL_PROPERTY');
  const [exhibitStorage, setExhibitStorage] = useState('Detective Branch Safe #1');

  // Load Detective Data from service
  const detectives = officerService.getDetectives();
  const allDiaryEntries = officerService.getInvestigationDiary();
  const allExhibits = officerService.getCaseExhibits();

  // Incoming dockets: docket movements to Detective Branch that are awaiting receipt or unassigned cases
  const incomingMovements = movements.filter(m => 
    m.destination.toLowerCase().includes('detective') && m.status === 'AWAITING_RECEIPT'
  );

  const unassignedCases = cases.filter(c => 
    !c.investigatingOfficer || 
    c.investigatingOfficer.toLowerCase().includes('pending') ||
    c.investigatingOfficer.toLowerCase().includes('detective branch')
  );

  // Filtered cases
  const filteredCases = cases.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      c.caseNumber.toLowerCase().includes(q) ||
      (c.reportReference && c.reportReference.toLowerCase().includes(q)) ||
      c.incidentType.toLowerCase().includes(q) ||
      c.investigatingOfficer.toLowerCase().includes(q) ||
      (c.currentStatus && c.currentStatus.toLowerCase().includes(q));
    
    if (activeSubTab === 'incoming') {
      return matchesSearch && (
        !c.investigatingOfficer || 
        c.investigatingOfficer.toLowerCase().includes('pending') ||
        c.currentStatus === 'Case Registered'
      );
    }
    return matchesSearch;
  });

  // Handle Accept Incoming Docket
  const handleAcknowledgeIncomingDocket = (movement: DocketMovementRecord) => {
    officerService.acknowledgeDocketReceipt(
      movement.id,
      officer.fullName,
      officer.personnelNumber,
      officer.rank,
      `Accepted into Detective Branch Register by ${officer.rank} ${officer.fullName}. Forwarded to Branch Commander for allocation.`
    );
    onRefreshData();
  };

  // Handle Assign IO
  const handleAssignIO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingCase || !selectedDetectiveId) return;

    setIsSubmittingAllocation(true);
    try {
      officerService.assignInvestigatingOfficer(
        allocatingCase.caseNumber,
        selectedDetectiveId,
        allocationDirective,
        officer
      );
      onRefreshData();
      setAllocatingCase(null);
      setSelectedDetectiveId('');
      setAllocationDirective('');
      
      // Update selected case if currently open
      if (selectedCase && selectedCase.caseNumber === allocatingCase.caseNumber) {
        const updated = officerService.getRegisteredCases().find(c => c.caseNumber === allocatingCase.caseNumber);
        if (updated) setSelectedCase(updated);
      }
    } finally {
      setIsSubmittingAllocation(false);
    }
  };

  // Handle Add Diary Entry
  const handleAddDiaryEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !diaryNoteText.trim()) return;

    setIsSubmittingDiary(true);
    try {
      officerService.addInvestigationDiaryEntry({
        caseNumber: selectedCase.caseNumber,
        authorName: officer.fullName,
        authorRank: officer.rank,
        personnelNumber: officer.personnelNumber,
        entryType: diaryEntryType,
        content: diaryNoteText.trim()
      });
      setDiaryNoteText('');
      onRefreshData();
    } finally {
      setIsSubmittingDiary(false);
    }
  };

  // Handle Add Exhibit
  const handleAddExhibit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !exhibitDescription.trim()) return;

    officerService.addCaseExhibit({
      caseNumber: selectedCase.caseNumber,
      exhibitNumber,
      description: exhibitDescription.trim(),
      category: exhibitCategory,
      collectedBy: `${officer.rank} ${officer.fullName}`,
      storageLocation: exhibitStorage
    });

    setExhibitDescription('');
    setIsAddingExhibit(false);
    setExhibitNumber(`SAP13/2026/${Math.floor(1000 + Math.random() * 9000)}`);
    onRefreshData();
  };

  // Handle Stage Progression
  const handleProgressStage = (newStatus: string, stageNum: number, note: string) => {
    if (!selectedCase) return;
    officerService.updateInvestigationStage(
      selectedCase.caseNumber,
      newStatus,
      stageNum,
      note,
      officer
    );
    onRefreshData();
    const updated = officerService.getRegisteredCases().find(c => c.caseNumber === selectedCase.caseNumber);
    if (updated) setSelectedCase(updated);
  };

  // Linked report details for selected case
  const linkedReport = selectedCase?.reportReference 
    ? reports.find(r => r.referenceNumber === selectedCase.reportReference)
    : null;

  const currentCaseDiary = selectedCase 
    ? allDiaryEntries.filter(e => e.caseNumber === selectedCase.caseNumber)
    : [];

  const currentCaseExhibits = selectedCase
    ? allExhibits.filter(e => e.caseNumber === selectedCase.caseNumber)
    : [];

  return (
    <div id="detective-branch-workspace" className="space-y-6">
      
      {/* Branch Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 font-mono">
              SAPS Detective Service • Division of Crime Detection
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 " />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Detective Branch Workspace</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Criminal Investigation Department (CID): Intake of transferred dockets from front desk, Investigating Officer (IO) assignment, SAPS 5 Investigation Diary entries, and forensic docket compilation.
          </p>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-400">Total Dockets: </span>
            <strong className="text-white font-mono text-sm">{cases.length}</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300">
            <span>Pending Allocation: </span>
            <strong className="font-mono text-sm">{unassignedCases.length}</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-300">
            <span>Detectives Active: </span>
            <strong className="font-mono text-sm">{detectives.length}</strong>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'active'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase size={14} />
            <span>Investigation Dockets</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20">
              {cases.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('incoming')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'incoming'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft size={14} />
            <span>Incoming Transferred Dockets</span>
            {(incomingMovements.length > 0 || unassignedCases.length > 0) && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black">
                {incomingMovements.length + unassignedCases.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('roster')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'roster'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck size={14} />
            <span>Detective Roster</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {detectives.length}
            </span>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search CAS docket, offence, IO or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* TAB 1: INCOMING DOCKETS FROM STATION INTAKE */}
      {activeSubTab === 'incoming' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <ArrowRightLeft size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Docket Handover & Intake Stream
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                When a station officer registers an official case with a walk-in citizen, the case docket is dispatched here to the Detective Branch. Detective commanders acknowledge physical and digital receipt, then assign an Investigating Officer (IO) from the roster below.
              </p>
            </div>
          </div>

          {/* Pending Movements Awaiting Receipt */}
          {incomingMovements.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pending Docket Receipts ({incomingMovements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {incomingMovements.map((mov) => (
                  <div 
                    key={mov.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-amber-300 text-sm">
                        {mov.caseNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Dispatched from Desk
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-white font-semibold">{mov.offence}</div>
                      <div className="text-slate-400">Complainant: <span className="text-slate-200">{mov.complainantName}</span></div>
                      <div className="text-slate-400 font-mono text-[11px]">Online Ref: {mov.reportReference}</div>
                      <div className="text-slate-400 text-[11px] pt-1">
                        Dispatched by: <strong className="text-slate-200">{mov.initiatedBy}</strong> ({new Date(mov.dispatchedAt).toLocaleTimeString()})
                      </div>
                      <p className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] italic">
                        "{mov.dispatchNotes}"
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleAcknowledgeIncomingDocket(mov)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 size={13} />
                        <span>Acknowledge Receipt into Branch</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dockets Awaiting IO Assignment */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Dockets Requiring Investigating Officer (IO) Allocation ({unassignedCases.length})
            </h3>
            {unassignedCases.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                <CheckCircle2 size={28} className="text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">All Dockets Allocated</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Every registered case docket currently has an assigned Investigating Officer actively conducting inquiries.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unassignedCases.map((c) => (
                  <div 
                    key={c.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white text-sm">{c.caseNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Unassigned
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-200">{c.incidentType}</div>
                      
                      <div className="text-[11px] text-slate-400 font-mono">
                        Online Ref: {c.reportReference}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        {c.lastUpdateSummary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCase(c)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        Inspect Docket
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAllocatingCase(c);
                          setSelectedDetectiveId(detectives[0]?.id || '');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <UserCheck size={13} />
                        <span>Allocate IO</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE INVESTIGATION DOCKETS */}
      {activeSubTab === 'active' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCases.map((c) => {
              const isUnassigned = 
                !c.investigatingOfficer || 
                c.investigatingOfficer.toLowerCase().includes('pending') ||
                c.investigatingOfficer.toLowerCase().includes('detective branch');

              const caseDiaryCount = allDiaryEntries.filter(e => e.caseNumber === c.caseNumber).length;
              const caseExhibitCount = allExhibits.filter(e => e.caseNumber === c.caseNumber).length;

              return (
                <div 
                  key={c.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-white text-sm">{c.caseNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isUnassigned 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {c.currentStatus}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{c.incidentType}</h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Online Ref: <span className="text-purple-300">{c.reportReference}</span>
                      </p>
                    </div>

                    {/* IO Card */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Investigating Officer (IO)
                      </span>
                      {isUnassigned ? (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-amber-300 font-semibold">Pending Assignment</span>
                          <button
                            type="button"
                            onClick={() => {
                              setAllocatingCase(c);
                              setSelectedDetectiveId(detectives[0]?.id || '');
                            }}
                            className="text-[11px] text-indigo-400 hover:underline font-bold cursor-pointer"
                          >
                            Assign Now
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className="text-indigo-400 shrink-0" />
                          <span className="text-xs text-slate-200 font-semibold truncate">
                            {c.investigatingOfficer}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Diary & Exhibit badges */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <BookOpen size={12} className="text-blue-400" />
                        <span>{caseDiaryCount} Diary Notes</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Paperclip size={12} className="text-emerald-400" />
                        <span>{caseExhibitCount} Exhibits</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {c.lastUpdateSummary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Reg: {c.dateRegistered}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedCase(c)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Open Docket File</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DETECTIVE ROSTER */}
      {activeSubTab === 'roster' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {detectives.map((det) => (
              <div 
                key={det.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
                      {det.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{det.rank} {det.fullName}</h4>
                      <span className="text-[11px] font-mono text-slate-400 block">{det.personnelNumber}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    On Duty
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Assigned Desk
                    </span>
                    <span className="text-slate-200 font-semibold">{det.desk}</span>
                  </div>

                  <div className="text-slate-400">
                    <span className="text-slate-500">Specialization: </span>
                    <span className="text-slate-300">{det.specialization}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Active Investigation Dockets:</span>
                    <strong className="text-white font-mono">{det.activeDocketsCount}</strong>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                    <Phone size={12} className="text-indigo-400" />
                    <span>{det.contactPhone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ALLOCATE INVESTIGATING OFFICER */}
      {allocatingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <UserCheck size={18} className="text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Allocate Investigating Officer</h3>
                  <p className="text-xs text-slate-400 font-mono">{allocatingCase.caseNumber} • {allocatingCase.incidentType}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllocatingCase(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignIO} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Detective from Roster
                </label>
                <select
                  value={selectedDetectiveId}
                  onChange={(e) => setSelectedDetectiveId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  required
                >
                  {detectives.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.rank} {d.fullName} ({d.desk} • {d.activeDocketsCount} active dockets)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Branch Commander Directives & Initial Investigation Tasks
                </label>
                <textarea
                  rows={3}
                  value={allocationDirective}
                  onChange={(e) => setAllocationDirective(e.target.value)}
                  placeholder="e.g. Schedule immediate witness statement interview; request crime scene CCTV footage; obtain Section 205 bank records."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
                <p className="font-semibold text-white">Complainant Notification Notice</p>
                <p className="text-[11px] text-indigo-300/80 mt-0.5">
                  Allocating an IO will automatically advance the case timeline in the complainant's portal and notify them via SMS/in-app alert of their assigned detective.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAllocatingCase(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAllocation}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <UserCheck size={14} />
                  <span>{isSubmittingAllocation ? 'Assigning...' : 'Confirm IO Allocation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FULL DETECTIVE DOCKET FILE DRAWER */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl my-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Docket Top Banner */}
            <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {selectedCase.caseNumber}
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Online Ref: {selectedCase.reportReference}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {selectedCase.currentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    SAPS Criminal Investigation Docket • {selectedCase.incidentType}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Docket Content Body */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* SECTION A: CASE ORIGIN & ONLINE STATEMENT */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={14} className="text-blue-400" />
                    <span>Section A: Verified Case Statement & Citizen Origin</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Date Registered: {selectedCase.dateRegistered}
                  </span>
                </div>

                {linkedReport ? (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Complainant Legal Name</span>
                        <strong className="text-white">{linkedReport.complainantName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Contact Phone</span>
                        <span className="text-slate-300 font-mono">{linkedReport.complainantPhone}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Email</span>
                        <span className="text-slate-300 font-mono">{linkedReport.complainantEmail}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Sworn Affidavit / Incident Narrative:
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        "{linkedReport.description}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap font-mono pt-1">
                      <span>Incident Occurred: {linkedReport.incidentDate} at {linkedReport.incidentTime}</span>
                      <span>•</span>
                      <span>Scene: {linkedReport.location?.address || 'Designated Station Area'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                    Online report details linked under reference <strong className="text-white">{selectedCase.reportReference}</strong>.
                  </div>
                )}
              </div>

              {/* SECTION B: INVESTIGATING OFFICER ALLOCATION */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={14} className="text-indigo-400" />
                    <span>Section B: Assigned Lead Detective</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setAllocatingCase(selectedCase);
                      setSelectedDetectiveId(detectives[0]?.id || '');
                    }}
                    className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 cursor-pointer"
                  >
                    Change / Reallocate IO
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold">
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {selectedCase.investigatingOfficer}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Rank: {selectedCase.officerRank} • Station: {selectedCase.policeStation}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION C: SAPS 5 INVESTIGATION DIARY */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={14} className="text-amber-400" />
                    <span>Section C: SAPS 5 Investigation Diary & Directives ({currentCaseDiary.length})</span>
                  </span>
                </div>

                {/* Add Diary Note Form */}
                <form onSubmit={handleAddDiaryEntry} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Add Diary Entry:
                    </span>
                    <select
                      value={diaryEntryType}
                      onChange={(e) => setDiaryEntryType(e.target.value as any)}
                      className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                    >
                      <option value="INVESTIGATION_NOTE">Investigation Field Note</option>
                      <option value="DIRECTIVE">Commander Directive</option>
                      <option value="WITNESS_INTERVIEW">Witness Statement / Interview</option>
                      <option value="COMPLAINANT_UPDATE">Complainant Consultation</option>
                      <option value="COURT_UPDATE">NPA / Court Entry</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={diaryNoteText}
                      onChange={(e) => setDiaryNoteText(e.target.value)}
                      placeholder="Record investigation notes, witness testimony, CCTV review, or docket movements..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingDiary}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer self-end shrink-0"
                    >
                      <Send size={13} />
                      <span>Post</span>
                    </button>
                  </div>
                </form>

                {/* Diary Entries List */}
                <div className="space-y-2">
                  {currentCaseDiary.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
                      No diary entries recorded for this case docket yet.
                    </div>
                  ) : (
                    currentCaseDiary.map((entry) => (
                      <div 
                        key={entry.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">
                            {entry.authorRank} {entry.authorName} ({entry.personnelNumber})
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800 inline-block">
                          {entry.entryType.replace(/_/g, ' ')}
                        </span>
                        <p className="text-slate-300 leading-relaxed pt-1">
                          {entry.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SECTION D: EVIDENCE & EXHIBITS (SAP 13) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Paperclip size={14} className="text-emerald-400" />
                    <span>Section D: Exhibits & Evidence Register (SAP 13) ({currentCaseExhibits.length})</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsAddingExhibit(!isAddingExhibit)}
                    className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>Log New Exhibit</span>
                  </button>
                </div>

                {isAddingExhibit && (
                  <form onSubmit={handleAddExhibit} className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      SAP 13 Evidence Logging
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">SAP 13 Reference</label>
                        <input
                          type="text"
                          value={exhibitNumber}
                          onChange={(e) => setExhibitNumber(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                        <select
                          value={exhibitCategory}
                          onChange={(e) => setExhibitCategory(e.target.value as any)}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                        >
                          <option value="PHYSICAL_PROPERTY">Physical Property</option>
                          <option value="CCTV_DIGITAL">CCTV / Digital Media</option>
                          <option value="FORENSIC_SWAB">Forensic Swab / DNA</option>
                          <option value="BALLISTICS">Ballistics / Firearm</option>
                          <option value="DOCUMENTARY">Documentary Subpoena</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Storage Location</label>
                        <input
                          type="text"
                          value={exhibitStorage}
                          onChange={(e) => setExhibitStorage(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Exhibit Description</label>
                      <input
                        type="text"
                        value={exhibitDescription}
                        onChange={(e) => setExhibitDescription(e.target.value)}
                        placeholder="e.g. SanDisk 64GB USB with CCTV footage of garage robbery."
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingExhibit(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                      >
                        Save Exhibit
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentCaseExhibits.length === 0 ? (
                    <div className="col-span-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
                      No physical exhibits logged in SAP 13 for this case yet.
                    </div>
                  ) : (
                    currentCaseExhibits.map((exh) => (
                      <div 
                        key={exh.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-emerald-400">{exh.exhibitNumber}</span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">{exh.category.replace(/_/g, ' ')}</span>
                        </div>
                        <p className="text-slate-200">{exh.description}</p>
                        <div className="text-[10px] text-slate-400 font-mono pt-1">
                          Storage: {exh.storageLocation} • By: {exh.collectedBy}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SECTION E: INVESTIGATION PROGRESSION ACTIONS */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle size={14} className="text-indigo-400" />
                  <span>Section E: Case Progression & NPA / Court Handover</span>
                </span>
                <p className="text-xs text-slate-400">
                  Update the official legal phase of the investigation docket. Updates automatically synchronize with the complainant's portal tracking.
                </p>

                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <button
                    type="button"
                    onClick={() => handleProgressStage(
                      'Investigation Active',
                      2,
                      'Investigating officer active on field inquiries, witness statements, and forensic analysis.'
                    )}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold cursor-pointer"
                  >
                    Set: Investigation Active
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProgressStage(
                      'Docket at NPA / Court',
                      3,
                      'Investigation completed. Docket submitted to Senior Public Prosecutor (SPP) for trial decision.'
                    )}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold cursor-pointer"
                  >
                    Transfer Docket to NPA / Court
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProgressStage(
                      'Case Finalized',
                      4,
                      'Matter concluded before Magistrate Court. Docket finalized in accordance with SAPS standing orders.'
                    )}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold cursor-pointer"
                  >
                    Finalize Case Docket
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close Docket
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAllocatingCase(selectedCase);
                    setSelectedDetectiveId(detectives[0]?.id || '');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <UserCheck size={14} />
                  <span>Allocate / Reassign IO</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
