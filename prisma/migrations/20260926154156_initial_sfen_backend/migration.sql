-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('COMPLAINANT', 'CSC_OFFICER', 'DETECTIVE', 'COMMANDER', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('AWAITING_REVIEW', 'UNDER_STATION_REVIEW', 'ADDITIONAL_INFO_REQUIRED', 'REGISTERED_TO_CASE');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('REGISTERED', 'INVESTIGATION_ACTIVE', 'EVIDENCE_ANALYSIS', 'AT_NPA_OR_COURT', 'FINALIZED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('AWAITING_ACKNOWLEDGEMENT', 'ACKNOWLEDGED_RECEIVED');

-- CreateEnum
CREATE TYPE "DiaryEntryType" AS ENUM ('INVESTIGATION_NOTE', 'EVIDENCE_CATALOGUED', 'WITNESS_INTERVIEW', 'COURT_UPDATE', 'COMPLAINANT_UPDATE', 'DIRECTIVE');

-- CreateEnum
CREATE TYPE "ReviewOutcome" AS ENUM ('INVESTIGATION_SATISFACTORY', 'FURTHER_DIRECTIVES_ISSUED', 'READY_FOR_NPA_OR_COURT', 'DOCKET_CLOSURE_RECOMMENDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "personnelNumber" TEXT,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "rank" TEXT,
    "station" TEXT,
    "division" TEXT,
    "phoneNumber" TEXT,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentReport" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "complainantId" TEXT NOT NULL,
    "incidentType" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "incidentTime" TEXT,
    "address" TEXT NOT NULL,
    "suburb" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "preferredStation" TEXT,
    "description" TEXT NOT NULL,
    "involvedParties" JSONB,
    "attachments" JSONB,
    "status" "ReportStatus" NOT NULL DEFAULT 'AWAITING_REVIEW',
    "stationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "registeredById" TEXT NOT NULL,
    "policeStation" TEXT NOT NULL,
    "incidentType" TEXT NOT NULL,
    "statutoryCode" TEXT,
    "priorityLevel" TEXT NOT NULL DEFAULT 'Standard',
    "status" "CaseStatus" NOT NULL DEFAULT 'REGISTERED',
    "currentCustodianId" TEXT,
    "currentCustodianName" TEXT NOT NULL,
    "currentCustodianRole" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocketTransfer" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "previousCustodian" TEXT NOT NULL,
    "newCustodian" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientRole" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TransferStatus" NOT NULL DEFAULT 'AWAITING_ACKNOWLEDGEMENT',
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgementNotes" TEXT,

    CONSTRAINT "DocketTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestigationDiaryEntry" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "entryType" "DiaryEntryType" NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "nextAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestigationDiaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupervisoryReview" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "commanderName" TEXT NOT NULL,
    "reviewNotes" TEXT NOT NULL,
    "furtherAction" TEXT,
    "nextReviewDate" TIMESTAMP(3),
    "outcome" "ReviewOutcome" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupervisoryReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEntry" (
    "id" TEXT NOT NULL,
    "caseId" TEXT,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_personnelNumber_key" ON "User"("personnelNumber");

-- CreateIndex
CREATE UNIQUE INDEX "IncidentReport_referenceNumber_key" ON "IncidentReport"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseNumber_key" ON "Case"("caseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Case_reportId_key" ON "Case"("reportId");

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_complainantId_fkey" FOREIGN KEY ("complainantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "IncidentReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocketTransfer" ADD CONSTRAINT "DocketTransfer_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationDiaryEntry" ADD CONSTRAINT "InvestigationDiaryEntry_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupervisoryReview" ADD CONSTRAINT "SupervisoryReview_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEntry" ADD CONSTRAINT "AuditEntry_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEntry" ADD CONSTRAINT "AuditEntry_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
