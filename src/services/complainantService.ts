import { 
  IncidentReport, 
  RegisteredCase, 
  ServiceComplaint, 
  ComplainantNotification 
} from '../types/complainant';

const STORAGE_KEYS = {
  REPORTS: 'sfen_incident_reports',
  CASES: 'sfen_registered_cases',
  COMPLAINTS: 'sfen_service_complaints',
  STATION_COMPLAINTS: 'sfen_station_complaints',
  NOTIFICATIONS: 'sfen_complainant_notifications',
  NEXT_RPT_NUM: 'sfen_next_report_number',
  NEXT_CMP_NUM: 'sfen_next_complaint_number'
};

// Default seed data for rich presentation
export const SEED_REPORTS: IncidentReport[] = [
  {
    id: 'rpt_seed_001',
    referenceNumber: 'SFEN-RPT-000124',
    userId: 'cit_0192',
    complainantName: 'Thandi Molefe',
    complainantPhone: '0825550192',
    complainantEmail: 'thandi.molefe@gmail.com',
    incidentType: 'Theft / Burglary',
    incidentDate: '2026-09-18',
    incidentTime: '14:30',
    location: {
      address: '42 Nelson Mandela Boulevard',
      suburb: 'Morningside',
      city: 'Johannesburg',
      province: 'Gauteng',
      preferredStation: 'Central Precinct (Sector 4)',
      landmark: 'Near Morningside Shopping Centre'
    },
    description: 'Broke into locked motor vehicle parked at the shopping complex. Smashed passenger side window and removed a laptop bag containing an HP EliteBook laptop, external hard drive, and personal identification documents.',
    involvedParties: {
      suspectDetails: 'Two males observed in CCTV, wearing dark hooded jackets, drove off in a silver sedan.',
      witnessDetails: 'Parking security guard named Joseph (083 444 1122).',
      vehicleDetails: 'Silver VW Polo, partial registration GP 44...',
      stolenItems: 'HP EliteBook 840 G8 serial #5CG12984, Western Digital 1TB HDD, Leather Satchel.'
    },
    attachments: [
      {
        id: 'att_1',
        name: 'vehicle_broken_window.jpg',
        size: '2.4 MB',
        type: 'image/jpeg',
        uploadedAt: '2026-09-18T15:10:00Z',
        category: 'Photo'
      },
      {
        id: 'att_2',
        name: 'laptop_purchase_receipt.pdf',
        size: '480 KB',
        type: 'application/pdf',
        uploadedAt: '2026-09-18T15:12:00Z',
        category: 'Receipt'
      }
    ],
    status: 'Awaiting Review',
    submittedAt: '2026-09-18T15:15:00Z',
    policeStation: 'Central Precinct (Sector 4)',
    stationNotes: 'Pending initial intake review by CSC desk supervisor. Officer will verify jurisdiction and assign review docket.'
  }
];

const SEED_CASES: RegisteredCase[] = [
  {
    id: 'cas_seed_001',
    caseNumber: 'CAS 342/08/2026',
    reportReference: 'SFEN-RPT-000088',
    userId: 'cit_0192',
    incidentType: 'Fraud / Cybercrime',
    policeStation: 'Central Precinct - Commercial Crime Branch',
    investigatingOfficer: 'Det. Insp. D. Khumalo',
    officerRank: 'Detective Inspector',
    dateRegistered: '2026-08-22',
    currentStatus: 'Investigation Active',
    progressStage: 3, // 1: Registered, 2: Assigned, 3: Investigation Active, 4: Court / NPA, 5: Concluded
    lastUpdateDate: '2026-09-14',
    lastUpdateSummary: 'Subpoena issued under Section 205 of Criminal Procedure Act to commercial bank for beneficiary account audit trails. Subpoena returns expected next week.',
    nextCourtDate: '2026-10-15 (Specialised Commercial Court)',
    timeline: [
      {
        title: 'Official Case Registration',
        date: '2026-08-22',
        description: 'Case formally registered in police docket register with CAS 342/08/2026 following station verification.',
        completed: true,
        current: false
      },
      {
        title: 'Investigating Officer Assigned',
        date: '2026-08-25',
        description: 'Assigned to Detective Inspector D. Khumalo (Serious Commercial Crimes Division). Initial phone interview conducted.',
        completed: true,
        current: false
      },
      {
        title: 'Evidence Gathering & Bank Subpoenas',
        date: '2026-09-14',
        description: 'Sec. 205 legal directives served on clearing banks. Forensic digital affidavit submitted.',
        completed: false,
        current: true
      },
      {
        title: 'Prosecution Docket Submission',
        date: 'Estimated Oct 2026',
        description: 'Docket transfer to National Prosecuting Authority (NPA) for formal charging decision.',
        completed: false,
        current: false
      },
      {
        title: 'Judicial Hearing & Case Finalization',
        date: 'Pending Court Date',
        description: 'Trial proceedings, verdict determination, and docket closure.',
        completed: false,
        current: false
      }
    ]
  }
];

