import { 
  IncidentReport, 
  RegisteredCase, 
  ComplainantNotification 
} from '../types/complainant';
import { SEED_REPORTS } from './complainantService';
import { UserProfile } from '../types/auth';
import { 
  OfficerAuditLog, 
  DocketMovementRecord, 
  OfficerNotification, 
  CaseRegistrationInput,
  DetectiveOfficer,
  InvestigationDiaryEntry,
  CaseExhibit
} from '../types/officer';
import {
  DetectiveCaseDocket,
  DocketTransferMovement,
  CaseAuditEntry,
  DetectiveNotification,
  CaseDocumentRecord
} from '../types/detective';

const STORAGE_KEYS = {
  REPORTS: 'sfen_incident_reports',
  CASES: 'sfen_registered_cases',
  MOVEMENTS: 'sfen_docket_movements',
  AUDIT_LOGS: 'sfen_officer_audit_logs',
  NOTIFICATIONS: 'sfen_officer_notifications',
  NEXT_CAS_NUM: 'sfen_next_cas_number',
  COMPLAINANT_NOTIFS: 'sfen_complainant_notifications',
  DETECTIVES: 'sfen_detective_officers',
  DIARY_ENTRIES: 'sfen_investigation_diary_entries',
  EXHIBITS: 'sfen_case_exhibits',
  // Shared detective storage keys for complete end-to-end sync
  DETECTIVE_DOCKETS: 'sfen_detective_dockets',
  DETECTIVE_MOVEMENTS: 'sfen_detective_movements',
  DETECTIVE_AUDIT: 'sfen_detective_audit_trails',
  DETECTIVE_NOTIFS: 'sfen_detective_notifications',
  DETECTIVE_DIARY: 'sfen_detective_diary_entries',
  DETECTIVE_DOCUMENTS: 'sfen_detective_documents'
};

const DEFAULT_STATION_NAME = 'SAPS Berea Police Station';

// Initial seed detective roster
const SEED_DETECTIVES: DetectiveOfficer[] = [
  {
    id: 'det_001',
    fullName: 'Michael Sithole',
    rank: 'Detective Captain',
    personnelNumber: 'POL-DET-001',
    desk: 'Detective Branch Commander',
    specialization: 'Branch Commander & High-Profile Crimes',
    activeDocketsCount: 4,
    contactPhone: '+27 11 884 1001',
    isAvailable: true
  },
  {
    id: 'det_002',
    fullName: 'Grace Mthembu',
    rank: 'Detective Warrant Officer',
    personnelNumber: 'POL-DET-002',
    desk: 'Serious & Violent Crimes Desk',
    specialization: 'Armed Robbery, Carjacking & Aggravated Assault',
    activeDocketsCount: 6,
    contactPhone: '+27 11 884 1002',
    isAvailable: true
  },
  {
    id: 'det_003',
    fullName: 'Sipho Ndaba',
    rank: 'Detective Sergeant',
    personnelNumber: 'POL-DET-003',
    desk: 'General Crimes Desk',
    specialization: 'Housebreaking, Theft, Malicious Damage & Trespassing',
    activeDocketsCount: 5,
    contactPhone: '+27 11 884 1003',
    isAvailable: true
  },
  {
    id: 'det_004',
    fullName: 'David Khumalo',
    rank: 'Detective Inspector',
    personnelNumber: 'POL-20491',
    desk: 'Commercial Crime Section',
    specialization: 'Fraud, Cyber Financial Crime & Extortion',
    activeDocketsCount: 3,
    contactPhone: '+27 11 884 1004',
    isAvailable: true
  },
  {
    id: 'det_005',
    fullName: 'Lerato Zulu',
    rank: 'Detective Constable',
    personnelNumber: 'POL-DET-005',
    desk: 'FCS Unit (Family Violence & Sexual Offences)',
    specialization: 'Domestic Violence, Child Protection & Vulnerable Persons',
    activeDocketsCount: 4,
    contactPhone: '+27 11 884 1005',
    isAvailable: true
  }
];

// Initial seed diary entries
const SEED_DIARY_ENTRIES: InvestigationDiaryEntry[] = [
  {
    id: 'entry_001',
    caseNumber: 'CAS 342/08/2026',
    authorName: 'David Khumalo',
    authorRank: 'Detective Inspector',
    personnelNumber: 'POL-20491',
    entryType: 'DIRECTIVE',
    content: 'Docket received from station intake. Reviewed complainant bank transaction alerts. Subpoena prepared under Section 205 of CPA for electronic bank server records.',
    timestamp: '2026-08-22T14:30:00Z'
  },
  {
    id: 'entry_002',
    caseNumber: 'CAS 342/08/2026',
    authorName: 'David Khumalo',
    authorRank: 'Detective Inspector',
    personnelNumber: 'POL-20491',
    entryType: 'COMPLAINANT_UPDATE',
    content: 'Telephoned complainant Thandi Molefe. Advised of investigation docket registration and requested certified affidavits of transaction logs.',
    timestamp: '2026-08-23T09:15:00Z'
  }
];

// Initial seed exhibits
const SEED_EXHIBITS: CaseExhibit[] = [
  {
    id: 'exh_001',
    caseNumber: 'CAS 342/08/2026',
    exhibitNumber: 'SAP13/2026/0412',
    description: 'Bank transaction audit statements & phishing email headers printout',
    category: 'DOCUMENTARY',
    collectedBy: 'Det. Insp. David Khumalo',
    storageLocation: 'Commercial Crime Branch Safe #2',
    dateLogged: '2026-08-23'
  }
];

