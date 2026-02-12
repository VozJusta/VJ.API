/*
  Warnings:

  - You are about to drop the `Laywer` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cnpj]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_lawyer_id_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_lawyer_id_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_user_id_fkey";

-- DropForeignKey
ALTER TABLE "TwoFactorToken" DROP CONSTRAINT "TwoFactorToken_lawyer_id_fkey";

-- DropForeignKey
ALTER TABLE "ValidationCode" DROP CONSTRAINT "ValidationCode_lawyer_id_fkey";

-- DropIndex
DROP INDEX "Evidence_report_id_key";

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "lawyer_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "lawyer_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cnpj" TEXT,
ALTER COLUMN "stripe_customer_id" DROP NOT NULL;

-- DropTable
DROP TABLE "Laywer";

-- CreateTable
CREATE TABLE "Lawyer" (
    "id" TEXT NOT NULL,
    "stripe_customer_id" TEXT,
    "full_name" TEXT NOT NULL,
    "bio" TEXT,
    "cpf" TEXT NOT NULL,
    "avatar_image" TEXT,
    "rating" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "specialization" "Specialization" NOT NULL,
    "lawyer_status" "LawyerStatus" NOT NULL,
    "oab_number" TEXT NOT NULL,
    "oab_state" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lawyer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer_stripe_customer_id_key" ON "Lawyer"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer_cpf_key" ON "Lawyer"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer_phone_key" ON "Lawyer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer_email_key" ON "Lawyer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "User_cnpj_key" ON "User"("cnpj");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Lawyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Lawyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationCode" ADD CONSTRAINT "ValidationCode_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Lawyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFactorToken" ADD CONSTRAINT "TwoFactorToken_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Lawyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