const SEED_COMPLAINTS: ServiceComplaint[] = [
  {
    id: 'cmp_seed_001',
    referenceNumber: 'SFEN-CMP-000042',
    userId: 'cit_0192',
    category: 'Investigation Delay / Lack of Updates',
    policeStation: 'Central Precinct (Sector 4)',
    linkedReference: 'CAS 342/08/2026',
    incidentDate: '2026-09-02',
    details: 'Requested an SMS docket update from frontline CSC desk regarding my commercial crime investigation and received no callback after 7 business days.',
    desiredResolution: 'Direct status contact from the investigating officer and SMS automated dispatch verification.',
    status: 'Assigned to Station Commander',
    submittedAt: '2026-09-05T10:20:00Z',
    assignedOfficer: 'Snr. Supt. Elena Vance',
    resolutionFeedback: 'Station Commander has directed the Detective Branch Head to issue formal progress briefing. SMS notification system link restored.'
  }
];

const SEED_NOTIFICATIONS: ComplainantNotification[] = [
  {
    id: 'notif_001',
    userId: 'cit_0192',
    type: 'report',
    title: 'Report Received',
    message: 'Your report SFEN-RPT-000124 has been received and is awaiting station review.',
    timestamp: '2026-09-18T15:15:00Z',
    read: false,
    linkedTab: 'my-reports'
  },
  {
    id: 'notif_002',
    userId: 'cit_0192',
    type: 'case',
    title: 'Investigation Update',
    message: 'New progress update recorded on case CAS 342/08/2026.',
    timestamp: '2026-09-14T11:42:00Z',
    read: false,
    linkedTab: 'my-cases'
  },
  {
    id: 'notif_003',
    userId: 'cit_0192',
    type: 'complaint',
    title: 'Complaint Assigned',
    message: 'Your complaint SFEN-CMP-000042 has been assigned to the Station Commander.',
    timestamp: '2026-09-06T09:00:00Z',
    read: true,
    linkedTab: 'complaints'
  }
];

// Helper to access LocalStorage safely
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

// Reports Service
const isDemoCitizen = (id?: string) => id === 'cit_0192' || id === 'ctz_thandi_01';

export function getIncidentReports(userId?: string): IncidentReport[] {
  const reports = loadFromStorage<IncidentReport[]>(STORAGE_KEYS.REPORTS, SEED_REPORTS);
  if (!userId) return reports;
  return reports.filter((r) => r.userId === userId || (isDemoCitizen(userId) && r.userId === 'cit_0192'));
}

export function submitIncidentReport(
  payload: Omit<IncidentReport, 'id' | 'referenceNumber' | 'status' | 'submittedAt'>
): IncidentReport {
  const allReports = loadFromStorage<IncidentReport[]>(STORAGE_KEYS.REPORTS, SEED_REPORTS);
  
  // Generate sequential reference like SFEN-RPT-000125
  let nextCounter = parseInt(localStorage.getItem(STORAGE_KEYS.NEXT_RPT_NUM) || '125', 10);
  const refNumber = `SFEN-RPT-${String(nextCounter).padStart(6, '0')}`;
  localStorage.setItem(STORAGE_KEYS.NEXT_RPT_NUM, String(nextCounter + 1));

  const newReport: IncidentReport = {
    ...payload,
    id: `rpt_${Date.now()}`,
    referenceNumber: refNumber,
    status: 'Awaiting Review',
    submittedAt: new Date().toISOString(),
    stationNotes: 'Report queued in station digital tray. Awaiting Community Service Centre (CSC) docket officer review.'
  };

  const updated = [newReport, ...allReports];
  saveToStorage(STORAGE_KEYS.REPORTS, updated);

  // Auto-generate notification for the user
  addNotification({
    userId: payload.userId,
    type: 'report',
    title: 'Report Submitted: ' + refNumber,
    message: `Your incident report regarding ${payload.incidentType} was successfully transmitted to ${payload.policeStation}. Status: Awaiting Review.`,
    read: false,
    linkedTab: 'my-reports'
  });

  return newReport;
}

