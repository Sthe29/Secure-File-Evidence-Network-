import 'dotenv/config';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AccountStatus, PrismaClient, ReportStatus, UserRole } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.API_PORT || 3001);
const jwtSecret = process.env.JWT_SECRET ?? '';

if (!jwtSecret) throw new Error('JWT_SECRET must be set in .env before starting the API.');

app.use(cors({ origin: process.env.WEB_ORIGIN || 'http://localhost:3000' }));
// Evidence previews are stored with the report during this local prototype.
// The client limits individual uploads to 15 MB, and base64 encoding needs extra room.
app.use(express.json({ limit: '25mb' }));

type AuthenticatedRequest = Request & { user?: { id: string; role: UserRole; fullName: string } };

function requireAuth(roles?: UserRole[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ message: 'Authentication is required.' });
    try {
      const payload = jwt.verify(token, jwtSecret) as unknown as { sub: string; role: UserRole; fullName: string };
      const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { accountStatus: true } });
      if (!user || user.accountStatus !== AccountStatus.ACTIVE) return res.status(403).json({ message: 'This account has been deactivated. Contact the system administrator.' });
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
  const user = await prisma.user.findFirst({ where: { OR: [{ nationalId: identifier.trim() }, { email: identifier.toLowerCase() }, { personnelNumber: identifier.toUpperCase() }, { phoneNumber: identifier.trim() }] } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
  if (user.accountStatus !== AccountStatus.ACTIVE) return res.status(403).json({ message: 'This account has been deactivated. Contact the system administrator.' });
  const bcrypt = await import('bcryptjs');
  if (!(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid credentials.' });
  const token = jwt.sign({ sub: user.id, role: user.role, fullName: user.fullName }, jwtSecret, { expiresIn: '8h' });
  await audit(undefined, user.id, 'LOGIN', 'User authenticated successfully.');
  res.json({ token, mustChangePassword: user.mustChangePassword, user: { id: user.id, email: user.email, nationalId: user.nationalId, personnelNumber: user.personnelNumber, fullName: user.fullName, rank: user.rank, station: user.station, division: user.division, phoneNumber: user.phoneNumber, role: user.role, createdAt: user.createdAt } });
});

app.post('/api/admin/personnel', requireAuth([UserRole.ADMINISTRATOR]), async (req: AuthenticatedRequest, res) => {
  const { fullName, personnelNumber, email, phoneNumber, rank, role, division, station } = req.body as Record<string, string | undefined>;
  const permittedRoles: UserRole[] = [UserRole.CSC_OFFICER, UserRole.DETECTIVE, UserRole.COMMANDER, UserRole.ADMINISTRATOR];
  if (!fullName?.trim() || !personnelNumber?.trim() || !email?.trim() || !rank?.trim() || !role || !permittedRoles.includes(role as UserRole)) return res.status(400).json({ message: 'Complete valid personnel details before creating the account.' });
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPersonnelNumber = personnelNumber.trim().toUpperCase();
  const existing = await prisma.user.findFirst({ where: { OR: [{ email: normalizedEmail }, { personnelNumber: normalizedPersonnelNumber }] } });
  if (existing) return res.status(409).json({ message: 'An account with this personnel number or email already exists.' });
  const temporaryPassword = `SFEN-${Math.random().toString(36).slice(2, 8).toUpperCase()}!`;
  const bcrypt = await import('bcryptjs');
  const user = await prisma.user.create({ data: { email: normalizedEmail, personnelNumber: normalizedPersonnelNumber, passwordHash: await bcrypt.hash(temporaryPassword, 12), mustChangePassword: true, fullName: fullName.trim(), phoneNumber: phoneNumber?.trim() || undefined, rank: rank.trim(), station: station?.trim() || 'SAPS Berea Police Station', division: division?.trim() || 'Police Station Operations', role: role as UserRole } });
  await audit(undefined, req.user!.id, 'PERSONNEL_ACCOUNT_CREATED', `Created personnel account ${normalizedPersonnelNumber}; temporary password change required on first login.`, { personnelNumber: normalizedPersonnelNumber, role }, normalizedPersonnelNumber, 'USER', user.id);
  res.status(201).json({ temporaryPassword, user: { id: user.id, email: user.email, personnelNumber: user.personnelNumber, fullName: user.fullName, rank: user.rank, station: user.station, division: user.division, phoneNumber: user.phoneNumber, role: user.role, createdAt: user.createdAt } });
});

// The administrator directory is backed by the shared database so accounts
// created by citizens on other devices appear in the administrator portal.
app.get('/api/admin/users', requireAuth([UserRole.ADMINISTRATOR]), async (_req: AuthenticatedRequest, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      personnelNumber: true,
      rank: true,
      station: true,
      division: true,
      role: true,
      accountStatus: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

app.patch('/api/admin/users/:userId/status', requireAuth([UserRole.ADMINISTRATOR]), async (req: AuthenticatedRequest, res) => {
  const { status } = req.body as { status?: AccountStatus };
  if (!status || !Object.values(AccountStatus).includes(status)) return res.status(400).json({ message: 'Choose a valid account status.' });
  if (req.params.userId === req.user!.id && status !== AccountStatus.ACTIVE) return res.status(400).json({ message: 'You cannot deactivate your own administrator account.' });
  const target = await prisma.user.findUnique({ where: { id: req.params.userId } });
  if (!target) return res.status(404).json({ message: 'Account not found.' });
  const updated = await prisma.user.update({ where: { id: target.id }, data: { accountStatus: status } });
  await audit(undefined, req.user!.id, status === AccountStatus.ACTIVE ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED', `${status === AccountStatus.ACTIVE ? 'Activated' : 'Deactivated'} account ${updated.email}.`, { status }, undefined, 'USER', updated.id);
  res.json({ id: updated.id, accountStatus: updated.accountStatus });
});

app.post('/api/auth/set-initial-password', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const { newPassword } = req.body as { newPassword?: string };
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ message: 'Choose a password with at least 8 characters.' });
  const bcrypt = await import('bcryptjs');
  await prisma.user.update({ where: { id: req.user!.id }, data: { passwordHash: await bcrypt.hash(newPassword, 12), mustChangePassword: false } });
  await audit(undefined, req.user!.id, 'INITIAL_PASSWORD_SET', 'Set a permanent password after first-login temporary credentials.', undefined, undefined, 'USER', req.user!.id);
  res.json({ message: 'Permanent password set successfully.' });
});

app.post('/api/auth/change-password', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword || newPassword.length < 8) return res.status(400).json({ message: 'Enter your current password and a new password of at least 8 characters.' });
  if (currentPassword === newPassword) return res.status(400).json({ message: 'Your new password must be different from your current password.' });
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ message: 'Your account could not be found.' });
  const bcrypt = await import('bcryptjs');
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) return res.status(401).json({ message: 'Your current password is incorrect.' });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 12), mustChangePassword: false } });
  await audit(undefined, user.id, 'PASSWORD_CHANGED', 'Changed password from the officer profile.', undefined, undefined, 'USER', user.id);
  res.json({ message: 'Password changed successfully. Your current session remains active.' });
});

