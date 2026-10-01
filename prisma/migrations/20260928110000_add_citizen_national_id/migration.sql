-- Citizen accounts use their South African ID number as the public sign-in identifier.
ALTER TABLE "User" ADD COLUMN "nationalId" TEXT;

CREATE UNIQUE INDEX "User_nationalId_key" ON "User"("nationalId");
