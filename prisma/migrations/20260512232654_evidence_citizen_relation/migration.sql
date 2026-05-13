ALTER TABLE "Evidence" ADD COLUMN "citizenId" TEXT;

ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_citizenId_fkey"
  FOREIGN KEY ("citizenId") REFERENCES "Citizen"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;