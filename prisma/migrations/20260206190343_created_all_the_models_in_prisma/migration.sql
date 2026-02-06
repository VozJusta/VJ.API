-- CreateEnum
CREATE TYPE "Specialization" AS ENUM ('Administrative', 'Customs', 'Legal_support', 'Aviation', 'Agrarian', 'Environmental', 'Arbitration', 'Copyright', 'Banking_and_financial', 'Biotechnology', 'Civil', 'Commercial', 'International_trade', 'Competition', 'Constitutional', 'Consumer', 'Commercial_contracts', 'Sports', 'Water', 'Third_sector', 'Economic', 'Electoral', 'Corporate_criminal', 'Energy', 'Bankruptcy', 'Family', 'Mergers', 'Real_estate', 'Import_and_export', 'Infrastructure', 'International', 'Internet_and_ECommerce', 'Maritime', 'Capital_markets', 'Mining', 'Financial_operations', 'Criminal', 'Oil_and_gas', 'Social_security', 'Project_finance', 'Intellectual_property', 'Corporate_restructuring', 'Regulatory', 'Health_and_sanitary', 'Insurance', 'Labor_union', 'Corporate', 'Telecommunications', 'Labor_and_employment', 'Tax');

-- CreateEnum
CREATE TYPE "LawyerStatus" AS ENUM ('Pending', 'Verified', 'Suspended', 'Rejected');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('Citizen', 'Lawyer');

-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('Monthly', 'One_Time');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'past_due', 'canceled', 'unpaid', 'inactive');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Accepted', 'Refused', 'Pending');

-- CreateEnum
CREATE TYPE "Types" AS ENUM ('Email', 'SMS');

-- CreateEnum
CREATE TYPE "Personality" AS ENUM ('Calm', 'Agressive', 'Impartial', 'Empathetic', 'Pragmatic', 'Researcher');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laywer" (
    "id" TEXT NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "avatar_image" TEXT NOT NULL,
    "rating" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "specialization" "Specialization" NOT NULL,
    "lawyer_status" "LawyerStatus" NOT NULL,
    "oab_number" TEXT NOT NULL,
    "oab_state" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Laywer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stripe_price_id" TEXT NOT NULL,
    "type" "PlanType" NOT NULL,
    "billing_type" "BillingType" NOT NULL,
    "max_interviews" INTEGER NOT NULL,
    "max_simulation" INTEGER NOT NULL,
    "has_ia_petitions" BOOLEAN NOT NULL DEFAULT false,
    "has_analytics" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lawyer_id" TEXT NOT NULL,
    "stripe_subscription_id" TEXT NOT NULL,
    "subscription_status" "SubscriptionStatus" NOT NULL,
    "interviews_used" INTEGER NOT NULL DEFAULT 0,
    "simulations_used" INTEGER NOT NULL DEFAULT 0,
    "leads_used" INTEGER NOT NULL DEFAULT 0,
    "current_period_start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_period_end" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "transcription" TEXT NOT NULL,
    "legal_analysis" TEXT NOT NULL,
    "simplified_explanation" TEXT NOT NULL,
    "category_detected" "Specialization" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Pending',
    "user_id" TEXT NOT NULL,
    "lawyer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidationCode" (
    "id" TEXT NOT NULL,
    "type" "Types" NOT NULL,
    "user_id" TEXT NOT NULL,
    "lawyer_id" TEXT NOT NULL,
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ValidationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwoFactorToken" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "Types" NOT NULL,
    "user_id" TEXT NOT NULL,
    "lawyer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwoFactorToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "personality" "Personality" NOT NULL,
    "transcription" TEXT NOT NULL,
    "score_feedback" TEXT NOT NULL,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationReport" (
    "id" TEXT NOT NULL,
    "transcription" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "SimulationReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "ocr_content" TEXT NOT NULL,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_stripe_customer_id_key" ON "User"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Laywer_stripe_customer_id_key" ON "Laywer"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Laywer_phone_key" ON "Laywer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Laywer_email_key" ON "Laywer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripe_price_id_key" ON "Plan"("stripe_price_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_user_id_key" ON "Subscription"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_lawyer_id_key" ON "Subscription"("lawyer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Report_user_id_key" ON "Report"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Report_lawyer_id_key" ON "Report"("lawyer_id");

-- CreateIndex
CREATE UNIQUE INDEX "ValidationCode_user_id_key" ON "ValidationCode"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ValidationCode_lawyer_id_key" ON "ValidationCode"("lawyer_id");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorToken_user_id_key" ON "TwoFactorToken"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorToken_lawyer_id_key" ON "TwoFactorToken"("lawyer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Simulation_user_id_key" ON "Simulation"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "SimulationReport_user_id_key" ON "SimulationReport"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Evidence_report_id_key" ON "Evidence"("report_id");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Laywer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Laywer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationCode" ADD CONSTRAINT "ValidationCode_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationCode" ADD CONSTRAINT "ValidationCode_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Laywer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFactorToken" ADD CONSTRAINT "TwoFactorToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFactorToken" ADD CONSTRAINT "TwoFactorToken_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "Laywer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationReport" ADD CONSTRAINT "SimulationReport_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
