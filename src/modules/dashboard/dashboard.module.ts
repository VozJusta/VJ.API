import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/module/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthTokenGuard } from '../auth/guard/access-token.guard';
import { OperationalStatusService } from './service/lawyer/operetionalStatus.service';
import { HighRelevanceService } from './service/lawyer/highRelevance.service';
import { AcceptedRequestAnalyticsService } from './service/lawyer/acceptedRequestAnalytics.service';
import { GetOperationStatusController } from './controllers/lawyer/getOperationalStatus.controller';
import { GetReportsAcceptedLawyerController } from './controllers/lawyer/getReportsAcceptedLawyer.controller';
import { GetHighRelevanceController } from './controllers/lawyer/getHighRelevance.controller';
import { GetAllReportsCitizenController } from './controllers/citizen/getAllReportsCitizen.controller';
import { GetOneReportsCitizenController } from './controllers/citizen/getOneReportsCitizen.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [AuthTokenGuard, OperationalStatusService, HighRelevanceService, AcceptedRequestAnalyticsService],
  controllers: [GetOperationStatusController, GetReportsAcceptedLawyerController, GetAllReportsCitizenController, GetHighRelevanceController, GetOneReportsCitizenController],
})
export class DashboardModule { }
