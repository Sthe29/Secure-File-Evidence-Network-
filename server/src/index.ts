import 'dotenv/config';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.API_PORT || 3001);
const jwtSecret = process.env.JWT_SECRET ?? '';

if (!jwtSecret) throw new Error('JWT_SECRET must be set in .env before starting the API.');

app.use(cors({ origin: process.env.WEB_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

type AuthenticatedRequest = Request & { user?: { id: string; role: UserRole; fullName: string } };

function requireAuth(roles?: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ message: 'Authentication is required.' });
    try {
      const payload = jwt.verify(token, jwtSecret) as unknown as { sub: string; role: UserRole; fullName: string };
      if (roles && !roles.includes(payload.role)) return res.status(403).json({ message: 'You are not authorised for this action.' });
      req.user = { id: payload.sub, role: payload.role, fullName: payload.fullName };
      next();
    } catch { return res.status(401).json({ message: 'Your session is invalid or has expired.' }); }
  };
}

async function audit(caseId: string | undefined, actorId: string | undefined, action: string, description: string, metadata?: object, referenceNumber?: string, entityType?: string, entityId?: string) {
  return prisma.auditEntry.create({ data: { caseId, actorId, action, description, metadata, referenceNumber, entityType, entityId } });
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'SFEN API' }));

app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body as { identifier?: string; password?: string };
  if (!identifier || !password) return res.status(400).json({ message: 'Identifier and password are required.' });
  const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier.toLowerCase() }, { personnelNumber: identifier.toUpperCase() }, { phoneNumber: identifier.trim() }] } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
  const bcrypt = await import('bcryptjs');
  if (!(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid credentials.' });
  const token = jwt.sign({ sub: user.id, role: user.role, fullName: user.fullName }, jwtSecret, { expiresIn: '8h' });
  await audit(undefined, user.id, 'LOGIN', 'User authenticated successfully.');
  res.json({ token, user: { id: user.id, email: user.email, personnelNumber: user.personnelNumber, fullName: user.fullName, rank: user.rank, station: user.station, division: user.division, phoneNumber: user.phoneNumber, role: user.role, createdAt: user.createdAt } });
});

app.post('/api/citizens/register', async (req, res) => {
  const { fullName, email, phoneNumber, password } = req.body as { fullName?: string; email?: string; phoneNumber?: string; password?: string };
  if (!fullName || !email || !phoneNumber || !password || password.length < 8) return res.status(400).json({ message: 'Name, email, phone number, and a password of at least 8 characters are required.' });
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });
  const bcrypt = await import('bcryptjs');
  const user = await prisma.user.create({ data: { email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), fullName: fullName.trim(), phoneNumber: phoneNumber.trim(), role: UserRole.COMPLAINANT, division: 'Public Portal' } });
  const token = jwt.sign({ sub: user.id, role: user.role, fullName: user.fullName }, jwtSecret, { expiresIn: '8h' });
  await audit(undefined, user.id, 'CITIZEN_ACCOUNT_CREATED', 'Created a public SFEN account.', undefined, undefined, 'USER', user.id);
  res.status(201).json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, phoneNumber: user.phoneNumber, role: user.role, createdAt: user.createdAt } });
});

app.post('/api/reports', requireAuth([UserRole.COMPLAINANT]), async (req: AuthenticatedRequest, res) => {
  const { incidentType, incidentDate, incidentTime, address, suburb, city, province, preferredStation, description, involvedParties } = req.body;
  if (!incidentType || !incidentDate || !address || !suburb || !city || !province || !description) return res.status(400).json({ message: 'Complete incident and location details are required.' });
  const referenceNumber = `SFEN-RPT-${String(Date.now()).slice(-6)}`;
  const report = await prisma.incidentReport.create({ data: { referenceNumber, complainantId: req.user!.id, incidentType, incidentDate: new Date(incidentDate), incidentTime, address, suburb, city, province, preferredStation, description, involvedParties } });
  await audit(undefined, req.user!.id, 'INCIDENT_REPORT_SUBMITTED', `Submitted online incident report ${referenceNumber}.`, { incidentType }, referenceNumber, 'INCIDENT_REPORT', report.id);
  res.status(201).json(report);
});