app.post('/api/citizens/register', async (req, res) => {
  const { fullName, nationalId, email, phoneNumber, password } = req.body as { fullName?: string; nationalId?: string; email?: string; phoneNumber?: string; password?: string };
  const normalizedNationalId = nationalId?.trim() ?? '';
  const normalizedPhone = phoneNumber?.replace(/\D/g, '') ?? '';
  if (!fullName || !email || !password || password.length < 8 || !/^\d{13}$/.test(normalizedNationalId) || !/^\d{10}$/.test(normalizedPhone)) return res.status(400).json({ message: 'Name, valid 13-digit ID number, 10-digit mobile number, email, and a password of at least 8 characters are required.' });
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findFirst({ where: { OR: [{ email: normalizedEmail }, { nationalId: normalizedNationalId }] } });
  if (existing) return res.status(409).json({ message: 'An account with this email address or ID number already exists. Please sign in.' });
  const bcrypt = await import('bcryptjs');
  const user = await prisma.user.create({ data: { email: normalizedEmail, nationalId: normalizedNationalId, passwordHash: await bcrypt.hash(password, 12), fullName: fullName.trim(), phoneNumber: normalizedPhone, role: UserRole.COMPLAINANT, division: 'Public Portal' } });
  const token = jwt.sign({ sub: user.id, role: user.role, fullName: user.fullName }, jwtSecret, { expiresIn: '8h' });
  await audit(undefined, user.id, 'CITIZEN_ACCOUNT_CREATED', 'Created a public SFEN account.', undefined, undefined, 'USER', user.id);
  res.status(201).json({ token, user: { id: user.id, email: user.email, nationalId: user.nationalId, fullName: user.fullName, phoneNumber: user.phoneNumber, role: user.role, createdAt: user.createdAt } });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body as { email?: string };
  const normalizedEmail = email?.trim().toLowerCase() ?? '';
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return res.status(400).json({ message: 'Enter a valid registered email address.' });
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) return res.status(404).json({ message: 'No SFEN account is registered with that email address.' });
  await audit(undefined, user.id, 'PASSWORD_RESET_REQUESTED', 'Requested a password reset.', undefined, undefined, 'USER', user.id);
  res.json({ message: 'Password-reset instructions will be sent to this registered email address when email delivery is enabled.' });
});

