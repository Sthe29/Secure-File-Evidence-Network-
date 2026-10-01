-- Enforce account activation status for all SFEN identities.
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

ALTER TABLE "User"
ADD COLUMN "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE';
