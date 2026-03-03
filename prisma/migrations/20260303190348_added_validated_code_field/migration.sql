-- AlterTable
ALTER TABLE "User" ALTER COLUMN "cpf" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ValidationCode" ADD COLUMN     "validated" BOOLEAN NOT NULL DEFAULT false;