export async function submitIncidentReportToApi(input: Omit<IncidentReport, 'id' | 'referenceNumber' | 'status' | 'submittedAt'>, token: string): Promise<IncidentReport> {
  const response = await fetch('/api/reports', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      incidentType: input.incidentType, incidentDate: input.incidentDate, incidentTime: input.incidentTime,
      address: input.location.address, suburb: input.location.suburb, city: input.location.city, province: input.location.province,
      latitude: input.location.latitude, longitude: input.location.longitude,
      preferredStation: input.location.preferredStation, description: input.description,
      involvedParties: input.involvedParties, attachments: input.attachments,
      requiresImmediateAttention: Boolean(input.requiresImmediateAttention)
    })
  });
  const data = await response.json() as any;
  if (!response.ok) throw new Error(data.message || 'Report submission failed.');
  return {
    id: data.id, referenceNumber: data.referenceNumber, userId: data.complainantId,
    complainantName: input.complainantName, complainantPhone: input.complainantPhone, complainantEmail: input.complainantEmail,
    incidentType: data.incidentType, incidentDate: data.incidentDate.slice(0, 10), incidentTime: data.incidentTime || '',
    location: input.location, description: data.description, involvedParties: data.involvedParties || {}, attachments: data.attachments || [],
    status: 'Awaiting Review', requiresImmediateAttention: Boolean(data.requiresImmediateAttention), submittedAt: data.createdAt, policeStation: input.policeStation
  };
}

