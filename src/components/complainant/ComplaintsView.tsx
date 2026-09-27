import React, { useState } from 'react';
import { CitizenProfile } from '../../types/auth';
import { ServiceComplaint, ComplaintCategory, ComplainantTab } from '../../types/complainant';
import { submitServiceComplaint } from '../../services/complainantService';
import { 
  AlertCircle, 
  Building2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  X, 
  Calendar, 
  ChevronRight,
  FileText
} from 'lucide-react';

interface ComplaintsViewProps {
  citizen: CitizenProfile;
  complaints: ServiceComplaint[];
  onRefreshData: () => void;
  onNavigate: (tab: ComplainantTab) => void;
}

const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Investigation Delay / Lack of Updates',
  'Officer Unprofessionalism / Conduct',
  'Station Frontline Service Delivery',
  'Evidence Handling / Property Dispute',
  'Victim Support Services'
];

const POLICE_STATIONS = [
  'Central Precinct (Sector 4)',
  'Sandton Police Station',
  'Johannesburg Central Station',
  'Cape Town Central SAPS',
  'Durban Central SAPS',
  'Pretoria Central SAPS',
  'Other Police Station'
];

export const ComplaintsView: React.FC<ComplaintsViewProps> = ({
  citizen,
  complaints,
  onRefreshData
}) => {
  const [isLodgeModalOpen, setIsLodgeModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ServiceComplaint | null>(null);
  
  // Form State
  const [category, setCategory] = useState<ComplaintCategory>('Investigation Delay / Lack of Updates');
  const [policeStation, setPoliceStation] = useState('Central Precinct (Sector 4)');
  const [linkedReference, setLinkedReference] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [details, setDetails] = useState('');
  const [desiredResolution, setDesiredResolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (details.trim().length < 20) {
      setFormError('Please provide more detail regarding the service complaint (at least 20 characters).');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    setTimeout(() => {
      try {
        const newCmp = submitServiceComplaint({
          userId: citizen.id,
          category,
          policeStation,
          linkedReference: linkedReference.trim() || undefined,
          incidentDate,
          details,
          desiredResolution: desiredResolution.trim() || 'Prompt investigation review and status communication'
        });

        setIsLodgeModalOpen(false);
        setDetails('');
        setDesiredResolution('');
        setLinkedReference('');
        setSuccessToast(`Service complaint ${newCmp.referenceNumber} has been logged and assigned to the Station Commander.`);
        onRefreshData();
        setTimeout(() => setSuccessToast(null), 6000);
      } catch {
        setFormError('Failed to lodge complaint. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending Review':
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1">
            <Clock size={11} />
            <span>Pending Review</span>
          </span>
        );
      case 'Assigned to Station Commander':
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center gap-1">
            <Building2 size={11} />
            <span>Assigned to Station Commander</span>
          </span>
        );
      case 'Resolution Issued':
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
            <CheckCircle2 size={11} />
            <span>Resolution Issued</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="complaints-view" className="space-y-6 animate-fade-in">
      
      {/* Toast */}
      {successToast && (
        <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Police Service Complaints
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Lodge grievances regarding case delays, officer conduct, or service delivery directly to Station Command.
          </p>
        </div>

        <button
          type="button"
          id="btn-lodge-complaint"
          onClick={() => setIsLodgeModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-center cursor-pointer"
        >
          <Plus size={16} />
          <span>Lodge Service Complaint</span>
        </button>
      </div>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <AlertCircle size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-300">No service complaints logged</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            If you have experienced unsatisfactory service, investigation delays, or unprofessional conduct, you can log a formal inquiry.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3.5 group"
            >
              {/* Row 1: Reference, Status, Category, and Submitted Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono font-extrabold text-sm text-amber-400">
                    {c.referenceNumber}
                  </span>
                  {getStatusBadge(c.status)}
                  <span className="text-xs font-bold text-white">
                    {c.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Calendar size={13} className="text-slate-500" />
                  <span>Submitted: {new Date(c.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Row 2: Police Station & Linked Case (if applicable) & View Details Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
                  <Building2 size={14} className="text-amber-400 shrink-0" />
                  <span className="font-semibold text-slate-200">{c.policeStation}</span>
                  {c.linkedReference && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 text-[11px]">
                        Linked Case: <strong className="font-mono text-emerald-400">{c.linkedReference}</strong>
                      </span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  id={`btn-view-complaint-${c.id}`}
                  onClick={() => setSelectedComplaint(c)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <span>View Details</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaint Full Details Modal */}
      {selectedComplaint && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto space-y-5">
            <button
              type="button"
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-extrabold text-base text-amber-400">
                  {selectedComplaint.referenceNumber}
                </span>
                {getStatusBadge(selectedComplaint.status)}
              </div>
              <h3 className="text-base font-bold text-white">
                {selectedComplaint.category}
              </h3>
              <p className="text-xs text-slate-400">
                Submitted on {new Date(selectedComplaint.submittedAt).toLocaleDateString()} to {selectedComplaint.policeStation}
              </p>
            </div>

            {/* Meta details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] font-semibold block">Police Station</span>
                <p className="text-white font-medium">{selectedComplaint.policeStation}</p>
                {selectedComplaint.linkedReference && (
                  <p className="text-[11px] text-slate-400 font-mono">
                    Linked: {selectedComplaint.linkedReference}
                  </p>
                )}
              </div>

              {selectedComplaint.assignedOfficer ? (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1.5">
                    <UserCheck size={12} className="text-blue-400" />
                    <span>Assigned Reviewer</span>
                  </span>
                  <p className="text-white font-medium">{selectedComplaint.assignedOfficer}</p>
                  <p className="text-[11px] text-blue-300">Station Command Office</p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px] font-semibold block">Review Assignment</span>
                  <p className="text-slate-300 text-[11px]">Queued for Station Commander inspection</p>
                </div>
              )}
            </div>

            {/* Statement of Complaint */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">
                Complaint Statement
              </span>
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedComplaint.details}
              </p>
            </div>

            {/* Requested Remedy */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">
                Requested Remedy
              </span>
              <p className="text-slate-200">
                {selectedComplaint.desiredResolution}
              </p>
            </div>

            {/* Station Commander Feedback (if issued) */}
            {selectedComplaint.resolutionFeedback && (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <CheckCircle2 size={15} />
                  <span>Station Commander Formal Resolution:</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px] whitespace-pre-wrap">
                  {selectedComplaint.resolutionFeedback}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lodging Modal */}
      {isLodgeModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto space-y-5">
            <button
              type="button"
              onClick={() => setIsLodgeModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                Submit Service Complaint
              </h3>
              <p className="text-xs text-slate-400">
                Provide details of the service failure, station, and involved personnel.
              </p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  Complaint Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500"
                >
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Police Station Involved <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={policeStation}
                    onChange={(e) => setPoliceStation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500"
                  >
                    {POLICE_STATIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Linked Case or Report Reference (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CAS 342/08/2026 or SFEN-RPT-000124"
                    value={linkedReference}
                    onChange={(e) => setLinkedReference(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  Grievance Statement <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain clearly what took place, which officer or desk was involved, dates of unreturned calls or station visits..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  Desired Resolution
                </label>
                <input
                  type="text"
                  placeholder="e.g. Expedited docket update, detective reallocation, return of impounded property"
                  value={desiredResolution}
                  onChange={(e) => setDesiredResolution(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLodgeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? 'Logging...' : 'Submit to Station Commander'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
