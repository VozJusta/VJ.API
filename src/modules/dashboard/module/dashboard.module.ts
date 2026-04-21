import { Module } from '@nestjs/common';
import { AuthModule } from '@m/auth/module/auth.module';
import { PrismaModule } from '@m/prisma/prisma.module';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
// import { GetAllReportCitizenController } from '../controllers/citizen/getAllReportsCitizen.controller';
// import { GetOneReportsCitizenController } from '../controllers/citizen/getOneReportsCitizen.controller';
// import { GetHighRelevanceController } from '../controllers/lawyer/getHighRelevance.controller';
// import { GetOperationStatusController } from '../controllers/lawyer/getOperationalStatus.controller';
// import { GetReportsAcceptedLawyerController } from '../controllers/lawyer/getReportsAcceptedLawyer.controller';
// import { FindCitizenReportByIdService } from '../service/citizen/findCitizenReportById.service';
// import { ListReportsByCitizenService } from '../service/citizen/listReportsByCitizen.service';
// import { AcceptedRequestAnalyticsService } from '../service/lawyer/acceptedRequestAnalytics.service';
// import { HighRelevanceService } from '../service/lawyer/highRelevance.service';
// import { OperationalStatusService } from '../service/lawyer/operetionalStatus.service';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [

    AuthTokenGuard,
  ],
  controllers: [],
})
export class DashboardModule {}
