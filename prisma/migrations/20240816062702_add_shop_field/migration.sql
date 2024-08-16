-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DisableDate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "shop" TEXT NOT NULL DEFAULT '',
    "date" DATETIME NOT NULL DEFAULT (date('now')),
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_DisableDate" ("createdAt", "date", "id", "title") SELECT "createdAt", "date", "id", "title" FROM "DisableDate";
DROP TABLE "DisableDate";
ALTER TABLE "new_DisableDate" RENAME TO "DisableDate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
