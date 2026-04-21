import { Module } from '@nestjs/common';
import { AuthModule } from '@m/auth/module/auth.module';
import { PrismaModule } from '@m/prisma/prisma.module';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { OperationalStatusService } from '@m/dashboard/service/lawyer/operetionalStatus.service';
import { HighRelevanceService } from '@m/dashboard/service/lawyer/highRelevance.service';
import { AcceptedRequestAnalyticsService } from '@m/dashboard/service/lawyer/acceptedRequestAnalytics.service';
import { GetOperationStatusController } from '@m/dashboard/controllers/lawyer/getOperationalStatus.controller';
import { GetReportsAcceptedLawyerController } from '@m/dashboard/controllers/lawyer/getReportsAcceptedLawyer.controller';
import { GetHighRelevanceController } from '@m/dashboard/controllers/lawyer/getHighRelevance.controller';
import { GetAllReportsCitizenController } from '@m/dashboard/controllers/citizen/getAllReportsCitizen.controller';
import { GetOneReportsCitizenController } from '@m/dashboard/controllers/citizen/getOneReportsCitizen.controller';
import { FindCitizenReportByIdService } from '@m/dashboard/service/citizen/findCitizenReportById.service';
import { ListReportsByCitizenService } from '@m/dashboard/service/citizen/listReportsByCitizen.service';


@Module({
  imports: [AuthModule, PrismaModule],
  providers: [
    OperationalStatusService,
    HighRelevanceService,
    AcceptedRequestAnalyticsService,
    FindCitizenReportByIdService,
    ListReportsByCitizenService,
    AuthTokenGuard
  ],
  controllers: [
    GetOperationStatusController,
    GetReportsAcceptedLawyerController,
    GetAllReportsCitizenController,
    GetHighRelevanceController,
    GetOneReportsCitizenController,
  ],
})
export class DashboardModule {}
