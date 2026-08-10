-- Phase 1: Multi-role architecture migration
-- Maps donor/seeker to individual, adds ngo role, renames seekerId to requesterId

-- 1. Add new enum values (PostgreSQL requires adding before removing)
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'individual';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ngo';
ALTER TYPE "RequestType" ADD VALUE IF NOT EXISTS 'NGO';

-- 2. Migrate existing data: donor -> individual, seeker -> individual
UPDATE "users" SET "role" = 'individual' WHERE "role" IN ('donor', 'seeker');

-- 3. Drop old enum values (PostgreSQL doesn't support DROP VALUE directly)
-- We need to recreate the enum
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE text;

-- Create new clean enum
DROP TYPE "Role" CASCADE;
CREATE TYPE "Role" AS ENUM ('individual', 'hospital', 'blood_bank', 'ngo', 'admin');

ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role" USING "role"::"Role";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'individual';

-- 4. Rename seekerId to requesterId in blood_requests
ALTER TABLE "blood_requests" RENAME COLUMN "seekerId" TO "requesterId";

-- 5. Update the foreign key constraint
ALTER TABLE "blood_requests" DROP CONSTRAINT IF EXISTS "blood_requests_seekerId_fkey";
ALTER TABLE "blood_requests" ADD CONSTRAINT "blood_requests_requesterId_fkey"
  FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
