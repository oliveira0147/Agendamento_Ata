/*
  Warnings:

  - Added the required column `roomName` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "duration" REAL NOT NULL,
    "roomId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "endTime" DATETIME NOT NULL,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Meeting" ("createdAt", "date", "duration", "endTime", "id", "location", "roomId", "startTime", "title", "updatedAt") SELECT "createdAt", "date", "duration", "endTime", "id", "location", "roomId", "startTime", "title", "updatedAt" FROM "Meeting";
DROP TABLE "Meeting";
ALTER TABLE "new_Meeting" RENAME TO "Meeting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
