-- AlterTable
ALTER TABLE "SimulationReport" ADD COLUMN IF NOT EXISTS "delivered_at" TIMESTAMP(3);

-- AlterTable  
ALTER TABLE "SimulationTurn" ADD COLUMN IF NOT EXISTS "delivered_at" TIMESTAMP(3);

-- Backfill: marca histórico como entregue para não reenviar
UPDATE "SimulationReport"
SET "delivered_at" = CURRENT_TIMESTAMP
WHERE "delivered_at" IS NULL;
