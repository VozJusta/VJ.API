-- AlterTable
ALTER TABLE "SimulationReport" ADD COLUMN "delivered_at" TIMESTAMP(3);

-- Backfill: marca todos os reports existentes como entregues
-- para não reenviar histórico na próxima reconexão
UPDATE "SimulationReport"
SET "delivered_at" = CURRENT_TIMESTAMP
WHERE "delivered_at" IS NULL;