app.post('/api/reports', requireAuth([UserRole.COMPLAINANT]), async (req: AuthenticatedRequest, res) => {
  const { incidentType, incidentDate, incidentTime, address, suburb, city, province, preferredStation, latitude, longitude, description, involvedParties, attachments, requiresImmediateAttention = false } = req.body;
  if (!incidentType || !incidentDate || !address || !suburb || !city || !province || !description) return res.status(400).json({ message: 'Complete incident and location details are required.' });
  const referenceNumber = `SFEN-RPT-${String(Date.now()).slice(-6)}`;
  const report = await prisma.incidentReport.create({ data: { referenceNumber, complainantId: req.user!.id, incidentType, incidentDate: new Date(incidentDate), incidentTime, address, suburb, city, province, preferredStation, latitude: Number.isFinite(latitude) ? latitude : undefined, longitude: Number.isFinite(longitude) ? longitude : undefined, description, involvedParties, attachments, requiresImmediateAttention: Boolean(requiresImmediateAttention) } });
  await audit(undefined, req.user!.id, requiresImmediateAttention ? 'URGENT_INCIDENT_REPORT_SUBMITTED' : 'INCIDENT_REPORT_SUBMITTED', requiresImmediateAttention ? `Submitted urgent online incident report ${referenceNumber}.` : `Submitted online incident report ${referenceNumber}.`, { incidentType, requiresImmediateAttention: Boolean(requiresImmediateAttention) }, referenceNumber, 'INCIDENT_REPORT', report.id);
  res.status(201).json(report);
});

// A walk-in is captured by a CSC officer at the station.  It deliberately creates an
// intake record only; the CAS docket is still registered after identity, statement,
// evidence, and consent checks in the normal case-registration screen.
app.post('/api/walk-in-reports', requireAuth([UserRole.CSC_OFFICER]), async (req: AuthenticatedRequest, res) => {
  const { fullName, phoneNumber, email, nationalId, incidentType, incidentDate, incidentTime, address, suburb, city, province, description } = req.body as Record<string, string | undefined>;
  const normalizedId = nationalId?.replace(/\D/g, '') ?? '';
  const normalizedPhone = phoneNumber?.replace(/\D/g, '') ?? '';
  if (!fullName?.trim() || !normalizedPhone || !incidentType || !incidentDate || !address?.trim() || !suburb?.trim() || !city?.trim() || !province?.trim() || !description?.trim()) {
    return res.status(400).json({ message: 'Capture the walk-in citizen, incident, and location details before continuing.' });
  }
  if (!/^\d{13}$/.test(normalizedId)) return res.status(400).json({ message: 'A valid 13-digit ID number is required for a walk-in intake.' });
  if (!/^\d{10}$/.test(normalizedPhone)) return res.status(400).json({ message: 'The contact number must contain exactly 10 digits.' });

  const existingCitizen = normalizedId ? await prisma.user.findUnique({ where: { nationalId: normalizedId } }) : null;
  if (existingCitizen && existingCitizen.role !== UserRole.COMPLAINANT) return res.status(409).json({ message: 'That ID number belongs to an official account and cannot be used for a citizen intake.' });

  const normalizedEmail = email?.trim().toLowerCase();
  const emailInUse = normalizedEmail ? await prisma.user.findUnique({ where: { email: normalizedEmail } }) : null;
  const bcrypt = await import('bcryptjs');
  const complainant = existingCitizen ?? await prisma.user.create({
    data: {
      email: !emailInUse && normalizedEmail ? normalizedEmail : `walkin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@intake.sfen.local`,
      nationalId: normalizedId,
      passwordHash: await bcrypt.hash(`walk-in-${Date.now()}-${Math.random()}`, 12),
      fullName: fullName.trim(),
      phoneNumber: normalizedPhone,
      role: UserRole.COMPLAINANT,
      station: req.user!.fullName,
      division: 'Station walk-in intake'
    }
  });

  const referenceNumber = `SFEN-RPT-${String(Date.now()).slice(-6)}`;
  const report = await prisma.incidentReport.create({
    data: {
      referenceNumber,
      complainantId: complainant.id,
      incidentType,
      incidentDate: new Date(incidentDate),
      incidentTime,
      address: address.trim(),
      suburb: suburb.trim(),
      city: city.trim(),
      province: province.trim(),
      preferredStation: 'SAPS Berea Police Station',
      description: description.trim(),
      status: ReportStatus.UNDER_STATION_REVIEW,
      stationNotes: 'Walk-in intake opened at the station. Formal statement and verification pending.'
    },
    include: { complainant: { select: { fullName: true, phoneNumber: true, email: true } } }
  });
  await audit(undefined, req.user!.id, 'WALK_IN_INCIDENT_INTAKE_CREATED', `Opened walk-in incident intake ${referenceNumber} for ${complainant.fullName}.`, { incidentType, station: report.preferredStation }, referenceNumber, 'INCIDENT_REPORT', report.id);
  res.status(201).json(report);
});

