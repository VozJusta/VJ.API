/*
  Warnings:

  - You are about to drop the column `delivered_at` on the `SimulationReport` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AiResponse" DROP CONSTRAINT "AiResponse_report_id_fkey";

-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_citizen_id_fkey";

-- DropForeignKey
ALTER TABLE "CaseRequest" DROP CONSTRAINT "CaseRequest_case_id_fkey";

-- DropForeignKey
ALTER TABLE "CaseRequest" DROP CONSTRAINT "CaseRequest_citizen_id_fkey";

-- DropForeignKey
ALTER TABLE "CaseRequest" DROP CONSTRAINT "CaseRequest_lawyer_id_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_case_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_citizen_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_lawyer_id_fkey";

-- DropForeignKey
ALTER TABLE "RagContext" DROP CONSTRAINT "RagContext_report_id_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_caseId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_citizen_id_fkey";

-- DropForeignKey
ALTER TABLE "Simulation" DROP CONSTRAINT "Simulation_citizen_id_fkey";

-- DropForeignKey
ALTER TABLE "SimulationReport" DROP CONSTRAINT "SimulationReport_simulation_id_fkey";

-- DropForeignKey
ALTER TABLE "SimulationReport" DROP CONSTRAINT "SimulationReport_user_id_fkey";

-- DropForeignKey
ALTER TABLE "SimulationTurn" DROP CONSTRAINT "SimulationTurn_simulation_id_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_citizen_id_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_lawyer_id_fkey";

-- DropForeignKey
ALTER TABLE "ValidationCode" DROP CONSTRAINT "ValidationCode_citizen_id_fkey";

-- DropForeignKey
ALTER TABLE "ValidationCode" DROP CONSTRAINT "ValidationCode_lawyer_id_fkey";

-- AlterTable
ALTER TABLE "SimulationReport" DROP COLUMN "delivered_at";

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "Citizen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "Citizen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "Citizen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseRequest" ADD CONSTRAINT "CaseRequest_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseRequest" ADD CONSTRAINT "CaseRequest_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "Citizen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseRequest" ADD CONSTRAINT "CaseRequest_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiResponse" ADD CONSTRAINT "AiResponse_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RagContext" ADD CONSTRAINT "RagContext_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationCode" ADD CONSTRAINT "ValidationCode_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "Citizen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationCode" ADD CONSTRAINT "ValidationCode_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "Citizen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationTurn" ADD CONSTRAINT "SimulationTurn_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationReport" ADD CONSTRAINT "SimulationReport_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationReport" ADD CONSTRAINT "SimulationReport_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Citizen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "Citizen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
