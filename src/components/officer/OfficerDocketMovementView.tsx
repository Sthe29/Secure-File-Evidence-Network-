import React, { useState } from 'react';
import { DocketMovementRecord } from '../../types/officer';
import { RegisteredCase } from '../../types/complainant';
import { UserProfile } from '../../types/auth';
import { 
  ArrowRightLeft, 
  Search, 
  Send, 
  CheckCircle2, 
  Clock, 
  Building2, 
  User, 
  ShieldCheck, 
  X, 
  FileCheck2, 
  ArrowRight
} from 'lucide-react';

interface OfficerDocketMovementViewProps {
  movements: DocketMovementRecord[];
  registeredCases: RegisteredCase[];
  officer: UserProfile;
  onInitiateMovement: (params: {
    caseNumber: string;
    reportReference: string;
    offence: string;
    complainantName: string;
    destination: string;
    dispatchNotes: string;
  }) => void;
  onAcknowledgeReceipt: (
    movementId: string,
    receivingOfficerName: string,
    receivingPersonnelNumber: string,
    receivingRank: string,
    receiptNotes: string
  ) => void;
}

const DESTINATION_UNITS = [
  'Detective Branch - General Crimes Desk',
  'Detective Branch - Serious & Violent Crimes Desk',
  'Commercial Crime Section - Specialist Branch',
  'Family Violence, Child Protection & Sexual Offences (FCS) Unit',
  'Vehicle Crime Investigation Unit (VCIU)',
  'Branch Commander - Intake Review Desk'
];

