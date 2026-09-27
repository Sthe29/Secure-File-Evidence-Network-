import { describe, it, expect } from 'vitest';
import { 
  getRegisteredCases, 
  submitServiceComplaint, 
  submitIncidentReport, 
  getServiceComplaints 
} from '../services/complainantService';
import { officerService } from '../services/officerService';
import { UserProfile } from '../types/auth';

describe('Complainant & Police Officer Front Desk Tests', () => {
  const mockOfficerUser: UserProfile = {
    id: 'usr_csc_01',
    personnelNumber: 'POL-10824',
    fullName: 'Sarah Ndlovu',
    rank: 'Constable',
    email: 's.ndlovu@saps.gov.za',
    station: 'SAPS Sandton Police Station',
    division: 'Community Service Centre (CSC) Frontline Intake',
    role: 'CSC_OFFICER',
    clearanceLevel: 'Level 1 - Frontline Intake & Registration',
    lastLogin: '2026-09-24T08:00:00Z',
    token: 'jwt_mock_officer_token_sfen_2026'
  };

  it('allows citizen to track cases', () => {
    const cases = getRegisteredCases('cit_0192');
    expect(cases.length).toBeGreaterThan(0);
    const targetCase = cases.find(c => c.caseNumber === 'CAS 342/08/2026');
    expect(targetCase).toBeDefined();
    expect(targetCase?.investigatingOfficer).toContain('Khumalo');
    expect(targetCase?.currentStatus).toBe('Investigation Active');
  });

  it('allows citizen to submit an incident report and a service complaint', () => {
    const newReport = submitIncidentReport({
      userId: 'cit_0192',
      complainantName: 'Thandi Molefe',
      complainantPhone: '0825550192',
      complainantEmail: 'thandi.molefe@gmail.com',
      incidentType: 'Theft / Burglary',
      incidentDate: '2026-09-24',
      incidentTime: '10:00',
      policeStation: 'SAPS Sandton Police Station',
      location: {
        address: '100 Grayston Drive',
        suburb: 'Sandton',
        city: 'Johannesburg',
        province: 'Gauteng',
        preferredStation: 'SAPS Sandton Police Station'
      },
      description: 'Theft of portable electronic equipment from office lobby.',
      involvedParties: {
        suspectDetails: 'Unidentified individual captured on reception CCTV.',
        stolenItems: 'Laptop and mobile tablet'
      },
      attachments: []
    });

    expect(newReport).toBeDefined();
    expect(newReport.referenceNumber).toMatch(/^SFEN-RPT-\d+$/);
    expect(newReport.status).toBe('Awaiting Review');

    const newComplaint = submitServiceComplaint({
      userId: 'cit_0192',
      category: 'Investigation Delay / Lack of Updates',
      policeStation: 'SAPS Sandton Police Station',
      linkedReference: 'CAS 342/08/2026',
      details: 'Requesting an urgent update on forensic ballistics results.',
      desiredResolution: 'Direct communication from investigating officer.'
    });

    expect(newComplaint).toBeDefined();
    expect(newComplaint.linkedReference).toBe('CAS 342/08/2026');
    expect(newComplaint.status).toBe('Pending Review');

    const complaints = getServiceComplaints('cit_0192');
    expect(complaints.some(c => c.id === newComplaint.id)).toBe(true);
  });

  it('allows frontline CSC officer to review reports and generate official CAS numbers', () => {
    const reports = officerService.getReports();
    expect(reports.length).toBeGreaterThan(0);

    const pendingReport = reports.find(r => r.status === 'Awaiting Review') || reports[0];
    const reviewed = officerService.markReportUnderReview(pendingReport.id, mockOfficerUser);
    expect(reviewed).not.toBeNull();
    expect(reviewed?.status).toBe('Under Station Review');

    const registration = officerService.registerCase({
      reportId: pendingReport.id,
      reportReference: pendingReport.referenceNumber,
      complainantName: pendingReport.complainantName,
      complainantPhone: pendingReport.complainantPhone,
      complainantEmail: pendingReport.complainantEmail,
      incidentType: pendingReport.incidentType,
      incidentDate: pendingReport.incidentDate,
      incidentTime: pendingReport.incidentTime,
      locationAddress: pendingReport.location.address,
      locationSuburb: pendingReport.location.suburb,
      chargeDescription: 'Theft of Electronics',
      statutoryCode: 'CPA Sec 82',
      priorityLevel: 'Standard',
      initialDocketDestination: 'Investigating Officer Desk',
      officerIntakeNotes: 'Duly verified statement and registered official docket.'
    }, mockOfficerUser);

    expect(registration.success).toBe(true);
    expect(registration.caseNumber).toMatch(/^CAS \d+\/\d+\/\d+$/);
    expect(registration.registeredCase?.currentStatus).toBe('Case Registered');
  });
});