app.get('/api/reports', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const where = req.user!.role === UserRole.COMPLAINANT ? { complainantId: req.user!.id } : {};
  res.json(await prisma.incidentReport.findMany({ where, orderBy: { createdAt: 'desc' } }));
});

app.post('/api/reports/:reportId/register-case', requireAuth([UserRole.CSC_OFFICER]), async (req: AuthenticatedRequest, res) => {
  const report = await prisma.incidentReport.findUnique({ where: { id: req.params.reportId } });
  if (!report || report.status === 'REGISTERED_TO_CASE') return res.status(400).json({ message: 'This report cannot be registered.' });
  const { statutoryCode, priorityLevel = 'Standard', policeStation } = req.body;
  const now = new Date();
  const caseNumber = `CAS ${String(now.getTime()).slice(-6)}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const created = await prisma.$transaction(async tx => {
    await tx.incidentReport.update({ where: { id: report.id }, data: { status: 'REGISTERED_TO_CASE' } });
    const caseRecord = await tx.case.create({ data: { caseNumber, reportId: report.id, registeredById: req.user!.id, policeStation: policeStation || report.preferredStation || 'Unassigned station', incidentType: report.incidentType, statutoryCode, priorityLevel, currentCustodianId: req.user!.id, currentCustodianName: req.user!.fullName, currentCustodianRole: 'CSC_OFFICER' } });
    await tx.auditEntry.create({ data: { caseId: caseRecord.id, actorId: req.user!.id, action: 'CASE_REGISTERED', description: `Registered official case ${caseNumber} from online report ${report.referenceNumber}.`, referenceNumber: caseNumber, entityType: 'CASE', entityId: caseRecord.id, metadata: { onlineReportReference: report.referenceNumber } } });
    return caseRecord;
  });
  res.status(201).json(created);
});

app.get('/api/cases/:caseId', requireAuth(), async (req, res) => {
  const caseRecord = await prisma.case.findUnique({ where: { id: req.params.caseId }, include: { report: true, transfers: { orderBy: { sentAt: 'desc' } }, diaryEntries: { orderBy: { createdAt: 'desc' } }, reviews: { orderBy: { createdAt: 'desc' } }, audits: { orderBy: { createdAt: 'desc' } } } });
  if (!caseRecord) return res.status(404).json({ message: 'Case not found.' });
  await audit(caseRecord.id, (req as AuthenticatedRequest).user!.id, 'CASE_ACCESSED', `Accessed case ${caseRecord.caseNumber}.`, undefined, caseRecord.caseNumber, 'CASE', caseRecord.id);
  res.json(caseRecord);
});

app.get('/api/activity', requireAuth([UserRole.ADMINISTRATOR]), async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 250);
  const entries = await prisma.auditEntry.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { actor: { select: { fullName: true, role: true, personnelNumber: true } }, case: { select: { caseNumber: true } } },
  });
  res.json(entries);
});

app.post('/api/cases/:caseId/transfers', requireAuth([UserRole.CSC_OFFICER, UserRole.DETECTIVE, UserRole.COMMANDER]), async (req: AuthenticatedRequest, res) => {
  const { recipientName, recipientRole, reason } = req.body;
  if (!recipientName || !recipientRole || !reason) return res.status(400).json({ message: 'Recipient and movement reason are required.' });
  const caseRecord = await prisma.case.findUnique({ where: { id: req.params.caseId } });
  if (!caseRecord) return res.status(404).json({ message: 'Case not found.' });
  if (caseRecord.currentCustodianId && caseRecord.currentCustodianId !== req.user!.id) {
    return res.status(403).json({ message: 'Only the current docket custodian may transfer this case.' });
  }
  const transfer = await prisma.docketTransfer.create({ data: { caseId: caseRecord.id, previousCustodian: caseRecord.currentCustodianName, newCustodian: recipientName, senderName: req.user!.fullName, senderRole: req.user!.role, recipientName, recipientRole, reason } });
  await audit(caseRecord.id, req.user!.id, 'DOCKET_MOVEMENT_INITIATED', `Transferred docket to ${recipientName}; acknowledgement required.`, { transferId: transfer.id, previousCustodian: caseRecord.currentCustodianName, newCustodian: recipientName, reason }, caseRecord.caseNumber, 'DOCKET_TRANSFER', transfer.id);
  res.status(201).json(transfer);
});

app.post('/api/transfers/:transferId/acknowledge', requireAuth([UserRole.DETECTIVE, UserRole.COMMANDER]), async (req: AuthenticatedRequest, res) => {
  const transfer = await prisma.docketTransfer.findUnique({ where: { id: req.params.transferId } });
  if (!transfer || transfer.status !== 'AWAITING_ACKNOWLEDGEMENT') return res.status(400).json({ message: 'This transfer cannot be acknowledged.' });
  if (transfer.recipientName !== req.user!.fullName || transfer.recipientRole !== req.user!.role) {
    return res.status(403).json({ message: 'Only the intended recipient may acknowledge this transfer.' });
  }
  const result = await prisma.$transaction(async tx => {
    const acknowledged = await tx.docketTransfer.update({ where: { id: transfer.id }, data: { status: 'ACKNOWLEDGED_RECEIVED', acknowledgedAt: new Date(), acknowledgementNotes: req.body.notes } });
    const caseRecord = await tx.case.update({ where: { id: transfer.caseId }, data: { currentCustodianId: req.user!.id, currentCustodianName: req.user!.fullName, currentCustodianRole: req.user!.role } });
    await tx.auditEntry.create({ data: { caseId: caseRecord.id, actorId: req.user!.id, action: 'DOCKET_RECEIPT_ACKNOWLEDGED', description: `Acknowledged custody of the docket from ${transfer.senderName}.`, referenceNumber: caseRecord.caseNumber, entityType: 'DOCKET_TRANSFER', entityId: transfer.id } });
    return acknowledged;
  });
  res.json(result);
});

app.post('/api/cases/:caseId/diary-entries', requireAuth([UserRole.DETECTIVE]), async (req: AuthenticatedRequest, res) => {
  const { entryType = 'INVESTIGATION_NOTE', actionTaken, outcome, nextAction } = req.body;
  if (!actionTaken || !outcome) return res.status(400).json({ message: 'Action taken and outcome are required.' });
  const caseRecord = await prisma.case.findUnique({ where: { id: req.params.caseId } });
  if (!caseRecord) return res.status(404).json({ message: 'Case not found.' });
  if (caseRecord.currentCustodianId !== req.user!.id) return res.status(403).json({ message: 'Only the current docket custodian may record investigation activity.' });
  const entry = await prisma.investigationDiaryEntry.create({ data: { caseId: req.params.caseId, authorName: req.user!.fullName, authorRole: req.user!.role, entryType, actionTaken, outcome, nextAction } });
  await audit(req.params.caseId, req.user!.id, 'INVESTIGATION_ENTRY_RECORDED', 'Recorded an investigation diary entry.', { entryId: entry.id }, caseRecord.caseNumber, 'INVESTIGATION_DIARY_ENTRY', entry.id);
  res.status(201).json(entry);
});

app.post('/api/cases/:caseId/reviews', requireAuth([UserRole.COMMANDER]), async (req: AuthenticatedRequest, res) => {
  const { reviewNotes, furtherAction, nextReviewDate, outcome } = req.body;
  if (!reviewNotes || !outcome) return res.status(400).json({ message: 'Review notes and outcome are required.' });
  const caseRecord = await prisma.case.findUnique({ where: { id: req.params.caseId } });
  if (!caseRecord) return res.status(404).json({ message: 'Case not found.' });
  const review = await prisma.supervisoryReview.create({ data: { caseId: req.params.caseId, commanderName: req.user!.fullName, reviewNotes, furtherAction, nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : undefined, outcome } });
  await audit(req.params.caseId, req.user!.id, 'SUPERVISORY_REVIEW_RECORDED', `Recorded supervisory review: ${outcome}.`, { reviewId: review.id, furtherAction }, caseRecord.caseNumber, 'SUPERVISORY_REVIEW', review.id);
  res.status(201).json(review);
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

app.listen(port, () => console.log(`SFEN API listening on http://localhost:${port}`));
