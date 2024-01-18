-- AlterTable
ALTER TABLE "Channel" ALTER COLUMN "lastSeen" SET DEFAULT ARRAY[]::TEXT[];
