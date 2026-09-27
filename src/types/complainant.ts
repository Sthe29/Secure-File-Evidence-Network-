export type IncidentCategory = 
  | 'Theft / Burglary'
  | 'Robbery'
  | 'Assault / GBH'
  | 'Malicious Damage to Property'
  | 'Fraud / Cybercrime'
  | 'Domestic Violence / Harassment'
  | 'Missing Person / Property'
  | 'Vehicle Theft / Hijacking'
  | 'Suspicious Activity'
  | 'Other Criminal Incident';

export type ReportStatus = 
  | 'Awaiting Review'
  | 'Under Station Review'
  | 'Officer Assigned'
  | 'Registered to Case'
  | 'Additional Info Required';

export interface IncidentLocation {
  address: string;
  suburb: string;
  city: string;
  province: string;
  preferredStation: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

export interface PoliceStation {
  id: string;
  name: string;
  precinctCode: string;
  address: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  emergencyPhone: string;
  stationCommander: string;
  operatingHours: string;
  latitude: number;
  longitude: number;
  services: string[];
}

export interface InvolvedParties {
  suspectDetails?: string;
  witnessDetails?: string;
  vehicleDetails?: string;
  stolenItems?: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  category: 'Photo' | 'Document' | 'Receipt' | 'Audio/Video' | 'Other';
}

export interface IncidentReport {
  id: string;
  referenceNumber: string; // e.g. SFEN-RPT-000124
  userId: string;
  complainantName: string;
  complainantPhone: string;
  complainantEmail: string;
  incidentType: IncidentCategory;
  incidentDate: string;
  incidentTime: string;
  location: IncidentLocation;
  description: string;
  involvedParties: InvolvedParties;
  attachments: AttachedFile[];
  status: ReportStatus;
  submittedAt: string;
  policeStation: string;
  stationNotes?: string;
  linkedCaseNumber?: string; // Generated once police register official case
}

export interface CaseTimelineEvent {
  title: string;
  date: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface RegisteredCase {
  id: string;
  caseNumber: string; // e.g. CAS 342/09/2026
  reportReference?: string; // e.g. SFEN-RPT-000124
  userId: string;
  incidentType: string;
  policeStation: string;
  investigatingOfficer: string;
  officerRank: string;
  dateRegistered: string;
  currentStatus: 'Case Registered' | 'Investigation Active' | 'Evidence Analysis' | 'Docket at NPA / Court' | 'Case Finalized';
  progressStage: number; // 1 to 5
  lastUpdateDate: string;
  lastUpdateSummary: string;
  nextCourtDate?: string;
  timeline: CaseTimelineEvent[];
}

export type ComplaintCategory = 
  | 'Investigation Delay / Lack of Updates'
  | 'Officer Unprofessionalism / Conduct'
  | 'Station Frontline Service Delivery'
  | 'Evidence Handling / Property Dispute'
  | 'Victim Support Services';

export type ComplaintStatus = 
  | 'Pending Review'
  | 'Assigned to Station Commander'
  | 'Investigation Active'
  | 'Resolution Issued';

export interface ServiceComplaint {
  id: string;
  referenceNumber: string; // e.g. SFEN-CMP-0042
  userId: string;
  category: ComplaintCategory;
  policeStation: string;
  linkedReference?: string; // Case or Report number
  incidentDate?: string;
  details: string;
  desiredResolution: string;
  status: ComplaintStatus;
  submittedAt: string;
  assignedOfficer?: string;
  resolutionFeedback?: string;
}

export interface ComplainantNotification {
  id: string;
  userId: string;
  type: 'report' | 'case' | 'complaint' | 'security';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkedId?: string;
  linkedTab?: ComplainantTab;
}

export type ComplainantTab = 
  | 'dashboard'
  | 'report-incident'
  | 'my-records'
  | 'my-reports'
  | 'my-cases'
  | 'find-station'
  | 'complaints'
  | 'notifications'
  | 'profile';