export const OfficerDocketMovementView: React.FC<OfficerDocketMovementViewProps> = ({
  movements,
  registeredCases,
  officer,
  onInitiateMovement,
  onAcknowledgeReceipt
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitiatingModalOpen, setIsInitiatingModalOpen] = useState(false);

  // New Movement Form State
  const [selectedCaseNum, setSelectedCaseNum] = useState<string>(
    registeredCases.length > 0 ? registeredCases[0].caseNumber : ''
  );
  const [destinationUnit, setDestinationUnit] = useState(DESTINATION_UNITS[0]);
  const [dispatchNotes, setDispatchNotes] = useState(
    'Primary docket, sworn statements, and mapped scene evidence transferred to Detective Branch for investigation allocation.'
  );

  const filteredMovements = movements.filter((m) => {
    return (
      m.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.reportReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.initiatedBy.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleStartInitiate = () => {
    if (registeredCases.length > 0) {
      setSelectedCaseNum(registeredCases[0].caseNumber);
    }
    setIsInitiatingModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseNum) return;

    const matchedCase = registeredCases.find(c => c.caseNumber === selectedCaseNum);

    onInitiateMovement({
      caseNumber: selectedCaseNum,
      reportReference: matchedCase?.reportReference || 'Verified Report',
      offence: matchedCase?.incidentType || 'Criminal Matter',
      complainantName: 'Station Complainant',
      destination: destinationUnit,
      dispatchNotes
    });

    setIsInitiatingModalOpen(false);
  };

  const handleSimulateReceipt = (movement: DocketMovementRecord) => {
    onAcknowledgeReceipt(
      movement.id,
      'David Khumalo',
      'POL-20491',
      'Detective Inspector',
      'Docket received in physical register, electronic custody chain locked. Assigned to primary detective rotation.'
    );
  };

  return (
    <div id="officer-docket-movement-view" className="space-y-6">
      
      {/* Floating Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Docket Handover & Movement Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Chain of custody tracking: transfers into Detective & Supervisory investigation workflows
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="btn-initiate-docket-movement"
            onClick={handleStartInitiate}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Send size={14} />
            <span>Initiate Handover</span>
          </button>
        </div>
      </div>

      {/* Search and Context Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search docket, case number, or receiving unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-bold text-white">
            {filteredMovements.length} Handover Logs
          </span>
        </div>
      </div>

      {/* Accountability Principle Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck size={18} className="text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-white">Immutable Custody & Accountability</p>
          <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
            Every movement records origin, destination, initiating officer ({officer.rank} {officer.fullName}), timestamp, and recipient sign-off. CSC responsibility ends as the matter progresses into the investigation workflow.
          </p>
        </div>
      </div>

      {/* Movement Cards / List */}
      {filteredMovements.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <ArrowRightLeft size={36} className="text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No docket movement records found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When dockets are registered and transferred from the CSC to the Detective Branch, their transit and receipt will be logged here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredMovements.map((movement) => (
            <div
              key={movement.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 space-y-4 shadow-sm"
            >
              {/* Top Row: Case & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-sm font-bold text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    {movement.caseNumber}
                  </span>
                  <span className="font-mono text-xs text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                    {movement.reportReference}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {movement.offence}
                  </span>
                </div>

                <div>
                  {movement.status === 'ACKNOWLEDGED_RECEIVED' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>Acknowledged & Received</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      <span className="w-2 h-2 rounded-full bg-amber-400 " />
                      <span>In Transit / Awaiting Branch Receipt</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Transit Path: Origin -> Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Origin */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <Building2 size={12} className="text-blue-400" />
                    <span>Originating Desk</span>
                  </div>
                  <p className="font-bold text-white">{movement.origin}</p>
                  <p className="text-[11px] text-slate-400">
                    Dispatched by: <strong className="text-slate-300">{movement.initiatedByRank} {movement.initiatedBy}</strong> ({movement.initiatedByPersonnelNumber})
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">
                    {new Date(movement.dispatchedAt).toLocaleString()}
                  </p>
                </div>

                {/* Destination */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <ArrowRight size={12} className="text-purple-400" />
                    <span>Destination Unit</span>
                  </div>
                  <p className="font-bold text-white">{movement.destination}</p>
                  {movement.receivedBy ? (
                    <>
                      <p className="text-[11px] text-emerald-400">
                        Received by: <strong>{movement.receivedByRank} {movement.receivedBy}</strong> ({movement.receivedByPersonnelNumber})
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        {movement.receivedAt ? new Date(movement.receivedAt).toLocaleString() : ''}
                      </p>
                    </>
                  ) : (
                    <p className="text-[11px] text-amber-400 font-medium">
                      Physical docket en route • Awaiting branch commander or assigned detective signature
                    </p>
                  )}
                </div>
              </div>

              {/* Dispatch Notes */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Intake Dispatch Notes: </span>
                {movement.dispatchNotes}
              </div>

              {/* Receipt Notes if present */}
              {movement.receiptNotes && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300/90">
                  <span className="font-semibold text-emerald-300">Branch Receipt Notes: </span>
                  {movement.receiptNotes}
                </div>
              )}

              {/* Simulated Receipt Action for testing the loop */}
              {movement.status === 'AWAITING_RECEIPT' && (
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSimulateReceipt(movement)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileCheck2 size={13} className="text-emerald-400" />
                    <span>Simulate Detective Branch Acknowledgment</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* INITIATE DOCKET MOVEMENT MODAL */}
      {isInitiatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl my-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Initiate Docket Handover
                </h3>
                <p className="text-xs text-slate-400">
                  Police Station to Detective / Specialist Branch
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsInitiatingModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4">
              
              {/* Select Case */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Registered CAS Docket
                </label>
                {registeredCases.length === 0 ? (
                  <p className="text-xs text-amber-400 italic">
                    No registered cases available to transfer. Register an online report first.
                  </p>
                ) : (
                  <select
                    value={selectedCaseNum}
                    onChange={(e) => setSelectedCaseNum(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  >
                    {registeredCases.map((c) => (
                      <option key={c.id} value={c.caseNumber}>
                        {c.caseNumber} - {c.incidentType} ({c.currentStatus})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Destination Unit */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Receiving Detective Branch / Unit
                </label>
                <select
                  value={destinationUnit}
                  onChange={(e) => setDestinationUnit(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  {DESTINATION_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dispatch Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Handover & Evidence Dispatch Notes
                </label>
                <textarea
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                  placeholder="Detail physical docket contents, statement counts, or urgent lead priorities..."
                  required
                />
              </div>

              {/* Origin Context */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Initiating Station:</span>
                  <span className="font-semibold text-white">{officer.station || 'SAPS Sandton Police Station'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dispatching Officer:</span>
                  <span className="font-semibold text-blue-300">{officer.rank} {officer.fullName} ({officer.personnelNumber})</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInitiatingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registeredCases.length === 0}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Send size={14} />
                  <span>Lock & Dispatch Docket</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
