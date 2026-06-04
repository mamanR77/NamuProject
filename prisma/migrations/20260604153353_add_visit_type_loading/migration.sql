-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitorId" TEXT NOT NULL,
    "hostId" TEXT,
    "visitType" TEXT NOT NULL DEFAULT 'GENERAL',
    "loadingType" TEXT,
    "vehiclePlate" TEXT,
    "docNumber" TEXT,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "qrToken" TEXT NOT NULL,
    "approvedAt" DATETIME,
    "rejectedAt" DATETIME,
    "checkInAt" DATETIME,
    "checkOutAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Visit_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Visit_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Visit" ("approvedAt", "checkInAt", "checkOutAt", "createdAt", "hostId", "id", "purpose", "qrToken", "rejectedAt", "status", "updatedAt", "visitorId") SELECT "approvedAt", "checkInAt", "checkOutAt", "createdAt", "hostId", "id", "purpose", "qrToken", "rejectedAt", "status", "updatedAt", "visitorId" FROM "Visit";
DROP TABLE "Visit";
ALTER TABLE "new_Visit" RENAME TO "Visit";
CREATE UNIQUE INDEX "Visit_qrToken_key" ON "Visit"("qrToken");
CREATE INDEX "Visit_status_idx" ON "Visit"("status");
CREATE INDEX "Visit_hostId_idx" ON "Visit"("hostId");
CREATE INDEX "Visit_visitType_idx" ON "Visit"("visitType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
