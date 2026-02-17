/*
  Warnings:

  - Changed the type of `oab_state` on the `Lawyer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OabState" AS ENUM ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO');

-- AlterTable
ALTER TABLE "Lawyer" ALTER COLUMN "rating" DROP NOT NULL,
DROP COLUMN "oab_state",
ADD COLUMN     "oab_state" "OabState" NOT NULL;
