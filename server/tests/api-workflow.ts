import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const baseUrl = process.env.API_TEST_URL || 'http://localhost:3001';
const prisma = new PrismaClient();

type LoginResult = { token: string; user: { id: string; fullName: string; role: string } };

async function request<T>(path: string, options: RequestInit = {}): Promise<{ status: number; data: T }> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  return { status: response.status, data: await response.json() as T };
}

async function login(identifier: string): Promise<LoginResult> {
  const result = await request<LoginResult & { message?: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password: 'DocketSecure2026!' }),
  });
  assert.equal(result.status, 200, result.data.message);
  assert.ok(result.data.token, 'Expected a JWT token.');
  return result.data;
}

async function main() {
  const testMarker = `API workflow test ${Date.now()}`;
  let reportId: string | undefined;
  let caseId: string | undefined;
  let walkInReportId: string | undefined;
  let walkInComplainantId: string | undefined;

  try {
    const [citizen, officer, detective, commander, administrator] = await Promise.all([
      login('9001015009087'),
      login('POL-10824'),
      login('POL-20491'),
      login('POL-30912'),
      login('POL-40199'),
    ]);

    const report = await request<{ id: string; referenceNumber: string; requiresImmediateAttention: boolean }>('/api/reports', {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizen.token}` },
      body: JSON.stringify({
        incidentType: 'Theft / Burglary', incidentDate: '2026-09-26', incidentTime: '10:00',
        address: '100 Grayston Drive', suburb: 'Sandton', city: 'Johannesburg', province: 'Gauteng', latitude: -26.1076, longitude: 28.0567,
        preferredStation: 'SAPS Sandton Police Station', description: testMarker, requiresImmediateAttention: true,
      }),
    });
    assert.equal(report.status, 201);
    assert.equal(report.data.requiresImmediateAttention, true, 'Expected urgent-attention flag on the submitted report.');
    reportId = report.data.id;

    const urgentAlerts = await request<Array<{ id: string; latitude?: number; longitude?: number; complainant: { fullName: string; phoneNumber?: string } }>>('/api/alerts/urgent-reports', {
      headers: { Authorization: `Bearer ${officer.token}` },
    });
    assert.equal(urgentAlerts.status, 200);
    const urgentAlert = urgentAlerts.data.find((item) => item.id === reportId);
    assert.ok(urgentAlert, 'Expected urgent report in the officer alert feed.');
    assert.equal(urgentAlert.latitude, -26.1076);
    assert.equal(urgentAlert.longitude, 28.0567);
    assert.equal(urgentAlert.complainant.fullName, citizen.user.fullName);

    const walkIn = await request<{ id: string; referenceNumber: string; status: string; complainantId: string }>('/api/walk-in-reports', {
      method: 'POST', headers: { Authorization: `Bearer ${officer.token}` },
      body: JSON.stringify({
        fullName: 'Walk-in Test Citizen', phoneNumber: '0825550101', nationalId: String(Date.now()).slice(-13), incidentType: 'Robbery', incidentDate: '2026-09-26', incidentTime: '11:00',
        address: '1 Smith Street', suburb: 'Durban Central', city: 'Durban', province: 'KwaZulu-Natal', description: testMarker,
      }),
    });
    assert.equal(walkIn.status, 201);
    assert.equal(walkIn.data.status, 'UNDER_STATION_REVIEW');
    walkInReportId = walkIn.data.id;
    walkInComplainantId = walkIn.data.complainantId;

    const registered = await request<{ id: string; caseNumber: string }>(`/api/reports/${reportId}/register-case`, {
      method: 'POST', headers: { Authorization: `Bearer ${officer.token}` },
      body: JSON.stringify({ statutoryCode: 'CPA Sec 82', policeStation: 'SAPS Sandton Police Station' }),
    });
    assert.equal(registered.status, 201);
    caseId = registered.data.id;

    const transfer = await request<{ id: string }>(`/api/cases/${caseId}/transfers`, {
      method: 'POST', headers: { Authorization: `Bearer ${officer.token}` },
      body: JSON.stringify({ recipientName: detective.user.fullName, recipientRole: detective.user.role, reason: 'Initial investigator allocation.' }),
    });
    assert.equal(transfer.status, 201);

    const acknowledged = await request(`/api/transfers/${transfer.data.id}/acknowledge`, {
      method: 'POST', headers: { Authorization: `Bearer ${detective.token}` }, body: JSON.stringify({ notes: 'Docket received for investigation.' }),
    });
    assert.equal(acknowledged.status, 200);

    const diary = await request(`/api/cases/${caseId}/diary-entries`, {
      method: 'POST', headers: { Authorization: `Bearer ${detective.token}` },
      body: JSON.stringify({ actionTaken: 'Reviewed the original incident report.', outcome: 'Initial investigation started.', nextAction: 'Identify witnesses.' }),
    });
    assert.equal(diary.status, 201);

    const review = await request(`/api/cases/${caseId}/reviews`, {
      method: 'POST', headers: { Authorization: `Bearer ${commander.token}` },
      body: JSON.stringify({ reviewNotes: 'Initial investigation reviewed.', furtherAction: 'Obtain witness statements.', outcome: 'FURTHER_DIRECTIVES_ISSUED' }),
    });
    assert.equal(review.status, 201);

    const caseDetail = await request<{ transfers: unknown[]; diaryEntries: unknown[]; reviews: unknown[]; audits: unknown[] }>(`/api/cases/${caseId}`, { headers: { Authorization: `Bearer ${commander.token}` } });
    assert.equal(caseDetail.status, 200);
    assert.equal(caseDetail.data.transfers.length, 1);
    assert.equal(caseDetail.data.diaryEntries.length, 1);
    assert.equal(caseDetail.data.reviews.length, 1);
    assert.ok(caseDetail.data.audits.length >= 4, 'Expected an audit trail for the workflow.');

    const activity = await request<Array<{ action: string; referenceNumber?: string }>>('/api/activity?limit=250', { headers: { Authorization: `Bearer ${administrator.token}` } });
    assert.equal(activity.status, 200);
    assert.ok(activity.data.some(entry => entry.action === 'URGENT_INCIDENT_REPORT_SUBMITTED' && entry.referenceNumber === report.data.referenceNumber), 'Expected urgent online report submission in system activity.');
    assert.ok(activity.data.some(entry => entry.action === 'CASE_REGISTERED' && entry.referenceNumber === registered.data.caseNumber), 'Expected CAS registration in system activity.');
    console.log('PASS: Real SFEN API workflow completed successfully.');
  } finally {
    if (caseId) {
      await prisma.$transaction([
        prisma.auditEntry.deleteMany({ where: { caseId } }),
        prisma.supervisoryReview.deleteMany({ where: { caseId } }),
        prisma.investigationDiaryEntry.deleteMany({ where: { caseId } }),
        prisma.docketTransfer.deleteMany({ where: { caseId } }),
        prisma.case.delete({ where: { id: caseId } }),
      ]);
    }
    if (reportId) await prisma.auditEntry.deleteMany({ where: { entityId: reportId } });
    if (reportId) await prisma.incidentReport.delete({ where: { id: reportId } });
    if (walkInReportId) await prisma.auditEntry.deleteMany({ where: { entityId: walkInReportId } });
    if (walkInReportId) await prisma.incidentReport.delete({ where: { id: walkInReportId } });
    if (walkInComplainantId) await prisma.user.delete({ where: { id: walkInComplainantId } });
    await prisma.$disconnect();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
