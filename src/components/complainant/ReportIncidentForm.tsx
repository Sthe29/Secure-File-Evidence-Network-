import React, { useState } from 'react';
import { CitizenProfile } from '../../types/auth';
import { 
  IncidentCategory, 
  IncidentLocation, 
  InvolvedParties, 
  AttachedFile, 
  IncidentReport, 
  ComplainantTab 
} from '../../types/complainant';
import { submitIncidentReportToApi } from '../../services/complainantService';
import { EmergencyNoticeBanner } from './EmergencyNoticeBanner';
import { 
  FilePlus2, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  MapPin, 
  Upload, 
  Trash2, 
  ShieldAlert, 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  UserCheck, 
  Building2, 
  HelpCircle,
  Paperclip,
  Check,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Navigation,
  QrCode
} from 'lucide-react';
import { GoogleMapsWrapper } from '../maps/GoogleMapsWrapper';
import { IncidentLocationPickerMap } from '../maps/IncidentLocationPickerMap';
import { StationLocatorModal } from './StationLocatorModal';
import { StationVerificationPassModal } from './StationVerificationPassModal';
import { 
  POLICE_STATIONS as SAPS_STATIONS, 
  PoliceStation,
  findNearestPoliceStation 
} from '../../services/policeStationService';

interface ReportIncidentFormProps {
  citizen: CitizenProfile;
  onReportSubmitted: (newReport: IncidentReport) => void;
  onNavigate: (tab: ComplainantTab) => void;
}

const INCIDENT_CATEGORIES: IncidentCategory[] = [
  'Theft / Burglary',
  'Robbery',
  'Assault / GBH',
  'Fraud / Cybercrime',
  'Malicious Damage to Property',
  'Other Criminal Incident'
];

const PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape'
];

const POLICE_STATIONS = [
  'Central Precinct (Sector 4)',
  'Sandton Police Station',
  'Johannesburg Central Station',
  'Cape Town Central SAPS',
  'Durban Central SAPS',
  'Pretoria Central SAPS',
  'Randburg Police Station',
  'Midrand SAPS',
  'Other Nearest Police Station'
];

