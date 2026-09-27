-- AlterTable
ALTER TABLE "AuditEntry" ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "entityType" TEXT,
ADD COLUMN     "referenceNumber" TEXT;

-- CreateIndex
CREATE INDEX "AuditEntry_caseId_createdAt_idx" ON "AuditEntry"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEntry_referenceNumber_createdAt_idx" ON "AuditEntry"("referenceNumber", "createdAt");
