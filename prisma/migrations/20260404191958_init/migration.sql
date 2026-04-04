-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuditLogs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AuditLogs" ("action", "entity", "entityId", "id", "timestamp", "userId") SELECT "action", "entity", "entityId", "id", "timestamp", "userId" FROM "AuditLogs";
DROP TABLE "AuditLogs";
ALTER TABLE "new_AuditLogs" RENAME TO "AuditLogs";
CREATE INDEX "AuditLogs_userId_idx" ON "AuditLogs"("userId");
CREATE INDEX "AuditLogs_timestamp_idx" ON "AuditLogs"("timestamp");
CREATE INDEX "AuditLogs_action_idx" ON "AuditLogs"("action");
CREATE INDEX "AuditLogs_entity_idx" ON "AuditLogs"("entity");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