export const ReportIncidentForm: React.FC<ReportIncidentFormProps> = ({
  citizen,
  onReportSubmitted,
  onNavigate
}) => {
  // Steps: 1: Incident, 2: Location, 3: Narrative & People, 4: Files, 5: Review, 6: Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Form State
  const [incidentType, setIncidentType] = useState<IncidentCategory>('Theft / Burglary');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('12:00');
  
  // Location
  const [location, setLocation] = useState<IncidentLocation>({
    address: '',
    suburb: '',
    city: 'Johannesburg',
    province: 'Gauteng',
    preferredStation: 'SAPS Sandton (Central Precinct)',
    landmark: '',
    latitude: -26.0827,
    longitude: 28.0583
  });

  const [showStationModal, setShowStationModal] = useState(false);
  const [showAddressFields, setShowAddressFields] = useState(true);

  // Narrative & People Involved
  const [description, setDescription] = useState('');
  const [involvedParties, setInvolvedParties] = useState<InvolvedParties>({
    suspectDetails: '',
    witnessDetails: '',
    vehicleDetails: '',
    stolenItems: ''
  });

  // Attached files
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [simulatedFileName, setSimulatedFileName] = useState('');
  const [simulatedFileType, setSimulatedFileType] = useState<'Photo' | 'Document' | 'Receipt' | 'Other'>('Photo');
  
  // Declaration & Status
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<IncidentReport | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Handle Mock File Addition
  const handleAddAttachment = () => {
    if (!simulatedFileName.trim()) return;
    
    const newAtt: AttachedFile = {
      id: `att_${Date.now()}`,
      name: simulatedFileName.trim(),
      size: `${(Math.random() * 3 + 0.4).toFixed(1)} MB`,
      type: simulatedFileType === 'Photo' ? 'image/jpeg' : 'application/pdf',
      uploadedAt: new Date().toISOString(),
      category: simulatedFileType
    };

    setAttachments([...attachments, newAtt]);
    setSimulatedFileName('');
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleSimulateNativeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newAtt: AttachedFile = {
        id: `att_${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        category: file.type.includes('image') ? 'Photo' : 'Document'
      };
      setAttachments([...attachments, newAtt]);
    }
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    setFormError('');
    if (step === 1) {
      if (!incidentDate) {
        setFormError('Please select the incident date.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      const address = (location?.address || '').trim();
      const suburb = (location?.suburb || '').trim();
      const city = (location?.city || '').trim();

      if (!address) {
        setFormError('Please pinpoint your location on the map or type in your street address.');
        return false;
      }

      // Ensure valid non-empty values for suburb, city, and station so next steps succeed
      setLocation((prev) => ({
        ...prev,
        address,
        suburb: suburb || 'Central Area',
        city: city || 'Johannesburg',
        province: prev.province || 'Gauteng',
        preferredStation: prev.preferredStation || 'SAPS Sandton (Central Precinct)'
      }));
      return true;
    }
    if (step === 3) {
      if ((description || '').trim().length < 20) {
        setFormError('Please provide a detailed description of what happened (at least 20 characters).');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (prev < 5 ? (prev + 1 as any) : prev));
    }
  };

  const handleBack = () => {
    setFormError('');
    setCurrentStep((prev) => (prev > 1 ? (prev - 1 as any) : prev));
  };

  // Final Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationAgreed) {
      setFormError('Please confirm the declaration confirming that the information provided is true and correct.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
        const sessionToken = citizen.token || localStorage.getItem('sfen_auth_token');
        if (!sessionToken) throw new Error('Your public portal session has expired. Please sign in again.');
        const report = await submitIncidentReportToApi({
          userId: citizen.id,
          complainantName: citizen.fullName,
          complainantPhone: citizen.phoneNumber,
          complainantEmail: citizen.email,
          incidentType,
          incidentDate,
          incidentTime,
          location,
          description,
          involvedParties,
          attachments,
          policeStation: location.preferredStation
        }, sessionToken);

        setSubmittedReport(report);
        onReportSubmitted(report);
        setCurrentStep(6); // Success screen
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (currentStep === 6 && submittedReport) {
    return (
      <div id="report-submission-success-card" className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="p-7 sm:p-8 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl text-center space-y-5 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500" />

          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 size={36} className="stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
              Status: {submittedReport.status}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Incident Report Transmitted
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Your online incident statement has been securely registered in the SFEN docket queue for <strong className="text-white">{submittedReport.policeStation}</strong>.
            </p>
          </div>

          {/* Generated Reference Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">
              Unique SFEN Report Reference
            </span>
            <div className="font-mono font-extrabold text-2xl text-emerald-400 tracking-wider">
              {submittedReport.referenceNumber}
            </div>
            <p className="text-[11px] text-slate-500">
              Submitted: {new Date(submittedReport.submittedAt).toLocaleString()}
            </p>
          </div>

          {/* CRUCIAL NEXT STEP: IN-PERSON STATION VISIT */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <AlertTriangle size={18} />
              <span>Next Step: In-Person Station Visit to Open Your Official Case</span>
            </div>
            <p className="leading-relaxed text-xs text-slate-300">
              Your online report provides a preliminary overview of what recently occurred. To officially open a criminal court docket with a formal <strong className="text-white">CAS Number</strong>, you must visit <strong className="text-blue-300">{submittedReport.policeStation}</strong>.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                What happens when you arrive at the police station:
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                1. Present your reference number (<strong className="font-mono text-emerald-400">{submittedReport.referenceNumber}</strong>) or show your Digital Station Pass to the officer on duty.
              </p>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                2. The officer pulls up your online filed report on the officer portal, verifies your identity, and takes your sworn affidavit.
              </p>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                3. The officer generates your official <strong className="text-blue-300">CAS Docket Number</strong> and immediately transfers your case to the <strong className="text-white">Detective Branch</strong>!
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              id="btn-success-view-pass"
              onClick={() => setShowPassModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode size={15} />
              <span>View Station Pass / Verification Slip</span>
            </button>

            <button
              type="button"
              id="btn-success-view-station-map"
              onClick={() => setShowStationModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 size={15} />
              <span>View Station on Map</span>
            </button>

            <button
              type="button"
              id="btn-success-view-reports"
              onClick={() => onNavigate('my-reports')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText size={15} />
              <span>My Reports</span>
            </button>
          </div>

          {/* Station Verification Pass Modal */}
          {submittedReport && (
            <StationVerificationPassModal
              isOpen={showPassModal}
              onClose={() => setShowPassModal(false)}
              report={submittedReport}
            />
          )}

          {/* Station Locator Modal */}
          {submittedReport && (
            <StationLocatorModal
              isOpen={showStationModal}
              onClose={() => setShowStationModal(false)}
              location={submittedReport.location}
              policeStationName={submittedReport.policeStation}
              reportReference={submittedReport.referenceNumber}
              incidentType={submittedReport.incidentType}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="report-incident-container" className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Emergency Advisory Notice */}
      <EmergencyNoticeBanner />

      {/* Header & Steps */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Report an Incident Online
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Submit your preliminary statement and evidence before visiting the Community Service Centre.
            </p>
          </div>

          {/* Numbered Progress Indicator */}
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  currentStep === step
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                    : currentStep > step
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-950 text-slate-500 border border-slate-800'
                }`}
              >
                {currentStep > step ? <Check size={13} className="stroke-[3]" /> : step}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Error */}
      {formError && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5">
          <AlertTriangle size={16} className="text-rose-400 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* FORM BODY BASED ON STEP */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* STEP 1: Incident Type & Timing */}
        {currentStep === 1 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FilePlus2 size={16} className="text-emerald-400" />
              <span>Incident Classification & Date</span>
            </h3>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                Type of Criminal Incident or Occurrence <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INCIDENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setIncidentType(cat)}
                    className={`p-3 rounded-xl text-left text-xs font-medium border transition-all flex items-center justify-between cursor-pointer ${
                      incidentType === cat
                        ? 'bg-emerald-600/15 border-emerald-500 text-white shadow-xs'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <span>{cat}</span>
                    {incidentType === cat && (
                      <CheckCircle2 size={15} className="text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label htmlFor="inc-date" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Date of Incident <span className="text-rose-400">*</span></span>
                </label>
                <input
                  id="inc-date"
                  type="date"
                  required
                  value={incidentDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="inc-time" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span>Time (Optional)</span>
                </label>
                <input
                  id="inc-time"
                  type="time"
                  value={incidentTime}
                  onChange={(e) => setIncidentTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location & Receiving Police Station (with Google Maps) */}
        {currentStep === 2 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin size={16} className="text-emerald-400" />
                <span>Step 2: Incident Location & Receiving Police Station</span>
              </h3>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium self-start sm:self-auto">
                Google Maps Live Pinning
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Pin the incident location on the map, search by address, or use your GPS. The system automatically pinpoints the exact coordinates and recommends your nearest Community Service Centre (CSC) station.
            </p>

            {/* Interactive Google Map with Autocomplete and Station Proximity */}
            <GoogleMapsWrapper>
              <IncidentLocationPickerMap
                location={location}
                onLocationChange={(updated) => setLocation(updated)}
                onNearestStationFound={(station) => {
                  setLocation((prev) => {
                    if (!prev.preferredStation || prev.preferredStation === 'Central Precinct (Sector 4)') {
                      return { ...prev, preferredStation: station.name };
                    }
                    return prev;
                  });
                }}
              />
            </GoogleMapsWrapper>

            {/* Toggle for Fine-tuning / Manual Fields */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddressFields(!showAddressFields)}
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer py-1"
              >
                <span>{showAddressFields ? 'Hide Detailed Address Fields' : 'Review & Fine-Tune Address Fields'}</span>
                {showAddressFields ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showAddressFields && (
                <div className="space-y-4 pt-3 animate-fade-in">
                  <div className="space-y-1.5">
                    <label htmlFor="loc-address" className="text-xs font-semibold text-slate-200 block">
                      Street Address or Exact Location <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="loc-address"
                      type="text"
                      required
                      placeholder="e.g. 42 Nelson Mandela Boulevard, Corner 5th Ave"
                      value={location.address}
                      onChange={(e) => setLocation({ ...location, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="loc-suburb" className="text-xs font-semibold text-slate-200 block">
                        Suburb / Ward <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="loc-suburb"
                        type="text"
                        required
                        placeholder="e.g. Morningside"
                        value={location.suburb}
                        onChange={(e) => setLocation({ ...location, suburb: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="loc-city" className="text-xs font-semibold text-slate-200 block">
                        City / Town <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="loc-city"
                        type="text"
                        required
                        placeholder="e.g. Johannesburg"
                        value={location.city}
                        onChange={(e) => setLocation({ ...location, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="loc-province" className="text-xs font-semibold text-slate-200 block">
                        Province
                      </label>
                      <select
                        id="loc-province"
                        value={location.province}
                        onChange={(e) => setLocation({ ...location, province: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      >
                        {PROVINCES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="loc-landmark" className="text-xs font-semibold text-slate-200 block">
                      Prominent Landmark (Optional)
                    </label>
                    <input
                      id="loc-landmark"
                      type="text"
                      placeholder="e.g. Opp. Morningside Shopping Mall or Near Shell Petrol Station"
                      value={location.landmark}
                      onChange={(e) => setLocation({ ...location, landmark: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Preferred Police Precinct */}
                  <div className="space-y-1.5 pt-2">
                    <label htmlFor="loc-station" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Building2 size={14} className="text-emerald-400" />
                      <span>Assigned Police Station to Receive & Review Report <span className="text-rose-400">*</span></span>
                    </label>
                    <select
                      id="loc-station"
                      value={location.preferredStation}
                      onChange={(e) => setLocation({ ...location, preferredStation: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    >
                      {SAPS_STATIONS.map((st) => (
                        <option key={st.id} value={st.name}>
                          {st.name} ({st.suburb}, {st.city})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400">
                      The designated station Community Service Centre (CSC) officer will review this submission to register the official docket.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Detailed Description & Involved Parties */}
        {currentStep === 3 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText size={16} className="text-emerald-400" />
              <span>Step 3: Description of What Happened & People Involved</span>
            </h3>

            {/* Statement narrative */}
            <div className="space-y-1.5">
              <label htmlFor="inc-desc" className="text-xs font-semibold text-slate-200 block">
                Detailed Incident Statement <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="inc-desc"
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="State clearly and chronologically what happened, how the incident took place, what was taken or damaged, and any immediate actions taken..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Please be as specific as possible.</span>
                <span className={description.length < 20 ? 'text-amber-400 font-mono' : 'text-emerald-400 font-mono'}>
                  {description.length} characters (min 20)
                </span>
              </div>
            </div>

            {/* Involved Parties Accordion/Fields */}
            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                People, Suspects & Stolen Property (If Known)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="inc-suspects" className="text-xs font-semibold text-slate-300 block">
                    Suspect(s) Description
                  </label>
                  <input
                    id="inc-suspects"
                    type="text"
                    placeholder="e.g. Male, approx 30yrs, dark hoodie, red cap"
                    value={involvedParties.suspectDetails}
                    onChange={(e) => setInvolvedParties({ ...involvedParties, suspectDetails: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="inc-witnesses" className="text-xs font-semibold text-slate-300 block">
                    Witness(es) or Contact Info
                  </label>
                  <input
                    id="inc-witnesses"
                    type="text"
                    placeholder="e.g. Security guard Joseph (083 444 1122)"
                    value={involvedParties.witnessDetails}
                    onChange={(e) => setInvolvedParties({ ...involvedParties, witnessDetails: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="inc-vehicles" className="text-xs font-semibold text-slate-300 block">
                    Vehicle Details (Make, Model, Color, Reg)
                  </label>
                  <input
                    id="inc-vehicles"
                    type="text"
                    placeholder="e.g. Silver VW Polo, GP registration"
                    value={involvedParties.vehicleDetails}
                    onChange={(e) => setInvolvedParties({ ...involvedParties, vehicleDetails: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="inc-stolen" className="text-xs font-semibold text-slate-300 block">
                    Stolen / Damaged Items (Serials / Models)
                  </label>
                  <input
                    id="inc-stolen"
                    type="text"
                    placeholder="e.g. HP Laptop serial #5CG12984, iPhone 14"
                    value={involvedParties.stolenItems}
                    onChange={(e) => setInvolvedParties({ ...involvedParties, stolenItems: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Supporting Information & Files */}
        {currentStep === 4 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload size={16} className="text-emerald-400" />
              <span>Step 4: Supporting Information & Attachments (Optional)</span>
            </h3>

            <p className="text-xs text-slate-400">
              Attach photographs of damages, crime scene, invoices/receipts for stolen goods, CCTV stills, or written witness statements.
            </p>

            {/* Direct File Picker */}
            <div className="p-5 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/60 hover:bg-slate-950 text-center space-y-3 transition-colors relative">
              <input
                type="file"
                id="file-upload-input"
                onChange={handleSimulateNativeUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Click or drag files here"
              />
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <Upload size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-200">
                  Drag and drop files here, or <span className="text-emerald-400 underline">browse computer</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Supports JPG, PNG, PDF, MP4, DOCX (Max 15MB per file)
                </p>
              </div>
            </div>

            {/* Quick Demo Attachment Helper (for easy testing) */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 block">
                Or quickly add simulated supporting document / photo:
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. proof_of_ownership_receipt.pdf or damage_photo.jpg"
                  value={simulatedFileName}
                  onChange={(e) => setSimulatedFileName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
                <select
                  value={simulatedFileType}
                  onChange={(e: any) => setSimulatedFileType(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="Photo">Photo</option>
                  <option value="Receipt">Receipt / Invoice</option>
                  <option value="Document">Official Document</option>
                  <option value="Other">Other Evidence</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  disabled={!simulatedFileName.trim()}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Add File
                </button>
              </div>
            </div>

            {/* List of current attachments */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">
                  Attached Files ({attachments.length})
                </span>
                <div className="space-y-1.5">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Paperclip size={14} className="text-emerald-400 shrink-0" />
                        <span className="font-mono text-slate-200 truncate">{att.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {att.size}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                          {att.category}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Review All Information Before Submission */}
        {currentStep === 5 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Step 5: Review Your Information Before Submission</span>
              </h3>
              <span className="text-[11px] text-slate-400">Please review carefully</span>
            </div>

            {/* Summary Review Cards */}
            <div className="space-y-4">
              
              {/* Complainant Identity */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Complainant Particulars (From Account)
                </span>
                <p className="text-xs text-white font-semibold">{citizen.fullName}</p>
                <p className="text-[11px] text-slate-300 font-mono">
                  Phone: {citizen.phoneNumber} • Email: {citizen.email}
                </p>
              </div>

              {/* Incident Details Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Incident & Occurrence
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Type:</span>
                    <span className="font-semibold text-emerald-300">{incidentType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Date:</span>
                    <span className="font-mono text-white">{incidentDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Time:</span>
                    <span className="font-mono text-white">{incidentTime}</span>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Location & Destination Police Station
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-xs text-white">
                  {location.address || 'Address on record'}, {location.suburb}, {location.city} ({location.province})
                </p>
                {location.landmark && (
                  <p className="text-[11px] text-slate-400">Landmark: {location.landmark}</p>
                )}
                {location.latitude && location.longitude && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="text-slate-500">Pinned GPS:</span>
                    <span className="font-mono text-emerald-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                      {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                    </span>
                  </div>
                )}
                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="shrink-0" />
                    <span>Receiving Station: <strong>{location.preferredStation}</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-400">Official SAPS Review Unit</span>
                </div>
              </div>

              {/* Narrative & Involved Parties Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Statement & Involved Parties
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {description}
                </p>
                {(involvedParties.suspectDetails || involvedParties.stolenItems || involvedParties.vehicleDetails) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                    {involvedParties.suspectDetails && <div><strong>Suspects:</strong> {involvedParties.suspectDetails}</div>}
                    {involvedParties.stolenItems && <div><strong>Stolen Items:</strong> {involvedParties.stolenItems}</div>}
                    {involvedParties.vehicleDetails && <div><strong>Vehicles:</strong> {involvedParties.vehicleDetails}</div>}
                    {involvedParties.witnessDetails && <div><strong>Witnesses:</strong> {involvedParties.witnessDetails}</div>}
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Attached Supporting Files
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                {attachments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No attachments added (optional).</p>
                ) : (
                  <p className="text-xs text-emerald-300 font-mono">
                    {attachments.length} file(s) attached ({attachments.map((a) => a.name).join(', ')})
                  </p>
                )}
              </div>

            </div>

            {/* MANDATORY LEGAL DECLARATION */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="chk-confirm-declaration"
                  checked={declarationAgreed}
                  onChange={(e) => setDeclarationAgreed(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border border-slate-700 text-emerald-600 focus:ring-emerald-500 mt-0.5 accent-emerald-600 cursor-pointer shrink-0"
                />
                <span className="text-xs text-slate-200 leading-snug">
                  I solemnly declare that the information provided in this online incident statement is true and accurate to the best of my knowledge. I understand that submitting a false report to the police is a punishable statutory offense.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons: Back / Next / Submit */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {currentStep > 1 ? (
            <button
              type="button"
              id="btn-report-back"
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 font-semibold text-xs border border-slate-800 transition-colors"
            >
              Cancel
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              id="btn-report-next"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="submit"
              id="btn-report-submit-final"
              disabled={isSubmitting || !declarationAgreed}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Transmitting Statement...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Submit Incident Report (Awaiting Review)</span>
                </>
              )}
            </button>
          )}
        </div>

      </form>

    </div>
  );
};