// Initial seed docket movements
const SEED_MOVEMENTS: DocketMovementRecord[] = [
  {
    id: 'mov_001',
    caseNumber: 'CAS 342/08/2026',
    reportReference: 'SFEN-RPT-000088',
    offence: 'Fraud / Cybercrime',
    complainantName: 'Thandi Molefe',
    origin: 'SAPS Berea Police Station',
    destination: 'Commercial Crime Section - Specialist Branch',
    initiatedBy: 'Constable Sarah Ndlovu',
    initiatedByPersonnelNumber: 'POL-10824',
    initiatedByRank: 'Constable',
    dispatchNotes: 'Primary docket transferred with commercial bank subpoena documentation.',
    dispatchedAt: '2026-08-22T11:45:00Z',
    status: 'ACKNOWLEDGED_RECEIVED',
    receivedBy: 'Det. Insp. David Khumalo',
    receivedByPersonnelNumber: 'POL-20491',
    receivedByRank: 'Detective Inspector',
    receivedAt: '2026-08-22T14:10:00Z',
    receiptNotes: 'Docket received in physical register 08/26, digital seal validated.'
  }
];

// Initial seed officer notifications
const SEED_OFFICER_NOTIFS: OfficerNotification[] = [
  {
    id: 'off_notif_001',
    type: 'NEW_REPORT',
    title: 'New Online Report Received',
    message: 'Report SFEN-RPT-000124 (Theft / Burglary) submitted by Thandi Molefe requires station review.',
    timestamp: '2026-09-18T15:15:00Z',
    read: false,
    linkedTab: 'records',
    linkedId: 'SFEN-RPT-000124'
  },
  {
    id: 'off_notif_002',
    type: 'DOCKET_MOVEMENT',
    title: 'Docket Handover Acknowledged',
    message: 'Det. Insp. David Khumalo confirmed receipt of CAS 342/08/2026 at Commercial Crime Section.',
    timestamp: '2026-08-22T14:10:00Z',
    read: true,
    linkedTab: 'docket-movement',
    linkedId: 'CAS 342/08/2026'
  }
];

// Initial seed officer audit logs
const SEED_AUDIT_LOGS: OfficerAuditLog[] = [
  {
    id: 'aud_001',
    officerId: 'usr_csc_01',
    officerName: 'Sarah Ndlovu',
    officerRank: 'Constable',
    personnelNumber: 'POL-10824',
    station: DEFAULT_STATION_NAME,
    actionType: 'CASE_REGISTERED',
    referenceNumber: 'CAS 342/08/2026',
    description: 'Officially registered case docket from online submission SFEN-RPT-000088.',
    timestamp: '2026-08-22T11:30:00Z',
    metadata: {
      offence: 'Fraud / Cybercrime',
      priority: 'Standard'
    }
  },
  {
    id: 'aud_002',
    officerId: 'usr_csc_01',
    officerName: 'Sarah Ndlovu',
    officerRank: 'Constable',
    personnelNumber: 'POL-10824',
    station: DEFAULT_STATION_NAME,
    actionType: 'DOCKET_HANDOVER_INITIATED',
    referenceNumber: 'CAS 342/08/2026',
    description: 'Dispatched case docket to Commercial Crime Section.',
    timestamp: '2026-08-22T11:45:00Z',
    metadata: {
      destination: 'Commercial Crime Section'
    }
  }
];

