-- AlterTable
ALTER TABLE "ValidationCode" ADD COLUMN     "lawyer_id" TEXT,
ADD COLUMN     "user_id" TEXT;

-- DropEnum
DROP TYPE "AccountType";

-- AddForeignKey
ALTER TABLE "ValidationCode" ADD CONSTRAINT "ValidationCode_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationCode" ADD CONSTRAINT "ValidationCode_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Lawyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
