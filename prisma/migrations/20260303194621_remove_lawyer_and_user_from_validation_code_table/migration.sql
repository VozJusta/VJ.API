/*
  Warnings:

  - You are about to drop the column `lawyer_id` on the `ValidationCode` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `ValidationCode` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ValidationCode" DROP CONSTRAINT "ValidationCode_lawyer_id_fkey";

-- DropForeignKey
ALTER TABLE "ValidationCode" DROP CONSTRAINT "ValidationCode_user_id_fkey";

-- DropIndex
DROP INDEX "ValidationCode_lawyer_id_key";

-- DropIndex
DROP INDEX "ValidationCode_user_id_key";

-- AlterTable
ALTER TABLE "ValidationCode" DROP COLUMN "lawyer_id",
DROP COLUMN "user_id";
