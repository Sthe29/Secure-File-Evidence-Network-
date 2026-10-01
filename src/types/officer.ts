import { IncidentReport, RegisteredCase } from './complainant';

export type OfficerTab = 
  | 'dashboard'
  | 'records'
  | 'reports'
  | 'cases'
  | 'detective-branch'
  | 'docket-movement'
  | 'profile';

export type OfficerAuditAction = 
  | 'REPORT_REVIEWED'
  | 'MORE_INFO_REQUESTED'
  | 'WALK_IN_INTAKE_CREATED'
  | 'CASE_REGISTERED'
  | 'DOCKET_HANDOVER_INITIATED'
  | 'DOCKET_RECEIPT_ACKNOWLEDGED';

export interface OfficerAuditLog {
  id: string;
  officerId: string;
  officerName: string;
  officerRank: string;
  personnelNumber: string;
  station: string;
  actionType: OfficerAuditAction;
  referenceNumber: string; // SFEN-RPT-xxx or CAS xxx
  description: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}

export type DocketMovementStatus = 'AWAITING_RECEIPT' | 'ACKNOWLEDGED_RECEIVED';

export interface DocketMovementRecord {
  id: string;
  caseNumber: string; // e.g. CAS 342/09/2026
  reportReference: string; // e.g. SFEN-RPT-000124
  offence: string;
  complainantName: string;
  previousCustodian?: string;
  newCustodian?: string;
  currentDocketCustodian?: string;
  origin: string; // e.g. Community Service Centre (CSC) - Sandton
  destination: string; // e.g. Detective Branch - General Crimes Desk
  initiatedBy: string; // Officer Name
  initiatedByPersonnelNumber: string;
  initiatedByRank: string;
  dispatchNotes: string;
  dispatchedAt: string;
  status: DocketMovementStatus;
  receivedBy?: string;
  receivedByPersonnelNumber?: string;
  receivedByRank?: string;
  receivedAt?: string;
  receiptNotes?: string;
}

export interface OfficerNotification {
  id: string;
  type: 'NEW_REPORT' | 'REPORT_UPDATE' | 'DOCKET_MOVEMENT' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkedTab?: OfficerTab;
  linkedId?: string;
}

export interface CaseRegistrationInput {
  reportId: string;
  reportReference: string;
  complainantName: string;
  complainantPhone: string;
  complainantEmail: string;
  incidentType: string;
  incidentDate: string;
  incidentTime: string;
  locationAddress: string;
  locationSuburb: string;
  chargeDescription: string;
  statutoryCode: string;
  priorityLevel: 'Standard' | 'Urgent' | 'High Priority';
  formalStatement: string;
  evidenceItems: Array<{
    name: string;
    type: string;
    size: number;
    dataUrl?: string;
  }>;
  evidenceIntakeNotes?: string;
  officialCaseNumber?: string;
  initialDocketDestination: string;
  officerIntakeNotes: string;
}

export interface DetectiveOfficer {
  id: string;
  fullName: string;
  rank: string;
  personnelNumber: string;
  desk: string;
  specialization: string;
  activeDocketsCount: number;
  contactPhone: string;
  isAvailable: boolean;
}

export interface InvestigationDiaryEntry {
  id: string;
  caseNumber: string;
  authorName: string;
  authorRank: string;
  personnelNumber: string;
  entryType: 'DIRECTIVE' | 'INVESTIGATION_NOTE' | 'EVIDENCE_CATALOGUED' | 'WITNESS_INTERVIEW' | 'COURT_UPDATE' | 'COMPLAINANT_UPDATE';
  content: string;
  timestamp: string;
}

export interface CaseExhibit {
  id: string;
  caseNumber: string;
  exhibitNumber: string; // e.g. SAP13/2026/89
  description: string;
  category: 'PHYSICAL_PROPERTY' | 'CCTV_DIGITAL' | 'FORENSIC_SWAB' | 'BALLISTICS' | 'DOCUMENTARY';
  collectedBy: string;
  storageLocation: string;
  dateLogged: string;
}
