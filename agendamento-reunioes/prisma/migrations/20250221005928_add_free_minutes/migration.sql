/*
  Warnings:

  - You are about to drop the `_MeetingToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "_MeetingToUser_B_index";

-- DropIndex
DROP INDEX "_MeetingToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_MeetingToUser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_MeetingParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_MeetingParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "Meeting" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MeetingParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_MinutesViewers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_MinutesViewers_A_fkey" FOREIGN KEY ("A") REFERENCES "Meeting" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MinutesViewers_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" DATETIME NOT NULL,
    "duration" REAL NOT NULL,
    "roomId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceId" TEXT,
    "recurrenceType" TEXT,
    "recurrenceEndDate" DATETIME,
    "isFreeMinutes" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Meeting" ("createdAt", "date", "duration", "endTime", "id", "isRecurring", "location", "recurrenceEndDate", "recurrenceId", "recurrenceType", "roomId", "roomName", "startTime", "title", "updatedAt") SELECT "createdAt", "date", "duration", "endTime", "id", "isRecurring", "location", "recurrenceEndDate", "recurrenceId", "recurrenceType", "roomId", "roomName", "startTime", "title", "updatedAt" FROM "Meeting";
DROP TABLE "Meeting";
ALTER TABLE "new_Meeting" RENAME TO "Meeting";
CREATE TABLE "new_Minutes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "content" TEXT,
    "location" TEXT NOT NULL,
    "participants" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "agenda" TEXT NOT NULL,
    "discussions" TEXT NOT NULL,
    "decisions" TEXT NOT NULL,
    "actions" TEXT NOT NULL,
    "nextSteps" TEXT NOT NULL,
    "observations" TEXT,
    "secretary" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Minutes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Minutes" ("actions", "agenda", "content", "createdAt", "decisions", "discussions", "id", "location", "meetingId", "nextSteps", "objective", "observations", "participants", "secretary", "updatedAt") SELECT "actions", "agenda", "content", "createdAt", "decisions", "discussions", "id", "location", "meetingId", "nextSteps", "objective", "observations", "participants", "secretary", "updatedAt" FROM "Minutes";
DROP TABLE "Minutes";
ALTER TABLE "new_Minutes" RENAME TO "Minutes";
CREATE UNIQUE INDEX "Minutes_meetingId_key" ON "Minutes"("meetingId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_MeetingParticipants_AB_unique" ON "_MeetingParticipants"("A", "B");

-- CreateIndex
CREATE INDEX "_MeetingParticipants_B_index" ON "_MeetingParticipants"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MinutesViewers_AB_unique" ON "_MinutesViewers"("A", "B");

-- CreateIndex
CREATE INDEX "_MinutesViewers_B_index" ON "_MinutesViewers"("B");
