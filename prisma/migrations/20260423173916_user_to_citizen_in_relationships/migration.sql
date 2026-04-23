/*
  Warnings:

  - You are about to drop the column `user_id` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `reportId` on the `Simulation` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Simulation` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `SimulationReport` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `ValidationCode` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[citizen_id]` on the table `SimulationReport` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[citizen_id]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `citizen_id` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `citizen_id` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `citizen_id` to the `Simulation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `citizen_id` to the `SimulationReport` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Simulation" DROP CONSTRAINT "Simulation_reportId_fkey";

-- DropForeignKey
ALTER TABLE "Simulation" DROP CONSTRAINT "Simulation_user_id_fkey";

-- DropForeignKey
ALTER TABLE "SimulationReport" DROP CONSTRAINT "SimulationReport_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ValidationCode" DROP CONSTRAINT "ValidationCode_user_id_fkey";

-- DropIndex
DROP INDEX "SimulationReport_user_id_key";

-- DropIndex
DROP INDEX "Subscription_user_id_key";

-- AlterTable
ALTER TABLE "Case" RENAME COLUMN "user_id" TO "citizen_id";

-- AlterTable
ALTER TABLE "Report" RENAME COLUMN "user_id" TO "citizen_id";

-- AlterTable
ALTER TABLE "Simulation" RENAME COLUMN "reportId" TO "report_id";
ALTER TABLE "Simulation" RENAME COLUMN "user_id" TO "citizen_id";

-- AlterTable
ALTER TABLE "SimulationReport" RENAME COLUMN "user_id" TO "citizen_id";

-- AlterTable
ALTER TABLE "Subscription" RENAME COLUMN "user_id" TO "citizen_id";

-- AlterTable
ALTER TABLE "ValidationCode" RENAME COLUMN "user_id" TO "citizen_id";

-- CreateIndex
CREATE UNIQUE INDEX "SimulationReport_citizen_id_key" ON "SimulationReport"("citizen_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_citizen_id_key" ON "Subscription"("citizen_id");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "Citizen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "Citizen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "Citizen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationCode" ADD CONSTRAINT "ValidationCode_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "Citizen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "Citizen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationReport" ADD CONSTRAINT "SimulationReport_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "Citizen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
