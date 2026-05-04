/*
  Warnings:

  - A unique constraint covering the columns `[cnpj]` on the table `Lawyer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Lawyer" ADD COLUMN     "cnpj" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer_cnpj_key" ON "Lawyer"("cnpj");