// Helper to safely access LocalStorage
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const officerService = {
  // Get all incident reports
  getReports(): IncidentReport[] {
    return loadFromStorage<IncidentReport[]>(STORAGE_KEYS.REPORTS, SEED_REPORTS);
  },

  // Online reports are retained for audit purposes but leave the active queue if
  // the complainant has not attended the station to complete case registration.
  archiveExpiredUnregisteredReports(): number {
    const reports = this.getReports();
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let archived = 0;
    reports.forEach((report) => {
      const isOpen = !report.linkedCaseNumber && report.status !== 'Registered to Case' && report.status !== 'Archived';
      if (isOpen && new Date(report.submittedAt).getTime() <= cutoff) {
        report.status = 'Archived';
        report.stationNotes = 'Archived automatically after 30 days without in-person attendance and official CAS registration. The report remains available in the archive for audit purposes.';
        archived += 1;
      }
    });
    if (archived) saveToStorage(STORAGE_KEYS.REPORTS, reports);
    return archived;
  },

  // Mark report as under review
  markReportUnderReview(reportId: string, officer: UserProfile): IncidentReport | null {
    const reports = this.getReports();
    const idx = reports.findIndex(r => r.id === reportId);
    if (idx === -1) return null;

    const report = reports[idx];
    if (report.status === 'Awaiting Review') {
      report.status = 'Under Station Review';
      report.stationNotes = `Intake assessment underway by Constable ${officer.fullName} (${officer.personnelNumber}).`;
      reports[idx] = report;
      saveToStorage(STORAGE_KEYS.REPORTS, reports);

      this.logAction({
        officerId: officer.id,
        officerName: officer.fullName,
        officerRank: officer.rank,
        personnelNumber: officer.personnelNumber,
        station: officer.station || DEFAULT_STATION_NAME,
        actionType: 'REPORT_REVIEWED',
        referenceNumber: report.referenceNumber,
        description: `Commenced preliminary intake verification on report ${report.referenceNumber}.`
      });
    }

    return report;
  },

  // Request additional information from complainant
  requestAdditionalInfo(
    reportId: string, 
    notes: string, 
    officer: UserProfile
  ): { success: boolean; report?: IncidentReport; message: string } {
    const reports = this.getReports();
    const idx = reports.findIndex(r => r.id === reportId);
    if (idx === -1) {
      return { success: false, message: 'Report not found.' };
    }

    const report = reports[idx];
    report.status = 'Additional Info Required';
    report.stationNotes = `Information requested by ${officer.rank} ${officer.fullName}: ${notes}`;
    reports[idx] = report;
    saveToStorage(STORAGE_KEYS.REPORTS, reports);

    // Add Complainant Notification
    const notifs = loadFromStorage<ComplainantNotification[]>(STORAGE_KEYS.COMPLAINANT_NOTIFS, []);
    const newNotif: ComplainantNotification = {
      id: `notif_${Date.now()}_req`,
      userId: report.userId,
      type: 'report',
      title: `Clarification Requested: ${report.referenceNumber}`,
      message: `Station Officer ${officer.fullName} requested additional details: "${notes}". Please review your report submission.`,
      timestamp: new Date().toISOString(),
      read: false,
      linkedTab: 'my-reports',
      linkedId: report.id
    };
    saveToStorage(STORAGE_KEYS.COMPLAINANT_NOTIFS, [newNotif, ...notifs]);

    // Log in officer traceability
    this.logAction({
      officerId: officer.id,
      officerName: officer.fullName,
      officerRank: officer.rank,
      personnelNumber: officer.personnelNumber,
      station: officer.station || DEFAULT_STATION_NAME,
      actionType: 'MORE_INFO_REQUESTED',
      referenceNumber: report.referenceNumber,
      description: `Requested additional information: "${notes}"`,
      metadata: { reason: notes }
    });

    // Add officer operational notification
    this.addOfficerNotification({
      type: 'REPORT_UPDATE',
      title: `Clarification Requested for ${report.referenceNumber}`,
      message: `Citizen notified to provide supporting details for ${report.referenceNumber}.`,
      linkedTab: 'records',
      linkedId: report.referenceNumber
    });

    return { 
      success: true, 
      report, 
      message: `Additional information request transmitted for ${report.referenceNumber}.` 
    };
  },

  // Register official case from reviewed report
  registerCase(
    input: CaseRegistrationInput, 
    officer: UserProfile
  ): { success: boolean; caseNumber: string; registeredCase?: RegisteredCase; message: string } {
    const reports = this.getReports();
    let reportIndex = reports.findIndex(r => r.id === input.reportId);
    if (reportIndex === -1) {
      // A live API report may not yet exist in the older local workspace. Keep a
      // local traceability mirror so the officer, detective, and case views stay in sync.
      reports.unshift({
        id: input.reportId,
        referenceNumber: input.reportReference,
        userId: 'live-complainant',
        complainantName: input.complainantName,
        complainantPhone: input.complainantPhone,
        complainantEmail: input.complainantEmail,
        incidentType: input.incidentType as IncidentReport['incidentType'],
        incidentDate: input.incidentDate,
        incidentTime: input.incidentTime,
        location: { address: input.locationAddress, suburb: input.locationSuburb, city: 'Johannesburg', province: 'Gauteng', preferredStation: DEFAULT_STATION_NAME },
        description: input.formalStatement,
        involvedParties: {},
        attachments: [],
        status: 'Awaiting Review',
        submittedAt: new Date().toISOString(),
        policeStation: DEFAULT_STATION_NAME
      });
      reportIndex = 0;
    }

    const report = reports[reportIndex];

    // Generate sequential official CAS Number, e.g. CAS 343/09/2026
    let nextCasSeq = parseInt(localStorage.getItem(STORAGE_KEYS.NEXT_CAS_NUM) || '343', 10);
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const officialCasNumber = input.officialCaseNumber || `CAS ${nextCasSeq}/${month}/${year}`;
    localStorage.setItem(STORAGE_KEYS.NEXT_CAS_NUM, String(nextCasSeq + 1));

    // Update Report (keeps in system for traceability!)
    report.status = 'Registered to Case';
    report.linkedCaseNumber = officialCasNumber;
    report.stationNotes = `Formally registered by ${officer.rank} ${officer.fullName} (${officer.personnelNumber}) under official CAS ${officialCasNumber}. Forwarded to ${input.initialDocketDestination}.`;
    reports[reportIndex] = report;
    saveToStorage(STORAGE_KEYS.REPORTS, reports);

    // Create the RegisteredCase
    const cases = loadFromStorage<RegisteredCase[]>(STORAGE_KEYS.CASES, []);
    const newCase: RegisteredCase = {
      id: `cas_${Date.now()}`,
      caseNumber: officialCasNumber,
      reportReference: report.referenceNumber,
      userId: report.userId,
      incidentType: input.incidentType || report.incidentType,
      policeStation: DEFAULT_STATION_NAME,
      investigatingOfficer: 'Pending Detective Branch Allocation',
      officerRank: 'Detective Branch',
      dateRegistered: now.toISOString().split('T')[0],
      currentStatus: 'Case Registered',
      progressStage: 1, // Stage 1: Case Registered
      lastUpdateDate: now.toISOString().split('T')[0],
      lastUpdateSummary: `Official case opened from online submission ${report.referenceNumber} by Officer ${officer.fullName} (${officer.personnelNumber}). Formal statement captured${input.evidenceItems.length ? ` and ${input.evidenceItems.length} evidence item(s) logged` : ''}${input.evidenceIntakeNotes ? '. Physical exhibit details recorded' : ''}. Initial classification: ${input.chargeDescription} (${input.statutoryCode}).`,
      formalStatement: input.formalStatement,
      evidenceItems: input.evidenceItems,
      evidenceIntakeNotes: input.evidenceIntakeNotes,
      attachments: report.attachments,
      timeline: [
        {
          title: 'Official Case Registration',
          date: now.toISOString().split('T')[0],
          description: `Station Officer ${officer.rank} ${officer.fullName} verified identity, captured the formal statement${input.evidenceItems.length ? `, logged ${input.evidenceItems.length} evidence item(s)` : ''}${input.evidenceIntakeNotes ? ', and recorded physical exhibit details' : ''}, and registered official case ${officialCasNumber}.`,
          completed: true,
          current: false
        },
        {
          title: 'Docket Handover to Detective Branch',
          date: now.toISOString().split('T')[0],
          description: `Dispatched to ${input.initialDocketDestination} for branch commander review and investigating officer assignment.`,
          completed: true,
          current: true
        },
        {
          title: 'Investigating Officer Assignment',
          date: 'Pending',
          description: 'Allocation of lead detective and preliminary investigation interview.',
          completed: false,
          current: false
        },
        {
          title: 'Evidence Gathering & Witness Statements',
          date: 'Scheduled',
          description: 'Forensics analysis, field investigation, and docket compilation.',
          completed: false,
          current: false
        },
        {
          title: 'Prosecution Submission & Court Ready',
          date: 'Scheduled',
          description: 'Docket sent to National Prosecuting Authority (NPA).',
          completed: false,
          current: false
        }
      ]
    };

    saveToStorage(STORAGE_KEYS.CASES, [newCase, ...cases]);

    // Record Initial Docket Movement in Officer Service
    const movements = this.getDocketMovements();
    const newMovement: DocketMovementRecord = {
      id: `mov_${Date.now()}`,
      caseNumber: officialCasNumber,
      reportReference: report.referenceNumber,
      offence: input.incidentType || report.incidentType,
      complainantName: report.complainantName,
      previousCustodian: `${officer.rank} ${officer.fullName} (CSC Frontline Intake)`,
      newCustodian: 'Det. Insp. David Khumalo',
      currentDocketCustodian: `${officer.rank} ${officer.fullName} (Pending Detective Acknowledgement)`,
      origin: 'SAPS Berea Police Station',
      destination: input.initialDocketDestination || 'Commercial Crime Section - Specialist Desk',
      initiatedBy: `${officer.rank} ${officer.fullName}`,
      initiatedByPersonnelNumber: officer.personnelNumber,
      initiatedByRank: officer.rank,
      dispatchNotes: input.officerIntakeNotes || 'Initial case docket opened from verified online submission. Transferred for detective assignment.',
      dispatchedAt: now.toISOString(),
      status: 'AWAITING_RECEIPT'
    };
    saveToStorage(STORAGE_KEYS.MOVEMENTS, [newMovement, ...movements]);

    // SYNC TO DETECTIVE WORKSPACE: Create DetectiveCaseDocket
    const defaultDetective = {
      id: 'usr_pol_20491',
      fullName: 'David Khumalo',
      rank: 'Detective Inspector',
      personnelNumber: 'POL-20491',
      division: 'Commercial Crime Section - Specialist Desk'
    };

    const existingDockets = loadFromStorage<DetectiveCaseDocket[]>(STORAGE_KEYS.DETECTIVE_DOCKETS, []);
    const newDocket: DetectiveCaseDocket = {
      id: `det_cas_${Date.now()}`,
      caseNumber: officialCasNumber,
      reportReference: report.referenceNumber,
      attachments: report.attachments,
      stationEvidenceItems: input.evidenceItems,
      evidenceIntakeNotes: input.evidenceIntakeNotes,
      incidentType: input.incidentType || report.incidentType,
      offenceSubcategory: input.chargeDescription || report.incidentType,
      policeStation: DEFAULT_STATION_NAME,
      dateReported: now.toISOString().split('T')[0],
      incidentDate: input.incidentDate || report.incidentDate,
      incidentTime: input.incidentTime || report.incidentTime,
      incidentLocation: {
        address: input.locationAddress || report.location?.address || 'Precinct Address',
        suburb: input.locationSuburb || report.location?.suburb || 'Sandton',
        city: report.location?.city || 'Johannesburg',
        province: report.location?.province || 'Gauteng'
      },
      complainant: {
        fullName: input.complainantName || report.complainantName,
        phoneNumber: input.complainantPhone || report.complainantPhone,
        email: input.complainantEmail || report.complainantEmail,
        statementSummary: input.formalStatement || report.description || 'Verified complainant statement captured at station intake.'
      },
      investigatingOfficerId: defaultDetective.id,
      investigatingOfficerName: defaultDetective.fullName,
      investigatingOfficerRank: defaultDetective.rank,
      investigatingOfficerPersonnelNumber: defaultDetective.personnelNumber,
      assignedDate: now.toISOString().split('T')[0],
      lastActivityDate: now.toISOString().split('T')[0],
      currentStatus: 'Investigation Active',
      initialResponseDueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),

      // Registration Origin: Who registered this case?
      registeredByOfficerName: officer.fullName,
      registeredByOfficerRank: officer.rank,
      registeredByPersonnelNumber: officer.personnelNumber,
      registeredAt: now.toISOString(),

      // Custody Tracking: Who currently has responsibility? Who previously had it?
      currentCustodianName: `${officer.rank} ${officer.fullName}`,
      currentCustodianRank: officer.rank,
      currentCustodianPersonnelNumber: officer.personnelNumber,
      currentCustodianDepartment: 'Community Service Centre (CSC) Frontline Intake',
      previousCustodianName: `${officer.rank} ${officer.fullName}`,
      previousCustodianRank: officer.rank,
      custodyStatus: 'TRANSFERRED_AWAITING_RECEIPT',
      isCustodyAcknowledgedByDetective: false, // Detective must acknowledge receipt!

      statutoryCode: input.statutoryCode,
      priorityLevel: (input.priorityLevel as any) || 'Standard',
      scheduledReviewDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    saveToStorage(STORAGE_KEYS.DETECTIVE_DOCKETS, [newDocket, ...existingDockets]);

    // Make station-received evidence independently available in the detective
    // document register, including the original preview data and exhibit notes.
    const existingDetectiveDocuments = loadFromStorage<CaseDocumentRecord[]>(STORAGE_KEYS.DETECTIVE_DOCUMENTS, []);
    const stationEvidenceDocuments: CaseDocumentRecord[] = input.evidenceItems.map((item, index) => ({
      id: `station_evidence_${Date.now()}_${index}`,
      caseNumber: officialCasNumber,
      documentRef: `STATION-EVID-${String(index + 1).padStart(2, '0')}`,
      title: item.name,
      category: 'Crime Scene Photos',
      description: `Digital evidence received and logged at the station during official CAS registration by ${officer.rank} ${officer.fullName}.`,
      fileFormat: item.type || 'Evidence file',
      fileSize: `${Math.max(1, Math.round(item.size / 1024))} KB`,
      dataUrl: item.dataUrl,
      addedBy: officer.fullName,
      addedByRank: officer.rank,
      addedByPersonnelNumber: officer.personnelNumber,
      addedAt: now.toISOString()
    }));
    if (input.evidenceIntakeNotes?.trim()) {
      stationEvidenceDocuments.push({
        id: `station_evidence_note_${Date.now()}`,
        caseNumber: officialCasNumber,
        documentRef: 'STATION-EVID-NOTES',
        title: 'Officer Evidence and Exhibit Notes',
        category: 'Documentary / Financial Audit',
        description: input.evidenceIntakeNotes.trim(),
        fileFormat: 'Station intake record',
        fileSize: 'Text record',
        addedBy: officer.fullName,
        addedByRank: officer.rank,
        addedByPersonnelNumber: officer.personnelNumber,
        addedAt: now.toISOString()
      });
    }
    if (stationEvidenceDocuments.length) saveToStorage(STORAGE_KEYS.DETECTIVE_DOCUMENTS, [...stationEvidenceDocuments, ...existingDetectiveDocuments]);

    // SYNC TO DETECTIVE MOVEMENTS: Permanent Movement Record with all 9 required fields
    const existingDetMovements = loadFromStorage<DocketTransferMovement[]>(STORAGE_KEYS.DETECTIVE_MOVEMENTS, []);
    const permanentMovement: DocketTransferMovement = {
      id: `mov_sync_${Date.now()}`,
      caseNumber: officialCasNumber,
      reportReference: report.referenceNumber,
      previousCustodian: `${officer.rank} ${officer.fullName} (CSC Frontline Intake)`,
      newCustodian: `${defaultDetective.rank} ${defaultDetective.fullName}`,
      currentDocketCustodian: `${officer.rank} ${officer.fullName} (Pending Detective Receipt)`,
      senderName: officer.fullName,
      senderRank: officer.rank,
      senderPersonnelNumber: officer.personnelNumber,
      senderStation: DEFAULT_STATION_NAME,
      destination: input.initialDocketDestination || 'Commercial Crime Section - Specialist Desk',
      intendedRecipientName: defaultDetective.fullName,
      intendedRecipientRole: defaultDetective.rank,
      movementReason: 'Official case registration and docket handover for specialist criminal investigation.',
      dispatchedAt: now.toISOString(),
      status: 'AWAITING_ACKNOWLEDGEMENT'
    };
    saveToStorage(STORAGE_KEYS.DETECTIVE_MOVEMENTS, [permanentMovement, ...existingDetMovements]);

    // SYNC TO AUDIT TRAIL: Important action records showing who performed the action and when
    const existingAudits = loadFromStorage<CaseAuditEntry[]>(STORAGE_KEYS.DETECTIVE_AUDIT, []);
    const regAudit: CaseAuditEntry = {
      id: `aud_${Date.now()}_reg`,
      caseNumber: officialCasNumber,
      action: 'CASE_REGISTERED',
      userFullName: officer.fullName,
      userRank: officer.rank,
      userPersonnelNumber: officer.personnelNumber,
      userRole: 'POLICE_OFFICER_CSC',
      description: `Case ${officialCasNumber} registered from report ${report.referenceNumber} by ${officer.rank} ${officer.fullName} (${officer.personnelNumber}). Statutory Code: ${input.statutoryCode}.`,
      timestamp: now.toISOString(),
      securityHash: `SHA256:REG${Date.now().toString(16).toUpperCase()}`
    };

    const movAudit: CaseAuditEntry = {
      id: `aud_${Date.now()}_mov`,
      caseNumber: officialCasNumber,
      action: 'DOCKET_MOVEMENT_INITIATED',
      userFullName: officer.fullName,
      userRank: officer.rank,
      userPersonnelNumber: officer.personnelNumber,
      userRole: 'POLICE_OFFICER_CSC',
      description: `Docket dispatched from CSC Intake to Investigating Officer ${defaultDetective.rank} ${defaultDetective.fullName} (${defaultDetective.personnelNumber}). Awaiting detective receipt acknowledgement.`,
      timestamp: now.toISOString(),
      securityHash: `SHA256:MOV${Date.now().toString(16).toUpperCase()}`
    };
    saveToStorage(STORAGE_KEYS.DETECTIVE_AUDIT, [movAudit, regAudit, ...existingAudits]);

    // SYNC TO INVESTIGATION DIARY: Initial entry
    const existingDiary = loadFromStorage<any[]>(STORAGE_KEYS.DETECTIVE_DIARY, []);
    const initialDiary = {
      id: `dia_${Date.now()}_init`,
      caseNumber: officialCasNumber,
      actionTaken: `Official case opened from verified intake report ${report.referenceNumber}. Complainant ID verified and formal statement captured.${input.evidenceItems.length ? ` Evidence logged: ${input.evidenceItems.map((item) => item.name).join(', ')}.` : ''}${input.evidenceIntakeNotes ? ` Physical exhibit details: ${input.evidenceIntakeNotes}` : ''}`,
      resultOutcome: `Registered under official ${officialCasNumber}. Docket handed over to Detective Branch.`,
      documentReference: 'CASE-REGISTRATION-VERIFICATION',
      nextActionRequired: 'Detective acknowledgment of docket receipt and initial investigation planning.',
      authorName: officer.fullName,
      authorRank: officer.rank,
      personnelNumber: officer.personnelNumber,
      timestamp: now.toISOString()
    };
    saveToStorage(STORAGE_KEYS.DETECTIVE_DIARY, [initialDiary, ...existingDiary]);

    // SYNC NOTIFICATION TO DETECTIVE
    const existingDetNotifs = loadFromStorage<DetectiveNotification[]>(STORAGE_KEYS.DETECTIVE_NOTIFS, []);
    const newDetNotif: DetectiveNotification = {
      id: `det_notif_${Date.now()}`,
      type: 'ASSIGNMENT',
      title: `New Case Assigned: ${officialCasNumber}`,
      message: `Docket ${officialCasNumber} registered by ${officer.rank} ${officer.fullName} (CSC) and transferred to your custody. Receipt acknowledgement required.`,
      caseNumber: officialCasNumber,
      timestamp: now.toISOString(),
      read: false,
      priority: 'high'
    };
    saveToStorage(STORAGE_KEYS.DETECTIVE_NOTIFS, [newDetNotif, ...existingDetNotifs]);

    // Log Action in Registration Traceability (Officer Audit Log)
    this.logAction({
      officerId: officer.id,
      officerName: officer.fullName,
      officerRank: officer.rank,
      personnelNumber: officer.personnelNumber,
      station: DEFAULT_STATION_NAME,
      actionType: 'CASE_REGISTERED',
      referenceNumber: officialCasNumber,
      description: `Officially registered case ${officialCasNumber} linked to report ${report.referenceNumber}. Statutory code: ${input.statutoryCode}.`,
      metadata: {
        reportReference: report.referenceNumber,
        casNumber: officialCasNumber,
        offence: input.incidentType,
        priority: input.priorityLevel
      }
    });

    // Notify Complainant
    const notifs = loadFromStorage<ComplainantNotification[]>(STORAGE_KEYS.COMPLAINANT_NOTIFS, []);
    const newComplainantNotif: ComplainantNotification = {
      id: `notif_${Date.now()}_cas`,
      userId: report.userId,
      type: 'case',
      title: `Official Case Registered: ${officialCasNumber}`,
      message: `Your report ${report.referenceNumber} has been officially registered under ${officialCasNumber} at ${DEFAULT_STATION_NAME}. You can track investigation milestones in My Cases.`,
      timestamp: now.toISOString(),
      read: false,
      linkedTab: 'my-cases',
      linkedId: newCase.id
    };
    saveToStorage(STORAGE_KEYS.COMPLAINANT_NOTIFS, [newComplainantNotif, ...notifs]);

    // Add Officer Notification
    this.addOfficerNotification({
      type: 'SYSTEM',
      title: `Case ${officialCasNumber} Registered`,
      message: `Successfully linked ${report.referenceNumber} to ${officialCasNumber}. Docket dispatched to ${newMovement.destination}.`,
      linkedTab: 'records',
      linkedId: officialCasNumber
    });

    return {
      success: true,
      caseNumber: officialCasNumber,
      registeredCase: newCase,
      message: `Official case ${officialCasNumber} successfully registered and linked to ${report.referenceNumber}!`
    };
  },

  // Get registered cases
  getRegisteredCases(): RegisteredCase[] {
    return loadFromStorage<RegisteredCase[]>(STORAGE_KEYS.CASES, []);
  },

  // Get docket movements
  getDocketMovements(): DocketMovementRecord[] {
    return loadFromStorage<DocketMovementRecord[]>(STORAGE_KEYS.MOVEMENTS, SEED_MOVEMENTS);
  },

  // Initiate a new docket movement
  initiateDocketMovement(
    params: {
      caseNumber: string;
      reportReference: string;
      offence: string;
      complainantName: string;
      destination: string;
      dispatchNotes: string;
    },
    officer: UserProfile
  ): DocketMovementRecord {
    const movements = this.getDocketMovements();
    const newMovement: DocketMovementRecord = {
      id: `mov_${Date.now()}`,
      caseNumber: params.caseNumber,
      reportReference: params.reportReference,
      offence: params.offence,
      complainantName: params.complainantName,
      origin: 'SAPS Berea Police Station',
      destination: params.destination,
      initiatedBy: `${officer.rank} ${officer.fullName}`,
      initiatedByPersonnelNumber: officer.personnelNumber,
      initiatedByRank: officer.rank,
      dispatchNotes: params.dispatchNotes,
      dispatchedAt: new Date().toISOString(),
      status: 'AWAITING_RECEIPT'
    };

    saveToStorage(STORAGE_KEYS.MOVEMENTS, [newMovement, ...movements]);

    this.logAction({
      officerId: officer.id,
      officerName: officer.fullName,
      officerRank: officer.rank,
      personnelNumber: officer.personnelNumber,
      station: DEFAULT_STATION_NAME,
      actionType: 'DOCKET_HANDOVER_INITIATED',
      referenceNumber: params.caseNumber,
      description: `Initiated docket dispatch to ${params.destination}.`,
      metadata: {
        destination: params.destination,
        caseNumber: params.caseNumber
      }
    });

    this.addOfficerNotification({
      type: 'DOCKET_MOVEMENT',
      title: `Docket Dispatched: ${params.caseNumber}`,
      message: `Docket handover to ${params.destination} initiated. Pending receiving unit sign-off.`,
      linkedTab: 'docket-movement',
      linkedId: params.caseNumber
    });

    return newMovement;
  },

  // Acknowledge receipt of a docket (simulating Detective Branch receiving unit)
  acknowledgeDocketReceipt(
    movementId: string,
    receivingOfficerName: string,
    receivingPersonnelNumber: string,
    receivingRank: string,
    receiptNotes: string
  ): boolean {
    const movements = this.getDocketMovements();
    const idx = movements.findIndex(m => m.id === movementId);
    if (idx === -1) return false;

    const movement = movements[idx];
    movement.status = 'ACKNOWLEDGED_RECEIVED';
    movement.receivedBy = receivingOfficerName;
    movement.receivedByPersonnelNumber = receivingPersonnelNumber;
    movement.receivedByRank = receivingRank;
    movement.receivedAt = new Date().toISOString();
    movement.receiptNotes = receiptNotes;

    movements[idx] = movement;
    saveToStorage(STORAGE_KEYS.MOVEMENTS, movements);

    // Update case timeline / status if present
    const cases = this.getRegisteredCases();
    const caseIdx = cases.findIndex(c => c.caseNumber === movement.caseNumber);
    if (caseIdx !== -1) {
      cases[caseIdx].currentStatus = 'Investigation Active';
      cases[caseIdx].investigatingOfficer = `${receivingRank} ${receivingOfficerName}`;
      cases[caseIdx].officerRank = receivingRank;
      cases[caseIdx].progressStage = 2; // Active investigation
      cases[caseIdx].lastUpdateSummary = `Docket physically and digitally acknowledged by ${receivingRank} ${receivingOfficerName} at ${movement.destination}.`;
      cases[caseIdx].lastUpdateDate = new Date().toISOString().split('T')[0];
      saveToStorage(STORAGE_KEYS.CASES, cases);
    }

    // Log traceability
    this.logAction({
      officerId: 'sys_detective',
      officerName: receivingOfficerName,
      officerRank: receivingRank,
      personnelNumber: receivingPersonnelNumber,
      station: DEFAULT_STATION_NAME,
      actionType: 'DOCKET_RECEIPT_ACKNOWLEDGED',
      referenceNumber: movement.caseNumber,
      description: `Docket custody confirmed at ${movement.destination}. Notes: "${receiptNotes}"`
    });

    // Notify Officer
    this.addOfficerNotification({
      type: 'DOCKET_MOVEMENT',
      title: `Docket Received: ${movement.caseNumber}`,
      message: `${receivingRank} ${receivingOfficerName} acknowledged custody at ${movement.destination}.`,
      linkedTab: 'docket-movement',
      linkedId: movement.caseNumber
    });

    return true;
  },

  // Audit Logs
  getAuditLogs(): OfficerAuditLog[] {
    return loadFromStorage<OfficerAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
  },

  logAction(log: Omit<OfficerAuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: OfficerAuditLog = {
      ...log,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs]);
  },

  // Notifications
  getNotifications(): OfficerNotification[] {
    return loadFromStorage<OfficerNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_OFFICER_NOTIFS);
  },

  addOfficerNotification(notif: Omit<OfficerNotification, 'id' | 'timestamp' | 'read'>): void {
    const notifs = this.getNotifications();
    const newNotif: OfficerNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...notifs]);
  },

  markNotificationAsRead(id: string): void {
    const notifs = this.getNotifications();
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  markAllNotificationsAsRead(): void {
    const notifs = this.getNotifications();
    const updated = notifs.map(n => ({ ...n, read: true }));
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  // Dashboard Stats
  getDashboardStats() {
    const reports = this.getReports();
    const cases = this.getRegisteredCases();
    const notifs = this.getNotifications();
    const movements = this.getDocketMovements();

    const awaitingReview = reports.filter(r => r.status === 'Awaiting Review').length;
    const underReview = reports.filter(r => r.status === 'Under Station Review' || r.status === 'Additional Info Required').length;
    const registeredToCase = reports.filter(r => r.status === 'Registered to Case').length;
    const unreadNotifs = notifs.filter(n => !n.read).length;
    const pendingMovements = movements.filter(m => m.status === 'AWAITING_RECEIPT').length;

    return {
      awaitingReview,
      underReview,
      registeredToCase,
      totalReports: reports.length,
      totalCases: cases.length,
      unreadNotifs,
      pendingMovements
    };
  },

  // Detective Branch Services
  getDetectives(): DetectiveOfficer[] {
    return loadFromStorage<DetectiveOfficer[]>(STORAGE_KEYS.DETECTIVES, SEED_DETECTIVES);
  },

  getInvestigationDiary(caseNumber?: string): InvestigationDiaryEntry[] {
    const entries = loadFromStorage<InvestigationDiaryEntry[]>(STORAGE_KEYS.DIARY_ENTRIES, SEED_DIARY_ENTRIES);
    if (!caseNumber) return entries;
    return entries.filter(e => e.caseNumber === caseNumber);
  },

  addInvestigationDiaryEntry(entry: Omit<InvestigationDiaryEntry, 'id' | 'timestamp'>): InvestigationDiaryEntry {
    const entries = loadFromStorage<InvestigationDiaryEntry[]>(STORAGE_KEYS.DIARY_ENTRIES, SEED_DIARY_ENTRIES);
    const newEntry: InvestigationDiaryEntry = {
      ...entry,
      id: `diary_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.DIARY_ENTRIES, [newEntry, ...entries]);
    return newEntry;
  },

  getCaseExhibits(caseNumber?: string): CaseExhibit[] {
    const exhibits = loadFromStorage<CaseExhibit[]>(STORAGE_KEYS.EXHIBITS, SEED_EXHIBITS);
    if (!caseNumber) return exhibits;
    return exhibits.filter(e => e.caseNumber === caseNumber);
  },

  addCaseExhibit(exhibit: Omit<CaseExhibit, 'id' | 'dateLogged'>): CaseExhibit {
    const exhibits = loadFromStorage<CaseExhibit[]>(STORAGE_KEYS.EXHIBITS, SEED_EXHIBITS);
    const newExhibit: CaseExhibit = {
      ...exhibit,
      id: `exh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      dateLogged: new Date().toISOString().split('T')[0]
    };
    saveToStorage(STORAGE_KEYS.EXHIBITS, [newExhibit, ...exhibits]);
    return newExhibit;
  },

  assignInvestigatingOfficer(
    caseNumber: string,
    detectiveId: string,
    instructions: string,
    assignedBy: UserProfile
  ): { success: boolean; message: string } {
    const cases = this.getRegisteredCases();
    const caseIndex = cases.findIndex(c => c.caseNumber === caseNumber);
    if (caseIndex === -1) {
      return { success: false, message: `Case ${caseNumber} not found.` };
    }

    const detectives = this.getDetectives();
    const detective = detectives.find(d => d.id === detectiveId);
    if (!detective) {
      return { success: false, message: 'Detective not found.' };
    }

    const targetCase = { ...cases[caseIndex] };
    targetCase.investigatingOfficer = `${detective.rank} ${detective.fullName}`;
    targetCase.officerRank = detective.rank;
    targetCase.currentStatus = 'Investigation Active';
    targetCase.progressStage = 2; // Investigation Active
    targetCase.lastUpdateDate = new Date().toISOString().split('T')[0];
    targetCase.lastUpdateSummary = `Investigating Officer assigned: ${detective.rank} ${detective.fullName} (${detective.personnelNumber}). Branch Directive: ${instructions || 'Conducting initial complainant and witness consultations.'}`;

    // Update timeline
    targetCase.timeline = targetCase.timeline.map((step) => {
      if (step.title.includes('Investigating Officer Assignment')) {
        return {
          ...step,
          date: new Date().toISOString().split('T')[0],
          description: `Assigned to ${detective.rank} ${detective.fullName} (${detective.desk}). Directive: ${instructions || 'Active investigation underway.'}`,
          completed: true,
          current: false
        };
      }
      if (step.title.includes('Evidence Gathering')) {
        return {
          ...step,
          current: true
        };
      }
      return step;
    });

    cases[caseIndex] = targetCase;
    saveToStorage(STORAGE_KEYS.CASES, cases);

    // Update detective workload
    const updatedDetectives = detectives.map(d => 
      d.id === detectiveId ? { ...d, activeDocketsCount: d.activeDocketsCount + 1 } : d
    );
    saveToStorage(STORAGE_KEYS.DETECTIVES, updatedDetectives);

    // Add entry to investigation diary
    this.addInvestigationDiaryEntry({
      caseNumber,
      authorName: assignedBy.fullName,
      authorRank: assignedBy.rank,
      personnelNumber: assignedBy.personnelNumber,
      entryType: 'DIRECTIVE',
      content: `Detective Branch Assignment: Allocated to ${detective.rank} ${detective.fullName}. Directive: ${instructions || 'Initiate primary investigation and contact complainant.'}`
    });

    // Notify complainant in portal
    const notifs = loadFromStorage<ComplainantNotification[]>(STORAGE_KEYS.COMPLAINANT_NOTIFS, []);
    const newComplainantNotif: ComplainantNotification = {
      id: `notif_${Date.now()}_det_assign`,
      userId: targetCase.userId,
      type: 'case',
      title: `Investigating Officer Assigned: ${caseNumber}`,
      message: `${detective.rank} ${detective.fullName} has been allocated to investigate your case (${caseNumber}). You may contact the Detective Branch at ${detective.contactPhone}.`,
      timestamp: new Date().toISOString(),
      read: false,
      linkedTab: 'my-cases'
    };
    saveToStorage(STORAGE_KEYS.COMPLAINANT_NOTIFS, [newComplainantNotif, ...notifs]);

    // Audit log
    this.logAction({
      officerId: assignedBy.id,
      officerName: assignedBy.fullName,
      officerRank: assignedBy.rank,
      personnelNumber: assignedBy.personnelNumber,
      station: DEFAULT_STATION_NAME,
      actionType: 'CASE_REGISTERED',
      referenceNumber: caseNumber,
      description: `Allocated investigating officer ${detective.rank} ${detective.fullName} to docket ${caseNumber}.`,
      metadata: {
        detective: detective.fullName,
        personnelNumber: detective.personnelNumber,
        desk: detective.desk
      }
    });

    return {
      success: true,
      message: `Docket ${caseNumber} assigned to ${detective.rank} ${detective.fullName}.`
    };
  },

  updateInvestigationStage(
    caseNumber: string,
    newStatus: string,
    stageNumber: number,
    summaryNotes: string,
    updatedBy: UserProfile
  ): { success: boolean; message: string } {
    const cases = this.getRegisteredCases();
    const caseIndex = cases.findIndex(c => c.caseNumber === caseNumber);
    if (caseIndex === -1) {
      return { success: false, message: `Case ${caseNumber} not found.` };
    }

    const targetCase = { ...cases[caseIndex] };
    targetCase.currentStatus = newStatus as any;
    targetCase.progressStage = stageNumber;
    targetCase.lastUpdateDate = new Date().toISOString().split('T')[0];
    targetCase.lastUpdateSummary = summaryNotes;

    // Update timeline step matching stage
    if (stageNumber >= 3 && targetCase.timeline[3]) {
      targetCase.timeline[3].completed = true;
      targetCase.timeline[3].current = false;
    }
    if (stageNumber >= 4 && targetCase.timeline[4]) {
      targetCase.timeline[4].completed = true;
      targetCase.timeline[4].current = stageNumber === 4;
    }

    cases[caseIndex] = targetCase;
    saveToStorage(STORAGE_KEYS.CASES, cases);

    // Add entry to diary
    this.addInvestigationDiaryEntry({
      caseNumber,
      authorName: updatedBy.fullName,
      authorRank: updatedBy.rank,
      personnelNumber: updatedBy.personnelNumber,
      entryType: 'INVESTIGATION_NOTE',
      content: `Investigation Phase Transition: ${newStatus}. Details: ${summaryNotes}`
    });

    // Notify complainant in portal
    const notifs = loadFromStorage<ComplainantNotification[]>(STORAGE_KEYS.COMPLAINANT_NOTIFS, []);
    const newComplainantNotif: ComplainantNotification = {
      id: `notif_${Date.now()}_det_stage`,
      userId: targetCase.userId,
      type: 'case',
      title: `Case Progress Update: ${caseNumber}`,
      message: `Status updated to "${newStatus}": ${summaryNotes}`,
      timestamp: new Date().toISOString(),
      read: false,
      linkedTab: 'my-cases'
    };
    saveToStorage(STORAGE_KEYS.COMPLAINANT_NOTIFS, [newComplainantNotif, ...notifs]);

    return {
      success: true,
      message: `Investigation status updated to "${newStatus}" for ${caseNumber}.`
    };
  }
};
