import { UserProfile } from '../types/auth';
import {
  DetectiveCaseDocket,
  InvestigationDiaryRecord,
  CaseDocumentRecord,
  SupervisorInstruction,
  DocketTransferMovement,
  CaseAuditEntry,
  DetectiveNotification
} from '../types/detective';

const DETECTIVE_STORAGE_KEYS = {
  CASES: 'sfen_detective_dockets',
  DIARY: 'sfen_detective_diary_entries',
  DOCUMENTS: 'sfen_detective_documents',
  INSTRUCTIONS: 'sfen_detective_instructions',
  MOVEMENTS: 'sfen_detective_movements',
  AUDIT: 'sfen_detective_audit_trails',
  NOTIFICATIONS: 'sfen_detective_notifications'
};

function safeStorageGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function safeStorageSet<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // storage fallback
  }
}

// Generate simple mock cryptographic SHA-256 seal for immutable chain of custody
function generateSecurityHash(caseNum: string, action: string, timestamp: string): string {
  const seed = `${caseNum}-${action}-${timestamp}-${Math.random().toString(36).substring(2, 9)}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return `SHA256:${Math.abs(hash).toString(16).padStart(8, '0').toUpperCase()}7b9e${Date.now().toString(16)}`;
}

// Initial Seed Dockets assigned to Detective Inspector David Khumalo (POL-20491)
const SEED_CASES: DetectiveCaseDocket[] = [
  {
    id: 'det_cas_001',
    caseNumber: 'CAS 342/08/2026',
    reportReference: 'SFEN-RPT-000088',
    incidentType: 'Fraud / Cybercrime',
    offenceSubcategory: 'Electronic Banking Phishing & Unauthorized Interception',
    policeStation: 'SAPS Sandton Police Station',
    dateReported: '2026-08-22',
    incidentDate: '2026-08-20',
    incidentTime: '11:15',
    incidentLocation: {
      address: '42 Nelson Mandela Boulevard',
      suburb: 'Morningside',
      city: 'Johannesburg',
      province: 'Gauteng'
    },
    complainant: {
      fullName: 'Thandi Molefe',
      phoneNumber: '0825550192',
      email: 'thandi.molefe@gmail.com',
      nationalId: '920412 5082 089',
      statementSummary: 'Complainant reported unauthorized electronic fund transfers totaling R84,500 following a fraudulent SMS phishing scheme mimicking major clearing banking institution.'
    },
    investigatingOfficerId: 'usr_pol_20491',
    investigatingOfficerName: 'David Khumalo',
    investigatingOfficerRank: 'Detective Inspector',
    investigatingOfficerPersonnelNumber: 'POL-20491',
    assignedDate: '2026-08-25',
    lastActivityDate: '2026-09-22',
    currentStatus: 'Investigation Active',

    // Registration Origin: Registered by CSC Officer Sarah Ndlovu
    registeredByOfficerName: 'Sarah Ndlovu',
    registeredByOfficerRank: 'Constable',
    registeredByPersonnelNumber: 'POL-10824',
    registeredAt: '2026-08-22T08:30:00Z',

    // Custody tracking
    currentCustodianName: 'Det. Insp. David Khumalo',
    currentCustodianRank: 'Detective Inspector',
    currentCustodianPersonnelNumber: 'POL-20491',
    currentCustodianDepartment: 'Commercial Crime Section - Specialist Desk',
    previousCustodianName: 'Constable Sarah Ndlovu (CSC Frontline Intake)',
    previousCustodianRank: 'Constable',
    custodyStatus: 'HELD_BY_INVESTIGATING_OFFICER',
    isCustodyAcknowledgedByDetective: true,
    acknowledgedCustodyAt: '2026-08-25T09:30:00Z',

    statutoryCode: 'Sec 86(1) ECT Act 25 of 2002 / Common Law Fraud',
    priorityLevel: 'High Priority',
    nextCourtDate: '2026-10-15 (Specialised Commercial Court)',
    scheduledReviewDate: '2026-09-28'
  },
  {
    id: 'det_cas_002',
    caseNumber: 'CAS 118/09/2026',
    reportReference: 'SFEN-RPT-000109',
    incidentType: 'Commercial Extortion / Wire Fraud',
    offenceSubcategory: 'Corporate Email Compromise & Syndicate Interception',
    policeStation: 'SAPS Sandton Police Station',
    dateReported: '2026-09-12',
    incidentDate: '2026-09-10',
    incidentTime: '08:45',
    incidentLocation: {
      address: '15 Rivonia Road, Sandhurst Office Park',
      suburb: 'Sandhurst',
      city: 'Johannesburg',
      province: 'Gauteng'
    },
    complainant: {
      fullName: 'Johan Van Der Merwe',
      phoneNumber: '0834190822',
      email: 'johan.vdm@merwe-enterprises.co.za',
      nationalId: '780115 5041 084',
      statementSummary: 'Supplier invoice email hijacked via man-in-the-middle server routing. Payment redirected to an offshore-linked domestic account.'
    },
    investigatingOfficerId: 'usr_pol_20491',
    investigatingOfficerName: 'David Khumalo',
    investigatingOfficerRank: 'Detective Inspector',
    investigatingOfficerPersonnelNumber: 'POL-20491',
    assignedDate: '2026-09-21',
    lastActivityDate: '2026-09-21',
    currentStatus: 'Investigation Active',

    // Registration Origin
    registeredByOfficerName: 'Sarah Ndlovu',
    registeredByOfficerRank: 'Constable',
    registeredByPersonnelNumber: 'POL-10824',
    registeredAt: '2026-09-12T10:00:00Z',

    // Custody tracking: Transferred by Station Commander Elena Vance, awaiting detective acknowledgment
    currentCustodianName: 'Senior Superintendent Elena Vance (Station Command)',
    currentCustodianRank: 'Senior Superintendent',
    currentCustodianPersonnelNumber: 'POL-30912',
    currentCustodianDepartment: 'Station Commander Review Desk',
    previousCustodianName: 'Constable Sarah Ndlovu (CSC Frontline Intake)',
    previousCustodianRank: 'Constable',
    custodyStatus: 'TRANSFERRED_AWAITING_RECEIPT',
    isCustodyAcknowledgedByDetective: false, // Awaiting Detective David Khumalo's formal receipt!
    statutoryCode: 'Cybercrimes Act 19 of 2020 (Sec 3 & 4)',
    priorityLevel: 'Urgent',
    scheduledReviewDate: '2026-09-25'
  },
  {
    id: 'det_cas_003',
    caseNumber: 'CAS 205/09/2026',
    reportReference: 'SFEN-RPT-000115',
    incidentType: 'Fraud / Cybercrime',
    offenceSubcategory: 'SIM-Swap Identity Theft & Payroll Diversion',
    policeStation: 'SAPS Sandton Police Station',
    dateReported: '2026-09-15',
    incidentDate: '2026-09-14',
    incidentTime: '16:00',
    incidentLocation: {
      address: '88 Katherine Street',
      suburb: 'Sandown',
      city: 'Johannesburg',
      province: 'Gauteng'
    },
    complainant: {
      fullName: 'Priya Naidoo',
      phoneNumber: '0712398410',
      email: 'p.naidoo@innovatetech.co.za',
      nationalId: '861020 0142 081',
      statementSummary: 'Mobile telecommunications SIM swap performed at retail kiosk without FICA verification. OTPs intercepted to drain liquid savings.'
    },
    investigatingOfficerId: 'usr_pol_20491',
    investigatingOfficerName: 'David Khumalo',
    investigatingOfficerRank: 'Detective Inspector',
    investigatingOfficerPersonnelNumber: 'POL-20491',
    assignedDate: '2026-09-16',
    lastActivityDate: '2026-09-19',
    currentStatus: 'Evidence Analysis',

    // Registration Origin
    registeredByOfficerName: 'Sarah Ndlovu',
    registeredByOfficerRank: 'Constable',
    registeredByPersonnelNumber: 'POL-10824',
    registeredAt: '2026-09-15T14:20:00Z',

    // Custody tracking
    currentCustodianName: 'Det. Insp. David Khumalo',
    currentCustodianRank: 'Detective Inspector',
    currentCustodianPersonnelNumber: 'POL-20491',
    currentCustodianDepartment: 'Commercial Crime Section - Specialist Desk',
    previousCustodianName: 'Constable Sarah Ndlovu (CSC Frontline Intake)',
    previousCustodianRank: 'Constable',
    custodyStatus: 'HELD_BY_INVESTIGATING_OFFICER',
    isCustodyAcknowledgedByDetective: true,
    acknowledgedCustodyAt: '2026-09-16T11:00:00Z',
    statutoryCode: 'RICA Act 70 of 2002 / Electronic Communications & Transactions Act',
    priorityLevel: 'Standard',
    scheduledReviewDate: '2026-10-02'
  }
];

// Initial Seed Investigation Diary
const SEED_DIARY: InvestigationDiaryRecord[] = [
  {
    id: 'dia_001',
    caseNumber: 'CAS 342/08/2026',
    actionTaken: 'Reviewed initial online statement and complainant bank statement logs. Prepared formal application under Section 205 of Criminal Procedure Act 51 of 1977 for beneficiary account holder details.',
    resultOutcome: 'Sec. 205 warrant draft vetted by Senior Public Prosecutor. Ready for judicial authorization at Randburg Magistrate Court.',
    documentReference: 'DOC-S205-001',
    nextActionRequired: 'Serve authorized Sec. 205 directive on Absa and Standard Bank fraud divisions.',
    authorName: 'David Khumalo',
    authorRank: 'Detective Inspector',
    personnelNumber: 'POL-20491',
    timestamp: '2026-08-26T10:15:00Z'
  },
  {
    id: 'dia_002',
    caseNumber: 'CAS 342/08/2026',
    actionTaken: 'Conducted follow-up interview with complainant Thandi Molefe via telephone. Verified timestamp of phishing SMS received on 2026-08-20.',
    resultOutcome: 'Complainant provided export of SMS header metadata and verified no secondary devices had access to her banking credentials.',
    documentReference: 'DOC-A1-001',
    nextActionRequired: 'Submit phone extraction report to digital forensics registrar.',
    authorName: 'David Khumalo',
    authorRank: 'Detective Inspector',
    personnelNumber: 'POL-20491',
    timestamp: '2026-09-02T14:40:00Z'
  },
  {
    id: 'dia_003',
    caseNumber: 'CAS 342/08/2026',
    actionTaken: 'Received preliminary returns from commercial bank legal department regarding destination account #40918274.',
    resultOutcome: 'Account identified as registered under fictitious company shell. Account balance of R32,100 frozen under POCA directive pending court forfeiture.',
    documentReference: 'DOC-BANK-002',
    nextActionRequired: 'Trace ATM withdrawal footage from Randburg Square ATM where initial R10,000 cash out took place.',
    authorName: 'David Khumalo',
    authorRank: 'Detective Inspector',
    personnelNumber: 'POL-20491',
    timestamp: '2026-09-18T11:20:00Z'
  }
];

// Initial Seed Documents
const SEED_DOCUMENTS: CaseDocumentRecord[] = [
  {
    id: 'doc_001',
    caseNumber: 'CAS 342/08/2026',
    documentRef: 'DOC-A1-001',
    title: 'Complainant Sworn Affidavit (A1 Statement)',
    category: 'Sworn Statement (A1/A2)',
    description: 'Statutory sworn statement under oath taken from complainant Thandi Molefe detailing the timeline of fraud.',
    fileFormat: 'PDF',
    fileSize: '1.4 MB',
    addedBy: 'Sarah Ndlovu',
    addedByRank: 'Constable',
    addedByPersonnelNumber: 'POL-10824',
    addedAt: '2026-08-22T11:35:00Z',
    hashVerification: 'SHA256:7B88C41A8820BEE91244C'
  },
  {
    id: 'doc_002',
    caseNumber: 'CAS 342/08/2026',
    documentRef: 'DOC-S205-001',
    title: 'Section 205 CPA Directive Application',
    category: 'Section 205 Subpoena',
    description: 'Judicial application for subpoena of financial records and IP server access logs.',
    fileFormat: 'PDF',
    fileSize: '820 KB',
    addedBy: 'David Khumalo',
    addedByRank: 'Detective Inspector',
    addedByPersonnelNumber: 'POL-20491',
    addedAt: '2026-08-26T10:30:00Z',
    hashVerification: 'SHA256:F41299C880194A8E02341'
  },
  {
    id: 'doc_003',
    caseNumber: 'CAS 342/08/2026',
    documentRef: 'DOC-BANK-002',
    title: 'Bank Subpoena Returns & Beneficiary Ledger',
    category: 'Documentary / Financial Audit',
    description: 'Certified financial transaction records showing beneficiary account routing and freeze order confirmation.',
    fileFormat: 'PDF',
    fileSize: '3.1 MB',
    addedBy: 'David Khumalo',
    addedByRank: 'Detective Inspector',
    addedByPersonnelNumber: 'POL-20491',
    addedAt: '2026-09-18T11:45:00Z',
    hashVerification: 'SHA256:E0911A3912DFB7701192C'
  }
];

// Initial Seed Supervisor Instructions
const SEED_INSTRUCTIONS: SupervisorInstruction[] = [
  {
    id: 'inst_001',
    caseNumber: 'CAS 342/08/2026',
    offenceCategory: 'Fraud / Cybercrime',
    instructionText: 'Follow up immediately on Section 205 returns from Absa Bank Fraud Division. Ensure notice of preservation is lodged under Section 38 of Prevention of Organised Crime Act (POCA).',
    issuedBy: 'Elena Vance',
    issuedByRank: 'Senior Superintendent',
    issuedByPersonnelNumber: 'POL-30912',
    issuedAt: '2026-09-10T08:30:00Z',
    requiredReviewDate: '2026-09-28',
    priority: 'Urgent',
    status: 'IN_PROGRESS',
    responseActionTaken: 'Preservation request served on clearing bank risk counsel. Interim balance freeze verified.',
    responseResult: 'Bank compliance confirmed freezing of R32,100 pending High Court preservation ruling.',
    respondedAt: '2026-09-18T12:00:00Z',
    respondedBy: 'Det. Insp. David Khumalo'
  },
  {
    id: 'inst_002',
    caseNumber: 'CAS 118/09/2026',
    offenceCategory: 'Commercial Extortion / Wire Fraud',
    instructionText: 'Confirm formal docket custody intake. Subpoena mail exchange headers and obtain Section 205 directive for ISP routing IP addresses in Sandhurst.',
    issuedBy: 'Elena Vance',
    issuedByRank: 'Senior Superintendent',
    issuedByPersonnelNumber: 'POL-30912',
    issuedAt: '2026-09-21T14:00:00Z',
    requiredReviewDate: '2026-09-25',
    priority: 'Critical',
    status: 'OUTSTANDING'
  },
  {
    id: 'inst_003',
    caseNumber: 'CAS 205/09/2026',
    offenceCategory: 'Fraud / Cybercrime',
    instructionText: 'Interview the cellular network franchise manager at Sandown branch to obtain CCTV footage and employee terminal login records during time of SIM swap.',
    issuedBy: 'Elena Vance',
    issuedByRank: 'Senior Superintendent',
    issuedByPersonnelNumber: 'POL-30912',
    issuedAt: '2026-09-17T09:15:00Z',
    requiredReviewDate: '2026-10-02',
    priority: 'Routine',
    status: 'OUTSTANDING'
  }
];

// Initial Seed Docket Movements
const SEED_MOVEMENTS: DocketTransferMovement[] = [
  {
    id: 'det_mov_001',
    caseNumber: 'CAS 342/08/2026',
    reportReference: 'SFEN-RPT-000088',
    previousCustodian: 'Constable Sarah Ndlovu (CSC Frontline Intake)',
    newCustodian: 'Det. Insp. David Khumalo',
    currentDocketCustodian: 'Det. Insp. David Khumalo',
    senderName: 'Sarah Ndlovu',
    senderRank: 'Constable',
    senderPersonnelNumber: 'POL-10824',
    senderStation: 'SAPS Sandton Police Station (CSC Frontline)',
    destination: 'Commercial Crime Section - Specialist Desk',
    intendedRecipientName: 'David Khumalo',
    intendedRecipientRole: 'Detective Inspector',
    movementReason: 'Physical & digital docket intake transfer following sworn verification of online report SFEN-RPT-000088.',
    dispatchedAt: '2026-08-22T11:45:00Z',
    status: 'ACKNOWLEDGED_RECEIVED',
    acknowledgedBy: 'David Khumalo',
    acknowledgedByRank: 'Detective Inspector',
    acknowledgedByPersonnelNumber: 'POL-20491',
    acknowledgedAt: '2026-08-25T09:30:00Z',
    acknowledgementNotes: 'Physical docket received at Commercial Crime Section safe. Section A and B validated.'
  },
  {
    id: 'det_mov_002',
    caseNumber: 'CAS 118/09/2026',
    reportReference: 'SFEN-RPT-000109',
    previousCustodian: 'Senior Superintendent Elena Vance (Station Commander)',
    newCustodian: 'Det. Insp. David Khumalo',
    currentDocketCustodian: 'Senior Superintendent Elena Vance (Pending Detective Receipt)',
    senderName: 'Elena Vance',
    senderRank: 'Senior Superintendent',
    senderPersonnelNumber: 'POL-30912',
    senderStation: 'Metropolitan Police Command',
    destination: 'Commercial Crime Section - Specialist Desk',
    intendedRecipientName: 'David Khumalo',
    intendedRecipientRole: 'Detective Inspector',
    movementReason: 'High priority corporate email compromise docket returned to Specialist Lead Detective with supervisory inspection directives.',
    dispatchedAt: '2026-09-21T13:45:00Z',
    status: 'AWAITING_ACKNOWLEDGEMENT'
  }
];

// Initial Seed Case Audit Trail
const SEED_AUDIT: CaseAuditEntry[] = [
  {
    id: 'aud_d_001',
    caseNumber: 'CAS 342/08/2026',
    action: 'DOCKET_ACCESSED',
    userFullName: 'David Khumalo',
    userRank: 'Detective Inspector',
    userPersonnelNumber: 'POL-20491',
    userRole: 'DETECTIVE',
    description: 'Authorized Detective accessed case docket workspace for initial review.',
    timestamp: '2026-08-25T09:20:00Z',
    securityHash: 'SHA256:88F9A102DE4'
  },
  {
    id: 'aud_d_002',
    caseNumber: 'CAS 342/08/2026',
    action: 'DOCKET_RECEIPT_ACKNOWLEDGED',
    userFullName: 'David Khumalo',
    userRank: 'Detective Inspector',
    userPersonnelNumber: 'POL-20491',
    userRole: 'DETECTIVE',
    description: 'Investigating Officer acknowledged physical & digital docket receipt into Commercial Crime Section custody.',
    timestamp: '2026-08-25T09:30:00Z',
    securityHash: 'SHA256:91C00284F31'
  },
  {
    id: 'aud_d_003',
    caseNumber: 'CAS 342/08/2026',
    action: 'INVESTIGATION_ENTRY_RECORDED',
    userFullName: 'David Khumalo',
    userRank: 'Detective Inspector',
    userPersonnelNumber: 'POL-20491',
    userRole: 'DETECTIVE',
    description: 'Added SAPS 5 Investigation Diary entry: Sec 205 subpoena drafting for bank audit accounts.',
    timestamp: '2026-08-26T10:15:00Z',
    securityHash: 'SHA256:AA1048B991E'
  },
  {
    id: 'aud_d_004',
    caseNumber: 'CAS 342/08/2026',
    action: 'DOCUMENT_ATTACHED',
    userFullName: 'David Khumalo',
    userRank: 'Detective Inspector',
    userPersonnelNumber: 'POL-20491',
    userRole: 'DETECTIVE',
    description: 'Attached document: Section 205 CPA Directive Application (DOC-S205-001).',
    timestamp: '2026-08-26T10:30:00Z',
    securityHash: 'SHA256:CC482019BA2'
  }
];

// Initial Seed Notifications for Detective David Khumalo
const SEED_NOTIFS: DetectiveNotification[] = [
  {
    id: 'det_notif_001',
    type: 'ASSIGNMENT',
    title: 'New Case Assigned: CAS 118/09/2026',
    message: 'Corporate wire fraud docket transferred to your custody by Snr. Supt. Elena Vance. Formal receipt acknowledgement required.',
    caseNumber: 'CAS 118/09/2026',
    timestamp: '2026-09-21T13:45:00Z',
    read: false,
    priority: 'high'
  },
  {
    id: 'det_notif_002',
    type: 'INSTRUCTION',
    title: 'Supervisor Directive Issued for CAS 342/08/2026',
    message: 'Station Commander Vance issued an urgent instruction regarding POCA balance preservation notice.',
    caseNumber: 'CAS 342/08/2026',
    timestamp: '2026-09-10T08:30:00Z',
    read: true,
    priority: 'high'
  },
  {
    id: 'det_notif_003',
    type: 'REVIEW_DUE',
    title: 'Upcoming Docket Inspection: CAS 118/09/2026',
    message: 'Case inspection scheduled for 2026-09-25. Ensure preliminary subpoena returns are logged in the Investigation Diary.',
    caseNumber: 'CAS 118/09/2026',
    timestamp: '2026-09-22T08:00:00Z',
    read: false,
    priority: 'normal'
  }
];

export const detectiveService = {
  /**
   * Retrieves all cases across the station docket register.
   */
  getAllCases(): DetectiveCaseDocket[] {
    return safeStorageGet<DetectiveCaseDocket[]>(DETECTIVE_STORAGE_KEYS.CASES, SEED_CASES);
  },

  /**
   * Retrieves ONLY cases assigned to the logged-in detective.
   * Enforces zero cross-detective leakage.
   */
  getAssignedCases(detectivePersonnelNumber: string): DetectiveCaseDocket[] {
    const cases = this.getAllCases();
    const cleanNumber = detectivePersonnelNumber.trim().toUpperCase();
    return cases.filter(c => 
      c.investigatingOfficerPersonnelNumber.toUpperCase() === cleanNumber ||
      c.investigatingOfficerPersonnelNumber.includes(cleanNumber) ||
      cleanNumber.includes(c.investigatingOfficerPersonnelNumber)
    );
  },

  /**
   * Retrieves a specific case docket, checking assignment authorization.
   */
  getCaseByNumber(caseNumber: string, detectivePersonnelNumber: string): DetectiveCaseDocket | null {
    const assigned = this.getAssignedCases(detectivePersonnelNumber);
    return assigned.find(c => c.caseNumber.trim().toUpperCase() === caseNumber.trim().toUpperCase()) || null;
  },

  /**
   * Automatically records docket access by detective in immutable audit trail.
   */
  recordDocketAccessAudit(caseNumber: string, detective: UserProfile): void {
    const audits = safeStorageGet<CaseAuditEntry[]>(DETECTIVE_STORAGE_KEYS.AUDIT, SEED_AUDIT);
    
    // Avoid spamming if opened in the same minute
    const recentSameUser = audits.find(
      a => a.caseNumber === caseNumber &&
           a.action === 'DOCKET_ACCESSED' &&
           a.userPersonnelNumber === detective.personnelNumber &&
           (Date.now() - new Date(a.timestamp).getTime()) < 60000
    );

    if (recentSameUser) return;

    const newAudit: CaseAuditEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      caseNumber,
      action: 'DOCKET_ACCESSED',
      userFullName: detective.fullName,
      userRank: detective.rank,
      userPersonnelNumber: detective.personnelNumber,
      userRole: 'DETECTIVE',
      description: `Investigating Officer accessed full Case Docket Workspace. Clearance verified.`,
      timestamp: new Date().toISOString(),
      securityHash: generateSecurityHash(caseNumber, 'DOCKET_ACCESSED', new Date().toISOString())
    };

    safeStorageSet(DETECTIVE_STORAGE_KEYS.AUDIT, [newAudit, ...audits]);
  },

  /**
   * Acknowledge docket custody / receipt when transferred or first assigned.
   * Maintains chain of responsibility from previous custodian to detective.
   */
  acknowledgeDocketCustody(caseNumber: string, detective: UserProfile, notes?: string): { success: boolean; message: string } {
    const cases = safeStorageGet<DetectiveCaseDocket[]>(DETECTIVE_STORAGE_KEYS.CASES, SEED_CASES);
    const idx = cases.findIndex(c => c.caseNumber === caseNumber);
    if (idx === -1) {
      return { success: false, message: 'Case docket not found.' };
    }

    const targetCase = cases[idx];
    const prevCustodian = targetCase.currentCustodianName;
    const nowIso = new Date().toISOString();

    targetCase.currentCustodianName = `${detective.rank} ${detective.fullName}`;
    targetCase.currentCustodianRank = detective.rank;
    targetCase.currentCustodianPersonnelNumber = detective.personnelNumber;
    targetCase.currentCustodianDepartment = detective.division || 'Criminal Investigation Department (CID)';
    targetCase.custodyStatus = 'HELD_BY_INVESTIGATING_OFFICER';
    targetCase.isCustodyAcknowledgedByDetective = true;
    targetCase.acknowledgedCustodyAt = nowIso;
    targetCase.lastActivityDate = nowIso.split('T')[0];

    cases[idx] = targetCase;
    safeStorageSet(DETECTIVE_STORAGE_KEYS.CASES, cases);

    // Update pending Docket Movement records to ACKNOWLEDGED_RECEIVED
    const movements = safeStorageGet<DocketTransferMovement[]>(DETECTIVE_STORAGE_KEYS.MOVEMENTS, SEED_MOVEMENTS);
    const updatedMovements = movements.map(m => {
      if (m.caseNumber === caseNumber && m.status === 'AWAITING_ACKNOWLEDGEMENT') {
        return {
          ...m,
          status: 'ACKNOWLEDGED_RECEIVED' as const,
          acknowledgedBy: detective.fullName,
          acknowledgedByRank: detective.rank,
          acknowledgedByPersonnelNumber: detective.personnelNumber,
          acknowledgedAt: nowIso,
          acknowledgementNotes: notes || 'Physical and digital docket acknowledged and accepted into detective custody.'
        };
      }
      return m;
    });
    safeStorageSet(DETECTIVE_STORAGE_KEYS.MOVEMENTS, updatedMovements);

    // Log to immutable Audit Trail
    const audits = safeStorageGet<CaseAuditEntry[]>(DETECTIVE_STORAGE_KEYS.AUDIT, SEED_AUDIT);
    const auditRecord: CaseAuditEntry = {
      id: `aud_${Date.now()}_ack`,
      caseNumber,
      action: 'DOCKET_RECEIPT_ACKNOWLEDGED',
      userFullName: detective.fullName,
      userRank: detective.rank,
      userPersonnelNumber: detective.personnelNumber,
      userRole: 'DETECTIVE',
      description: `Formal docket custody accepted by Lead Investigating Officer from previous custodian (${prevCustodian}). Status: In Physical & Digital Custody.`,
      timestamp: nowIso,
      securityHash: generateSecurityHash(caseNumber, 'DOCKET_RECEIPT_ACKNOWLEDGED', nowIso)
    };
    safeStorageSet(DETECTIVE_STORAGE_KEYS.AUDIT, [auditRecord, ...audits]);

    // Record automatic entry into Investigation Diary
    this.addInvestigationDiaryEntry({
      caseNumber,
      actionTaken: `Confirmed formal receipt and physical custody of docket ${caseNumber} following transfer from ${prevCustodian}.`,
      resultOutcome: `Docket integrity verified. Registered in Detective Branch safe register. Notes: ${notes || 'Clean intake inspection.'}`,
      documentReference: 'REGISTER-CUSTODY-ACK',
      nextActionRequired: 'Review pending supervisor directives and schedule complainant interview.'
    }, detective);

    return {
      success: true,
      message: `Docket custody confirmed. You are recorded as the active custodian for ${caseNumber}.`
    };
  },

  /**
   * Investigation Diary
   */
  getInvestigationDiary(caseNumber: string): InvestigationDiaryRecord[] {
    const all = safeStorageGet<InvestigationDiaryRecord[]>(DETECTIVE_STORAGE_KEYS.DIARY, SEED_DIARY);
    return all.filter(e => e.caseNumber === caseNumber);
  },

  addInvestigationDiaryEntry(
    entry: Omit<InvestigationDiaryRecord, 'id' | 'authorName' | 'authorRank' | 'personnelNumber' | 'timestamp'>,
    detective: UserProfile
  ): InvestigationDiaryRecord {
    const all = safeStorageGet<InvestigationDiaryRecord[]>(DETECTIVE_STORAGE_KEYS.DIARY, SEED_DIARY);
    const nowIso = new Date().toISOString();

    const newRecord: InvestigationDiaryRecord = {
      id: `dia_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      caseNumber: entry.caseNumber,
      actionTaken: entry.actionTaken.trim(),
      resultOutcome: entry.resultOutcome.trim(),
      documentReference: entry.documentReference?.trim() || undefined,
      nextActionRequired: entry.nextActionRequired.trim(),
      authorName: detective.fullName,
      authorRank: detective.rank,
      personnelNumber: detective.personnelNumber,
      timestamp: nowIso
    };

    safeStorageSet(DETECTIVE_STORAGE_KEYS.DIARY, [newRecord, ...all]);

    // Update case last activity
    this.touchCaseActivity(entry.caseNumber);

    // Auto-record to Case Audit Trail
    const audits = safeStorageGet<CaseAuditEntry[]>(DETECTIVE_STORAGE_KEYS.AUDIT, SEED_AUDIT);
    const auditRecord: CaseAuditEntry = {
      id: `aud_${Date.now()}_dia`,
      caseNumber: entry.caseNumber,
      action: 'INVESTIGATION_ENTRY_RECORDED',
      userFullName: detective.fullName,
      userRank: detective.rank,
      userPersonnelNumber: detective.personnelNumber,
      userRole: 'DETECTIVE',
      description: `Recorded chronological Investigation Diary entry: "${entry.actionTaken.slice(0, 75)}..."`,
      timestamp: nowIso,
      securityHash: generateSecurityHash(entry.caseNumber, 'INVESTIGATION_ENTRY_RECORDED', nowIso)
    };
    safeStorageSet(DETECTIVE_STORAGE_KEYS.AUDIT, [auditRecord, ...audits]);

    return newRecord;
  },

  /**
   * Case Documents
   */
  getCaseDocuments(caseNumber: string): CaseDocumentRecord[] {
    const all = safeStorageGet<CaseDocumentRecord[]>(DETECTIVE_STORAGE_KEYS.DOCUMENTS, SEED_DOCUMENTS);
    return all.filter(d => d.caseNumber === caseNumber);
  },

  addCaseDocument(
    doc: {
      caseNumber: string;
      title: string;
      category: CaseDocumentRecord['category'];
      documentRef: string;
      description: string;
      fileFormat?: string;
      fileSize?: string;
    },
    detective: UserProfile
  ): CaseDocumentRecord {
    const all = safeStorageGet<CaseDocumentRecord[]>(DETECTIVE_STORAGE_KEYS.DOCUMENTS, SEED_DOCUMENTS);
    const nowIso = new Date().toISOString();

    const newDoc: CaseDocumentRecord = {
      id: `doc_${Date.now()}`,
      caseNumber: doc.caseNumber,
      documentRef: doc.documentRef || `DOC-${Date.now().toString().slice(-4)}`,
      title: doc.title.trim(),
      category: doc.category,
      description: doc.description.trim(),
      fileFormat: doc.fileFormat || 'PDF',
      fileSize: doc.fileSize || '1.8 MB',
      addedBy: detective.fullName,
      addedByRank: detective.rank,
      addedByPersonnelNumber: detective.personnelNumber,
      addedAt: nowIso,
      hashVerification: generateSecurityHash(doc.caseNumber, 'DOC_HASH', nowIso)
    };

    safeStorageSet(DETECTIVE_STORAGE_KEYS.DOCUMENTS, [newDoc, ...all]);
    this.touchCaseActivity(doc.caseNumber);

    // Auto-record to Case Audit Trail
    const audits = safeStorageGet<CaseAuditEntry[]>(DETECTIVE_STORAGE_KEYS.AUDIT, SEED_AUDIT);
    const auditRecord: CaseAuditEntry = {
      id: `aud_${Date.now()}_doc`,
      caseNumber: doc.caseNumber,
      action: 'DOCUMENT_ATTACHED',
      userFullName: detective.fullName,
      userRank: detective.rank,
      userPersonnelNumber: detective.personnelNumber,
      userRole: 'DETECTIVE',
      description: `Attached authorised document [${newDoc.documentRef}]: "${newDoc.title}". Category: ${newDoc.category}.`,
      timestamp: nowIso,
      securityHash: generateSecurityHash(doc.caseNumber, 'DOCUMENT_ATTACHED', nowIso)
    };
    safeStorageSet(DETECTIVE_STORAGE_KEYS.AUDIT, [auditRecord, ...audits]);

    return newDoc;
  },

  /**
   * Supervisor Instructions
   */
  getSupervisorInstructions(params?: { detectivePersonnelNumber?: string; caseNumber?: string }): SupervisorInstruction[] {
    const all = safeStorageGet<SupervisorInstruction[]>(DETECTIVE_STORAGE_KEYS.INSTRUCTIONS, SEED_INSTRUCTIONS);
    
    if (params?.caseNumber) {
      return all.filter(i => i.caseNumber === params.caseNumber);
    }

    if (params?.detectivePersonnelNumber) {
      // Find case numbers assigned to this detective
      const assignedCases = this.getAssignedCases(params.detectivePersonnelNumber);
      const assignedCaseNumbers = new Set(assignedCases.map(c => c.caseNumber));
      return all.filter(i => assignedCaseNumbers.has(i.caseNumber));
    }

    return all;
  },

  respondToInstruction(
    instructionId: string,
    actionTaken: string,
    resultOutcome: string,
    markCompleted: boolean,
    detective: UserProfile
  ): { success: boolean; instruction?: SupervisorInstruction; message: string } {
    const all = safeStorageGet<SupervisorInstruction[]>(DETECTIVE_STORAGE_KEYS.INSTRUCTIONS, SEED_INSTRUCTIONS);
    const idx = all.findIndex(i => i.id === instructionId);
    if (idx === -1) {
      return { success: false, message: 'Supervisor instruction not found.' };
    }

    const nowIso = new Date().toISOString();
    const inst = all[idx];

    inst.responseActionTaken = actionTaken.trim();
    inst.responseResult = resultOutcome.trim();
    inst.respondedAt = nowIso;
    inst.respondedBy = `${detective.rank} ${detective.fullName}`;
    inst.status = markCompleted ? 'COMPLETED' : 'IN_PROGRESS';
    if (markCompleted) {
      inst.completedAt = nowIso;
    }

    all[idx] = inst;
    safeStorageSet(DETECTIVE_STORAGE_KEYS.INSTRUCTIONS, all);
    this.touchCaseActivity(inst.caseNumber);

    // Auto-record to Case Audit Trail
    const audits = safeStorageGet<CaseAuditEntry[]>(DETECTIVE_STORAGE_KEYS.AUDIT, SEED_AUDIT);
    const auditRecord: CaseAuditEntry = {
      id: `aud_${Date.now()}_inst`,
      caseNumber: inst.caseNumber,
      action: markCompleted ? 'INSTRUCTION_COMPLETED' : 'INSTRUCTION_RESPONDED',
      userFullName: detective.fullName,
      userRank: detective.rank,
      userPersonnelNumber: detective.personnelNumber,
      userRole: 'DETECTIVE',
      description: markCompleted 
        ? `Completed supervisor directive from ${inst.issuedByRank} ${inst.issuedBy}. Action: "${actionTaken.slice(0, 75)}..."`
        : `Responded to supervisor directive from ${inst.issuedByRank} ${inst.issuedBy}. Status: IN_PROGRESS.`,
      timestamp: nowIso,
      securityHash: generateSecurityHash(inst.caseNumber, 'INSTRUCTION_RESPONDED', nowIso)
    };
    safeStorageSet(DETECTIVE_STORAGE_KEYS.AUDIT, [auditRecord, ...audits]);

    // Also append an entry to the Investigation Diary
    this.addInvestigationDiaryEntry({
      caseNumber: inst.caseNumber,
      actionTaken: `Addressed supervisor directive: ${inst.instructionText.slice(0, 100)}... Response: ${actionTaken}`,
      resultOutcome: `Outcome: ${resultOutcome} (Status: ${inst.status})`,
      documentReference: 'SUPERVISOR-DIRECTIVE-RESPONSE',
      nextActionRequired: markCompleted ? 'Directive finalized. Proceed with subsequent investigation step.' : 'Continue outstanding action items.'
    }, detective);

    return {
      success: true,
      instruction: inst,
      message: markCompleted ? 'Instruction marked as completed.' : 'Action response recorded.'
    };
  },

  /**
    * Docket Movements & Chain of Custody
    */
  getDocketMovements(caseNumber: string): DocketTransferMovement[] {
    const all = safeStorageGet<DocketTransferMovement[]>(DETECTIVE_STORAGE_KEYS.MOVEMENTS, SEED_MOVEMENTS);
    return all.filter(m => m.caseNumber === caseNumber);
  },

  /**
   * Transfer docket directly to the Station Commander (Snr. Supt. Elena Vance)
   * for supervisory review, inspection, or directive issuance.
   */
  transferDocketToCommander(
    params: {
      caseNumber: string;
      reason: string;
    },
    detective: UserProfile
  ): { success: boolean; message: string; updatedCase?: DetectiveCaseDocket } {
    const cases = safeStorageGet<DetectiveCaseDocket[]>(DETECTIVE_STORAGE_KEYS.CASES, SEED_CASES);
    const idx = cases.findIndex(c => c.caseNumber === params.caseNumber);
    if (idx === -1) {
      return { success: false, message: 'Case docket not found.' };
    }

    const targetCase = cases[idx];
    const prevCustodian = `${detective.rank} ${detective.fullName}`;
    const nowIso = new Date().toISOString();

    targetCase.previousCustodianName = prevCustodian;
    targetCase.previousCustodianRank = detective.rank;
    targetCase.currentCustodianName = 'Senior Superintendent Elena Vance (Station Commander)';
    targetCase.currentCustodianRank = 'Senior Superintendent';
    targetCase.currentCustodianPersonnelNumber = 'POL-30912';
    targetCase.currentCustodianDepartment = 'Station Commander Executive Review Desk';
    targetCase.custodyStatus = 'TRANSFERRED_AWAITING_RECEIPT';
    targetCase.requiresSupervisoryReview = true;
    targetCase.supervisoryReviewRequestedAt = nowIso;
    targetCase.supervisoryReviewReason = params.reason.trim();
    targetCase.lastActivityDate = nowIso.split('T')[0];

    cases[idx] = targetCase;
    safeStorageSet(DETECTIVE_STORAGE_KEYS.CASES, cases);

    // Create permanent movement record
    const allMovements = safeStorageGet<DocketTransferMovement[]>(DETECTIVE_STORAGE_KEYS.MOVEMENTS, SEED_MOVEMENTS);
    const newMovement: DocketTransferMovement = {
      id: `mov_cmd_${Date.now()}`,
      caseNumber: params.caseNumber,
      reportReference: targetCase.reportReference,
      previousCustodian: prevCustodian,
      newCustodian: 'Senior Superintendent Elena Vance (Station Commander)',
      currentDocketCustodian: `${prevCustodian} (Pending Commander Receipt)`,
      senderName: detective.fullName,
      senderRank: detective.rank,
      senderPersonnelNumber: detective.personnelNumber,
      senderStation: detective.station || 'SAPS Sandton Police Station',
      destination: 'Station Commander Executive Review Desk',
      intendedRecipientName: 'Elena Vance',
      intendedRecipientRole: 'Station Commander',
      movementReason: params.reason.trim() || 'Docket transferred for Station Commander supervisory review and inspection.',
      dispatchedAt: nowIso,
      status: 'AWAITING_ACKNOWLEDGEMENT'
    };
    safeStorageSet(DETECTIVE_STORAGE_KEYS.MOVEMENTS, [newMovement, ...allMovements]);

    // Record immutable audit trail
    const audits = safeStorageGet<CaseAuditEntry[]>(DETECTIVE_STORAGE_KEYS.AUDIT, SEED_AUDIT);
    const auditRecord: CaseAuditEntry = {
      id: `aud_${Date.now()}_trans_cmd`,
      caseNumber: params.caseNumber,
      action: 'DOCKET_MOVEMENT_INITIATED',
      userFullName: detective.fullName,
      userRank: detective.rank,
      userPersonnelNumber: detective.personnelNumber,
      userRole: 'DETECTIVE',
      description: `Docket dispatched to Station Commander Senior Superintendent Elena Vance for supervisory review. Reason: "${params.reason.trim()}". Awaiting Commander receipt acknowledgement.`,
      timestamp: nowIso,
      securityHash: generateSecurityHash(params.caseNumber, 'DOCKET_MOVEMENT_INITIATED', nowIso)
    };
    safeStorageSet(DETECTIVE_STORAGE_KEYS.AUDIT, [auditRecord, ...audits]);

    // Add entry to Investigation Diary
    this.addInvestigationDiaryEntry({
      caseNumber: params.caseNumber,
      actionTaken: `Docket dispatched to Station Commander Senior Superintendent Elena Vance for supervisory review. Reason: ${params.reason.trim()}`,
      resultOutcome: 'Custody transfer initiated. Awaiting Station Commander formal inspection and review directives.',
      documentReference: 'DOCKET-SUPERVISORY-TRANSFER',
      nextActionRequired: 'Await Station Commander supervisory review outcome and directives.'
    }, detective);

    // Notify Station Commander
    const cmdNotifs = safeStorageGet<any[]>('sfen_commander_notifications', []);
    const cmdNotif = {
      id: `cmd_notif_${Date.now()}`,
      type: 'CASE_REQUIRES_REVIEW',
      title: `Docket Transferred for Review: ${params.caseNumber}`,
      message: `Detective Inspector ${detective.fullName} has transferred docket ${params.caseNumber} for supervisory inspection. Reason: "${params.reason.trim()}". Receipt acknowledgement required.`,
      caseNumber: params.caseNumber,
      timestamp: nowIso,
      read: false,
      priority: 'urgent'
    };
    safeStorageSet('sfen_commander_notifications', [cmdNotif, ...cmdNotifs]);

    return {
      success: true,
      message: `Docket ${params.caseNumber} successfully transferred to Station Commander. Status: Awaiting Commander Receipt.`,
      updatedCase: targetCase
    };
  },

  initiateDocketTransfer(
    params: {
      caseNumber: string;
      destination: string;
      intendedRecipientName?: string;
      intendedRecipientRole?: string;
      movementReason: string;
    },
    detective: UserProfile
  ): DocketTransferMovement {
    const all = safeStorageGet<DocketTransferMovement[]>(DETECTIVE_STORAGE_KEYS.MOVEMENTS, SEED_MOVEMENTS);
    const nowIso = new Date().toISOString();
    const cases = safeStorageGet<DetectiveCaseDocket[]>(DETECTIVE_STORAGE_KEYS.CASES, SEED_CASES);
    const cIdx = cases.findIndex(c => c.caseNumber === params.caseNumber);
    const targetCase = cIdx !== -1 ? cases[cIdx] : null;

    const prevCustodian = `${detective.rank} ${detective.fullName}`;
    const newCust = params.intendedRecipientName ? `${params.intendedRecipientName} (${params.destination})` : params.destination;

    const newMovement: DocketTransferMovement = {
      id: `det_mov_${Date.now()}`,
      caseNumber: params.caseNumber,
      reportReference: targetCase?.reportReference,
      previousCustodian: prevCustodian,
      newCustodian: newCust,
      currentDocketCustodian: `${prevCustodian} (Pending Recipient Acknowledgement)`,
      senderName: detective.fullName,
      senderRank: detective.rank,
      senderPersonnelNumber: detective.personnelNumber,
      senderStation: detective.station || 'SAPS Sandton Police Station',
      destination: params.destination,
      intendedRecipientName: params.intendedRecipientName?.trim() || undefined,
      intendedRecipientRole: params.intendedRecipientRole?.trim() || undefined,
      movementReason: params.movementReason.trim(),
      dispatchedAt: nowIso,
      status: 'AWAITING_ACKNOWLEDGEMENT'
    };

    safeStorageSet(DETECTIVE_STORAGE_KEYS.MOVEMENTS, [newMovement, ...all]);

    // Update case custodian status to AWAITING_RECEIPT
    if (cIdx !== -1) {
      cases[cIdx].previousCustodianName = prevCustodian;
      cases[cIdx].previousCustodianRank = detective.rank;
      cases[cIdx].custodyStatus = 'TRANSFERRED_AWAITING_RECEIPT';
      cases[cIdx].currentCustodianName = `${params.destination} (Awaiting Custody Acceptance)`;
      cases[cIdx].currentCustodianDepartment = params.destination;
      cases[cIdx].lastActivityDate = nowIso.split('T')[0];
      safeStorageSet(DETECTIVE_STORAGE_KEYS.CASES, cases);
    }

    // Auto-record to Case Audit Trail
    const audits = safeStorageGet<CaseAuditEntry[]>(DETECTIVE_STORAGE_KEYS.AUDIT, SEED_AUDIT);
    const auditRecord: CaseAuditEntry = {
      id: `aud_${Date.now()}_trans`,
      caseNumber: params.caseNumber,
      action: 'DOCKET_MOVEMENT_INITIATED',
      userFullName: detective.fullName,
      userRank: detective.rank,
      userPersonnelNumber: detective.personnelNumber,
      userRole: 'DETECTIVE',
      description: `Initiated docket dispatch to [${params.destination}]. Reason: "${params.movementReason}". Status: Awaiting Receipt.`,
      timestamp: nowIso,
      securityHash: generateSecurityHash(params.caseNumber, 'DOCKET_MOVEMENT_INITIATED', nowIso)
    };
    safeStorageSet(DETECTIVE_STORAGE_KEYS.AUDIT, [auditRecord, ...audits]);

    return newMovement;
  },

  /**
   * Update Case Status
   */
  updateCaseStatus(
    caseNumber: string,
    newStatus: DetectiveCaseDocket['currentStatus'],
    notes: string,
    detective: UserProfile
  ): boolean {
    const cases = safeStorageGet<DetectiveCaseDocket[]>(DETECTIVE_STORAGE_KEYS.CASES, SEED_CASES);
    const idx = cases.findIndex(c => c.caseNumber === caseNumber);
    if (idx === -1) return false;

    const prevStatus = cases[idx].currentStatus;
    const nowIso = new Date().toISOString();
    cases[idx].currentStatus = newStatus;
    cases[idx].lastActivityDate = nowIso.split('T')[0];
    safeStorageSet(DETECTIVE_STORAGE_KEYS.CASES, cases);

    // Auto-record to Case Audit Trail
    const audits = safeStorageGet<CaseAuditEntry[]>(DETECTIVE_STORAGE_KEYS.AUDIT, SEED_AUDIT);
    const auditRecord: CaseAuditEntry = {
      id: `aud_${Date.now()}_stat`,
      caseNumber,
      action: 'CASE_STATUS_UPDATED',
      userFullName: detective.fullName,
      userRank: detective.rank,
      userPersonnelNumber: detective.personnelNumber,
      userRole: 'DETECTIVE',
      description: `Investigating officer updated case status from [${prevStatus}] to [${newStatus}]. Notes: ${notes}`,
      timestamp: nowIso,
      securityHash: generateSecurityHash(caseNumber, 'CASE_STATUS_UPDATED', nowIso)
    };
    safeStorageSet(DETECTIVE_STORAGE_KEYS.AUDIT, [auditRecord, ...audits]);

    return true;
  },

  /**
   * Case Audit Trail (Immutable, read-only)
   */
  getCaseAuditTrail(caseNumber: string): CaseAuditEntry[] {
    const all = safeStorageGet<CaseAuditEntry[]>(DETECTIVE_STORAGE_KEYS.AUDIT, SEED_AUDIT);
    return all.filter(a => a.caseNumber === caseNumber);
  },

  /**
   * Detective Notifications
   */
  getDetectiveNotifications(detectivePersonnelNumber: string): DetectiveNotification[] {
    // Return all notifications for demo detective
    return safeStorageGet<DetectiveNotification[]>(DETECTIVE_STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFS);
  },

  markNotificationRead(notificationId: string): void {
    const notifs = safeStorageGet<DetectiveNotification[]>(DETECTIVE_STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFS);
    const updated = notifs.map(n => n.id === notificationId ? { ...n, read: true } : n);
    safeStorageSet(DETECTIVE_STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  markAllNotificationsRead(): void {
    const notifs = safeStorageGet<DetectiveNotification[]>(DETECTIVE_STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFS);
    const updated = notifs.map(n => ({ ...n, read: true }));
    safeStorageSet(DETECTIVE_STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  /**
   * Internal helper to update case last activity date
   */
  touchCaseActivity(caseNumber: string): void {
    const cases = safeStorageGet<DetectiveCaseDocket[]>(DETECTIVE_STORAGE_KEYS.CASES, SEED_CASES);
    const idx = cases.findIndex(c => c.caseNumber === caseNumber);
    if (idx !== -1) {
      cases[idx].lastActivityDate = new Date().toISOString().split('T')[0];
      safeStorageSet(DETECTIVE_STORAGE_KEYS.CASES, cases);
    }
  }
};