app.get('/api/reports', requireAuth(), async (req: AuthenticatedRequest, res) => {
  // Keep unregistered online reports for audit history, but archive them after
  // 30 days when the complainant has not attended the station for registration.
  await prisma.incidentReport.updateMany({
    where: { status: { in: [ReportStatus.AWAITING_REVIEW, ReportStatus.UNDER_STATION_REVIEW, ReportStatus.ADDITIONAL_INFO_REQUIRED] }, createdAt: { lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, case: null },
    data: { status: ReportStatus.ARCHIVED, stationNotes: 'Archived automatically after 30 days without in-person attendance and official CAS registration. Retained for audit purposes.' }
  });
  const where = req.user!.role === UserRole.COMPLAINANT ? { complainantId: req.user!.id } : {};
  res.json(await prisma.incidentReport.findMany({
    where,
    include: { complainant: { select: { fullName: true, phoneNumber: true, email: true } }, case: { select: { id: true, caseNumber: true, registeredAt: true, policeStation: true, incidentType: true, status: true, transfers: { where: { status: 'ACKNOWLEDGED_RECEIVED' }, orderBy: { acknowledgedAt: 'desc' }, take: 1, select: { recipientName: true, acknowledgedAt: true } } } } },
    orderBy: { createdAt: 'desc' },
  }));
});

app.get('/api/alerts/urgent-reports', requireAuth([UserRole.CSC_OFFICER]), async (_req: AuthenticatedRequest, res) => {
  const reports = await prisma.incidentReport.findMany({
    where: { requiresImmediateAttention: true, status: { not: 'REGISTERED_TO_CASE' } },
    include: { complainant: { select: { fullName: true, phoneNumber: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  res.json(reports);
});

app.post('/api/reports/:reportId/register-case', requireAuth([UserRole.CSC_OFFICER]), async (req: AuthenticatedRequest, res) => {
  const report = await prisma.incidentReport.findUnique({ where: { id: req.params.reportId } });
  if (!report || report.status === 'REGISTERED_TO_CASE') return res.status(400).json({ message: 'This report cannot be registered.' });
  const { statutoryCode, priorityLevel = 'Standard', policeStation, evidenceIntakeNotes } = req.body;
  const now = new Date();
  const caseNumber = `CAS ${String(now.getTime()).slice(-6)}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const created = await prisma.$transaction(async tx => {
    await tx.incidentReport.update({ where: { id: report.id }, data: { status: 'REGISTERED_TO_CASE' } });
    const caseRecord = await tx.case.create({ data: { caseNumber, reportId: report.id, registeredById: req.user!.id, policeStation: policeStation || report.preferredStation || 'Unassigned station', incidentType: report.incidentType, statutoryCode, priorityLevel, currentCustodianId: req.user!.id, currentCustodianName: req.user!.fullName, currentCustodianRole: 'CSC_OFFICER' } });
    const detective = await tx.user.findFirst({ where: { role: UserRole.DETECTIVE }, orderBy: { createdAt: 'asc' } });
    if (detective) {
      await tx.docketTransfer.create({ data: { caseId: caseRecord.id, previousCustodian: req.user!.fullName, newCustodian: detective.fullName, senderName: req.user!.fullName, senderRole: 'CSC_OFFICER', recipientName: detective.fullName, recipientRole: 'DETECTIVE', reason: 'Official CAS registration completed. Docket submitted to Detective Branch for receipt and investigation.' } });
    }
    await tx.auditEntry.create({ data: { caseId: caseRecord.id, actorId: req.user!.id, action: 'CASE_REGISTERED', description: `Registered official case ${caseNumber} from online report ${report.referenceNumber}.`, referenceNumber: caseNumber, entityType: 'CASE', entityId: caseRecord.id, metadata: { onlineReportReference: report.referenceNumber, evidenceIntakeNotes: typeof evidenceIntakeNotes === 'string' && evidenceIntakeNotes.trim() ? evidenceIntakeNotes.trim() : undefined } } });
    return caseRecord;
  });
  res.status(201).json(created);
});

app.get('/api/cases', requireAuth([UserRole.DETECTIVE]), async (req: AuthenticatedRequest, res) => {
  const cases = await prisma.case.findMany({
    where: { OR: [{ currentCustodianId: req.user!.id }, { transfers: { some: { recipientName: req.user!.fullName, recipientRole: 'DETECTIVE', status: 'AWAITING_ACKNOWLEDGEMENT' } } }] },
    include: { report: { include: { complainant: { select: { fullName: true, phoneNumber: true, email: true, nationalId: true } } } }, registeredBy: { select: { fullName: true, rank: true, personnelNumber: true } }, transfers: { orderBy: { sentAt: 'desc' }, take: 1 } },
    orderBy: { registeredAt: 'desc' }
  });
  res.json(cases);
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
