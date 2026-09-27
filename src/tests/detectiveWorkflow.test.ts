import { describe, it, expect } from 'vitest';
import { detectiveService } from '../services/detectiveService';
import { commanderService, AUTHORISED_STATION_DETECTIVES } from '../services/commanderService';
import { UserProfile } from '../types/auth';

describe('Detective & Station Commander Workflow Tests', () => {
  const testDetectivePersonnelNumber = 'POL-20491'; // Det. Insp. David Khumalo

  const mockDetectiveUser: UserProfile = {
    id: 'usr_pol_20491',
    personnelNumber: 'POL-20491',
    fullName: 'David Khumalo',
    rank: 'Detective Inspector',
    email: 'd.khumalo@saps.gov.za',
    station: 'SAPS Sandton Police Station',
    division: 'General & Serious Crime Investigations',
    role: 'DETECTIVE',
    clearanceLevel: 'Level 2 - Investigating Officer & Evidence Management',
    lastLogin: '2026-09-24T08:00:00Z',
    token: 'jwt_mock_detective_token_sfen_2026'
  };

  const mockCommanderUser: UserProfile = {
    id: 'usr_cmd_01',
    personnelNumber: 'POL-50012',
    fullName: 'Elena Vance',
    rank: 'Senior Superintendent',
    email: 'e.vance@saps.gov.za',
    station: 'SAPS Sandton Police Station',
    division: 'Station Command & Executive Management',
    role: 'COMMANDER',
    clearanceLevel: 'Level 3 - Station Command & Supervisory Review',
    lastLogin: '2026-09-24T08:00:00Z',
    token: 'jwt_mock_commander_token_sfen_2026'
  };

  it('retrieves assigned cases specifically for the authenticated detective', () => {
    const cases = detectiveService.getAssignedCases(testDetectivePersonnelNumber);
    expect(cases.length).toBeGreaterThan(0);
    cases.forEach(c => {
      expect(c.investigatingOfficerPersonnelNumber).toBe(testDetectivePersonnelNumber);
    });
  });

  it('allows detective to acknowledge docket custody and records audit log', () => {
    const cases = detectiveService.getAssignedCases(testDetectivePersonnelNumber);
    const targetCase = cases[0];

    const result = detectiveService.acknowledgeDocketCustody(
      targetCase.caseNumber,
      mockDetectiveUser,
      'Physical docket received in good condition from CSC counter'
    );

    expect(result.success).toBe(true);

    const updatedCase = detectiveService.getCaseByNumber(targetCase.caseNumber, testDetectivePersonnelNumber);
    expect(updatedCase).toBeDefined();
    expect(updatedCase?.isCustodyAcknowledgedByDetective).toBe(true);
    expect(updatedCase?.custodyStatus).toBe('HELD_BY_INVESTIGATING_OFFICER');

    // Verify audit trail contains the acknowledgement
    const audits = detectiveService.getCaseAuditTrail(targetCase.caseNumber);
    expect(audits.some(a => a.action === 'DOCKET_RECEIPT_ACKNOWLEDGED')).toBe(true);
  });

  it('allows detective to respond to supervisor directives', () => {
    const instructions = detectiveService.getSupervisorInstructions({ 
      detectivePersonnelNumber: testDetectivePersonnelNumber 
    });
    expect(instructions.length).toBeGreaterThan(0);

    const targetInstruction = instructions[0];
    const res = detectiveService.respondToInstruction(
      targetInstruction.id,
      'Subpoena drafted and dispatched to cellular service provider legal liaison.',
      'Section 205 compliance acknowledged by network provider. Tower data pending.',
      false,
      mockDetectiveUser
    );

    expect(res.success).toBe(true);
    expect(res.instruction?.status).toBe('IN_PROGRESS');
    expect(res.instruction?.responseActionTaken).toContain('Subpoena drafted');
  });

  it('computes detective workload accurately for station commander oversight', () => {
    const workloads = commanderService.getDetectivesWorkload();
    expect(workloads.length).toBe(AUTHORISED_STATION_DETECTIVES.length);

    const khumaloWorkload = workloads.find(w => w.detective.personnelNumber === testDetectivePersonnelNumber);
    expect(khumaloWorkload).toBeDefined();
    expect(khumaloWorkload?.activeAssignedCasesCount).toBeGreaterThan(0);
  });

  it('allows commander to issue directives and resolve complaints', () => {
    const complaints = commanderService.getStationComplaints();
    expect(complaints.length).toBeGreaterThan(0);

    const targetComplaint = complaints[0];
    const outcome = commanderService.handleComplaint({
      complaintId: targetComplaint.id,
      status: 'Under Investigation',
      commanderNotes: 'Contacted complainant and reviewed docket entries with investigating officer.',
      outcomeResponse: 'The docket has been audited and the detective is instructed to prioritize fingerprint results.',
      commander: mockCommanderUser
    });

    expect(outcome.success).toBe(true);
    expect(outcome.updatedComplaint?.status).toBe('Under Investigation');
    expect(outcome.updatedComplaint?.commanderNotes).toContain('Contacted complainant');
  });
});
