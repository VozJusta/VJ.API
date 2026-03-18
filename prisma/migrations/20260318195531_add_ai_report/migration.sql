/*
  Warnings:

  - Added the required column `normalized_text` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Report_user_id_key";

-- DropIndex
DROP INDEX "Simulation_user_id_key";

-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN     "embedding" JSONB;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "confidence_score" DOUBLE PRECISION,
ADD COLUMN     "normalized_text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Simulation" ADD COLUMN     "reportId" TEXT,
ADD COLUMN     "report_id" TEXT;

-- CreateTable
CREATE TABLE "AiResponse" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "tokens_used" INTEGER,
    "latency_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RagContext" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RagContext_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiResponse" ADD CONSTRAINT "AiResponse_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RagContext" ADD CONSTRAINT "RagContext_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;