export async function getIncidentReportsFromApi(token: string, citizen: { id: string; fullName: string; email: string; phoneNumber: string }): Promise<IncidentReport[]> {
  const response = await fetch('/api/reports', { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Unable to load online reports.');
  const reports = await response.json() as any[];
  return reports.map((data) => ({
    id: data.id, referenceNumber: data.referenceNumber, userId: data.complainantId,
    complainantName: citizen.fullName, complainantPhone: citizen.phoneNumber, complainantEmail: citizen.email,
    incidentType: data.incidentType, incidentDate: data.incidentDate.slice(0, 10), incidentTime: data.incidentTime || '',
    location: { address: data.address, suburb: data.suburb, city: data.city, province: data.province, preferredStation: data.preferredStation || 'Police Station' },
    description: data.description, involvedParties: data.involvedParties || {}, attachments: data.attachments || [],
    status: data.status === 'REGISTERED_TO_CASE' ? 'Registered to Case' : data.status === 'UNDER_STATION_REVIEW' ? 'Under Station Review' : data.status === 'ADDITIONAL_INFO_REQUIRED' ? 'Additional Info Required' : 'Awaiting Review',
    requiresImmediateAttention: Boolean(data.requiresImmediateAttention),
    submittedAt: data.createdAt, policeStation: data.preferredStation || 'Police Station',
    linkedCaseNumber: data.case?.caseNumber,
    detectiveReceipt: data.case?.transfers?.[0]?.acknowledgedAt ? {
      detectiveName: data.case.transfers[0].recipientName,
      acknowledgedAt: data.case.transfers[0].acknowledgedAt
    } : undefined
  }));
}

// Cases Service
export function getRegisteredCases(userId?: string): RegisteredCase[] {
  const cases = loadFromStorage<RegisteredCase[]>(STORAGE_KEYS.CASES, SEED_CASES);
  if (!userId) return cases;
  return cases.filter((c) => c.userId === userId || (isDemoCitizen(userId) && c.userId === 'cit_0192'));
}

// Complaints Service
export function getServiceComplaints(userId?: string): ServiceComplaint[] {
  const complaints = loadFromStorage<ServiceComplaint[]>(STORAGE_KEYS.COMPLAINTS, SEED_COMPLAINTS);
  if (!userId) return complaints;
  return complaints.filter((c) => c.userId === userId || (isDemoCitizen(userId) && c.userId === 'cit_0192'));
}

export function submitServiceComplaint(
  payload: Omit<ServiceComplaint, 'id' | 'referenceNumber' | 'status' | 'submittedAt'>
): ServiceComplaint {
  const allComplaints = loadFromStorage<ServiceComplaint[]>(STORAGE_KEYS.COMPLAINTS, SEED_COMPLAINTS);

  let nextCounter = parseInt(localStorage.getItem(STORAGE_KEYS.NEXT_CMP_NUM) || '43', 10);
  const refNumber = `SFEN-CMP-${String(nextCounter).padStart(6, '0')}`;
  localStorage.setItem(STORAGE_KEYS.NEXT_CMP_NUM, String(nextCounter + 1));

  const newComplaint: ServiceComplaint = {
    ...payload,
    id: `cmp_${Date.now()}`,
    referenceNumber: refNumber,
    status: 'Pending Review',
    submittedAt: new Date().toISOString(),
    assignedOfficer: 'Station Executive Officer',
    resolutionFeedback: 'Formal receipt acknowledged. Forwarded to precinct quality of service officer.'
  };

  const updated = [newComplaint, ...allComplaints];
  saveToStorage(STORAGE_KEYS.COMPLAINTS, updated);

  // The commander workspace has its own station queue. Keep a matching record
  // there so that a complaint lodged by a citizen can be handled by the station.
  const stationComplaints = loadFromStorage<Record<string, unknown>[]>(STORAGE_KEYS.STATION_COMPLAINTS, []);
  if (!stationComplaints.some((complaint) => complaint.id === newComplaint.id || complaint.referenceNumber === newComplaint.referenceNumber)) {
    stationComplaints.unshift({
      id: newComplaint.id,
      referenceNumber: newComplaint.referenceNumber,
      complainantName: newComplaint.complainantName || 'Registered complainant',
      complainantPhone: newComplaint.complainantPhone || 'Not provided',
      complainantEmail: newComplaint.complainantEmail,
      category: newComplaint.category,
      linkedCaseNumber: newComplaint.linkedReference,
      policeStation: newComplaint.policeStation,
      dateSubmitted: newComplaint.submittedAt,
      details: newComplaint.details,
      desiredResolution: newComplaint.desiredResolution,
      status: 'Pending Review'
    });
    saveToStorage(STORAGE_KEYS.STATION_COMPLAINTS, stationComplaints);
  }

  addNotification({
    userId: payload.userId,
    type: 'complaint',
    title: 'Complaint Logged: ' + refNumber,
    message: `Your service grievance regarding ${payload.category} has been logged under reference ${refNumber}.`,
    read: false,
    linkedTab: 'complaints'
  });

  return newComplaint;
}

/** Mirrors a station commander's response back to the complainant portal. */
export function applyCommanderComplaintUpdate(params: {
  complaintId: string;
  referenceNumber: string;
  status: 'Pending Review' | 'Under Investigation' | 'Action Taken' | 'Resolved';
  commanderName: string;
  commanderRank: string;
  commanderNotes: string;
  outcomeResponse: string;
}): boolean {
  const complaints = loadFromStorage<ServiceComplaint[]>(STORAGE_KEYS.COMPLAINTS, SEED_COMPLAINTS);
  const index = complaints.findIndex((complaint) =>
    complaint.id === params.complaintId || complaint.referenceNumber === params.referenceNumber
  );
  if (index === -1) return false;

  const statusMap: Record<typeof params.status, ServiceComplaint['status']> = {
    'Pending Review': 'Pending Review',
    'Under Investigation': 'Investigation Active',
    'Action Taken': 'Resolution Issued',
    'Resolved': 'Resolution Issued'
  };
  const response = params.outcomeResponse || params.commanderNotes;
  const assignedOfficer = `${params.commanderRank} ${params.commanderName}`;
  const updatedComplaint: ServiceComplaint = {
    ...complaints[index],
    status: statusMap[params.status],
    assignedOfficer,
    resolutionFeedback: response
  };
  complaints[index] = updatedComplaint;
  saveToStorage(STORAGE_KEYS.COMPLAINTS, complaints);

  addNotification({
    userId: updatedComplaint.userId,
    type: 'complaint',
    title: `Complaint Updated: ${updatedComplaint.referenceNumber}`,
    message: `${assignedOfficer} updated your complaint to ${updatedComplaint.status}.${response ? ` ${response}` : ''}`,
    read: false,
    linkedId: updatedComplaint.id,
    linkedTab: 'complaints'
  });
  return true;
}

// Notifications Service
export function getNotifications(userId?: string): ComplainantNotification[] {
  const notifs = loadFromStorage<ComplainantNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  if (!userId) return notifs;
  return notifs.filter((n) => n.userId === userId || (isDemoCitizen(userId) && n.userId === 'cit_0192'));
}

export function addNotification(notif: Omit<ComplainantNotification, 'id' | 'timestamp'>): void {
  const all = loadFromStorage<ComplainantNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  const newNotif: ComplainantNotification = {
    ...notif,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    timestamp: new Date().toISOString()
  };
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...all]);
}

export function markNotificationAsRead(id: string): void {
  const all = loadFromStorage<ComplainantNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
}

export function markAllNotificationsAsRead(userId?: string): void {
  const all = loadFromStorage<ComplainantNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  const updated = all.map((n) => (!userId || n.userId === userId ? { ...n, read: true } : n));
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
}

