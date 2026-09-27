import { CaseWorkspaceTab, DocketCustodyStatus, InstructionStatus } from './detective';
import { ComplaintCategory } from './complainant';

export type CommanderNavTab = 
  | 'dashboard'
  | 'cases'
  | 'detectives-complaints'
  | 'detectives'
  | 'complaints'
  | 'notifications'
  | 'profile';

export type CommanderCaseTab = 
  | 'overview'
  | 'investigation-progress'
  | 'supervisory-review'
  | 'instructions'
  | 'documents'
  | 'docket-movement'
  | 'audit-trail';

export interface SupervisoryReviewRecord {
  id: string;
  caseNumber: string;
  commanderName: string;
  commanderRank: string;
  commanderPersonnelNumber: string;
  reviewDate: string; // ISO string
  reviewNotes: string;
  furtherActionRequired: string;
  nextReviewDate: string; // YYYY-MM-DD
  reviewOutcome: 'Investigation Satisfactory' | 'Further Directives Issued' | 'Ready for NPA / Court Referral' | 'Docket Closure Recommended';
  auditSecurityHash?: string;
}

export interface AuthorisedStationDetective {
  id: string;
  personnelNumber: string; // e.g. "POL-20491"
  fullName: string;
  rank: string; // e.g. "Detective Inspector"
  email: string;
  phone: string;
  station: string;
  division: string;
  specialization: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'COURT_DUTY';
}

export interface CommanderDetectiveWorkload {
  detective: AuthorisedStationDetective;
  activeAssignedCasesCount: number;
  unacknowledgedDocketsCount: number;
  casesRequiringReviewCount: number;
  outstandingDirectivesCount: number;
  courtReadyCasesCount: number;
}

export interface StationComplaintRecord {
  id: string;
  referenceNumber: string; // e.g. "CMP-2026-081"
  complainantName: string;
  complainantPhone: string;
  complainantEmail?: string;
  category: ComplaintCategory;
  linkedCaseNumber?: string; // e.g. "CAS 342/08/2026"
  policeStation: string;
  dateSubmitted: string;
  details: string;
  desiredResolution: string;
  status: 'Pending Review' | 'Under Investigation' | 'Action Taken' | 'Resolved';
  commanderNotes?: string;
  outcomeResponse?: string;
  handledByCommanderName?: string;
  handledByRank?: string;
  handledByPersonnelNumber?: string;
  resolvedAt?: string;
}

export interface CommanderNotification {
  id: string;
  type: 
    | 'CASE_AWAITING_ASSIGNMENT'
    | 'DOCKET_AWAITING_ACKNOWLEDGEMENT'
    | 'CASE_REQUIRES_REVIEW'
    | 'INSTRUCTION_RESPONDED'
    | 'SERVICE_COMPLAINT'
    | 'DOCKET_TRANSFERRED';
  title: string;
  message: string;
  caseNumber?: string;
  complaintId?: string;
  timestamp: string;
  read: boolean;
  priority: 'normal' | 'urgent';
}
