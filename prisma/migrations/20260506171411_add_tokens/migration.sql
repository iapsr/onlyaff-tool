-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Usage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Usage" ("count", "createdAt", "date", "email", "id", "updatedAt") SELECT "count", "createdAt", "date", "email", "id", "updatedAt" FROM "Usage";
DROP TABLE "Usage";
ALTER TABLE "new_Usage" RENAME TO "Usage";
CREATE UNIQUE INDEX "Usage_email_date_key" ON "Usage"("email", "date");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
