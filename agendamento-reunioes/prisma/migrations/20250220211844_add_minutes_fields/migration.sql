/*
  Warnings:

  - Added the required column `actions` to the `Minutes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agenda` to the `Minutes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `decisions` to the `Minutes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discussions` to the `Minutes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Minutes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nextSteps` to the `Minutes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objective` to the `Minutes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `participants` to the `Minutes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secretary` to the `Minutes` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Minutes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
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
INSERT INTO "new_Minutes" ("content", "createdAt", "id", "meetingId", "updatedAt") SELECT "content", "createdAt", "id", "meetingId", "updatedAt" FROM "Minutes";
DROP TABLE "Minutes";
ALTER TABLE "new_Minutes" RENAME TO "Minutes";
CREATE UNIQUE INDEX "Minutes_meetingId_key" ON "Minutes"("meetingId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
