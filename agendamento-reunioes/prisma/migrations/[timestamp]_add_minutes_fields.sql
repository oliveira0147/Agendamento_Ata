-- Criar uma nova tabela com a estrutura completa
CREATE TABLE "new_Minutes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'Não especificado',
    "participants" TEXT NOT NULL DEFAULT 'Não especificado',
    "objective" TEXT NOT NULL DEFAULT 'Não especificado',
    "agenda" TEXT NOT NULL DEFAULT 'Não especificado',
    "discussions" TEXT NOT NULL DEFAULT 'Não especificado',
    "decisions" TEXT NOT NULL DEFAULT 'Não especificado',
    "actions" TEXT NOT NULL DEFAULT 'Não especificado',
    "nextSteps" TEXT NOT NULL DEFAULT 'Não especificado',
    "observations" TEXT,
    "secretary" TEXT NOT NULL DEFAULT 'Não especificado',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Minutes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Copiar dados existentes para a nova tabela
INSERT INTO "new_Minutes" ("id", "meetingId", "content", "createdAt", "updatedAt")
SELECT "id", "meetingId", "content", "createdAt", "updatedAt"
FROM "Minutes";

-- Remover a tabela antiga
DROP TABLE "Minutes";

-- Renomear a nova tabela
ALTER TABLE "new_Minutes" RENAME TO "Minutes";

-- Recriar o índice único
CREATE UNIQUE INDEX "Minutes_meetingId_key" ON "Minutes"("meetingId"); 