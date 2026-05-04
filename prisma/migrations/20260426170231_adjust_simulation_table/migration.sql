/*
  Warnings:

  - You are about to drop the column `citizen_id` on the `SimulationReport` table. All the data in the column will be lost.
  - You are about to drop the column `transcription` on the `SimulationReport` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[simulation_id]` on the table `SimulationReport` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `full_transcript` to the `SimulationReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personality` to the `SimulationReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `simulation_id` to the `SimulationReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `SimulationReport` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SimulationReport" DROP CONSTRAINT "SimulationReport_citizen_id_fkey";

-- DropIndex
DROP INDEX "SimulationReport_citizen_id_key";

-- AlterTable
ALTER TABLE "Simulation" ADD COLUMN     "duration_secs" INTEGER,
ADD COLUMN     "ended_at" TIMESTAMP(3),
ADD COLUMN     "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "SimStatus" NOT NULL DEFAULT 'Waiting';

-- AlterTable
ALTER TABLE "SimulationReport" DROP COLUMN "citizen_id",
DROP COLUMN "transcription",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duration_secs" INTEGER,
ADD COLUMN     "full_transcript" JSONB NOT NULL,
ADD COLUMN     "metrics_json" JSONB,
ADD COLUMN     "personality" "Personality" NOT NULL,
ADD COLUMN     "score" INTEGER,
ADD COLUMN     "simulation_id" TEXT NOT NULL,
ADD COLUMN     "strengths" TEXT[],
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "weaknesses" TEXT[];

-- CreateTable
CREATE TABLE "SimulationTurn" (
    "id" TEXT NOT NULL,
    "simulation_id" TEXT NOT NULL,
    "role" "TurnRole" NOT NULL,
    "content" TEXT NOT NULL,
    "audio_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimulationTurn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SimulationReport_simulation_id_key" ON "SimulationReport"("simulation_id");

-- AddForeignKey
ALTER TABLE "SimulationTurn" ADD CONSTRAINT "SimulationTurn_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationReport" ADD CONSTRAINT "SimulationReport_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationReport" ADD CONSTRAINT "SimulationReport_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Citizen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
