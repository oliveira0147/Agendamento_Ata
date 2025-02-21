-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN "isRecurring" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Meeting" ADD COLUMN "recurrenceId" TEXT;
ALTER TABLE "Meeting" ADD COLUMN "recurrenceType" TEXT;
ALTER TABLE "Meeting" ADD COLUMN "recurrenceEndDate" DATETIME; 