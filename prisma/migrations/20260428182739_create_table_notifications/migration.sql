-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('System', 'CaseUpdate', 'ReportReady', 'Billing', 'Chat');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "citizen_id" TEXT,
    "lawyer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_citizen_id_created_at_idx" ON "Notification"("citizen_id", "created_at");

-- CreateIndex
CREATE INDEX "Notification_lawyer_id_created_at_idx" ON "Notification"("lawyer_id", "created_at");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "Citizen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Lawyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
