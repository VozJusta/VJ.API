/*
  Warnings:

  - You are about to drop the column `report_id` on the `Evidence` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Evidence" DROP CONSTRAINT "Evidence_report_id_fkey";

-- AlterTable
ALTER TABLE "Evidence" DROP COLUMN "report_id";
