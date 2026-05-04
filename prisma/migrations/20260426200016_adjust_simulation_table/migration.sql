-- AlterTable
ALTER TABLE "Simulation" ALTER COLUMN "transcription" DROP NOT NULL,
ALTER COLUMN "score_feedback" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;
