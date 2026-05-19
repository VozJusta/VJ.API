-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN     "citizenId" TEXT;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen"("id") ON DELETE SET NULL ON UPDATE CASCADE;
