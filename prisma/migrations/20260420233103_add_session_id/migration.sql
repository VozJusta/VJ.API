/*
  Warnings:

  - You are about to drop the `TwoFactorToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripe_subscription_id]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - The required column `session_id` was added to the `Citizen` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `session_id` was added to the `Lawyer` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- DropForeignKey
ALTER TABLE "TwoFactorToken" DROP CONSTRAINT "TwoFactorToken_lawyer_id_fkey";

-- DropForeignKey
ALTER TABLE "TwoFactorToken" DROP CONSTRAINT "TwoFactorToken_user_id_fkey";

-- AlterTable
ALTER TABLE "Citizen" ADD COLUMN     "session_id" TEXT;

UPDATE "Citizen"
SET "session_id" = gen_random_uuid()::text
WHERE "session_id" IS NULL;

ALTER TABLE "Citizen"
ALTER COLUMN "session_id" SET DEFAULT gen_random_uuid()::text,
ALTER COLUMN "session_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "Lawyer" ADD COLUMN     "session_id" TEXT;

UPDATE "Lawyer"
SET "session_id" = gen_random_uuid()::text
WHERE "session_id" IS NULL;

ALTER TABLE "Lawyer"
ALTER COLUMN "session_id" SET DEFAULT gen_random_uuid()::text,
ALTER COLUMN "session_id" SET NOT NULL;

-- DropTable
DROP TABLE "TwoFactorToken";

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripe_subscription_id_key" ON "Subscription"("stripe_subscription_id");
