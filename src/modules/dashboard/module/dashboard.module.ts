import { Module } from '@nestjs/common';
import { AuthModule } from '@m/auth/module/auth.module';
import { PrismaModule } from '@m/prisma/prisma.module';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';

import { DashboardCitizenService } from '@m/dashboard/service/dashboard-citizen.service';
import { DashboardLawyerService } from '@m/dashboard/service/dashboard-lawyer.service';
import { GetAllReportCitizenController } from '../controllers/citizen/getAllReportsCitizen.controller';
import { GetOneReportsCitizenController } from '../controllers/citizen/getOneReportsCitizen.controller';
import { GetHighRelevanceController } from '../controllers/lawyer/getHighRelevance.controller';
import { GetOperationStatusController } from '../controllers/lawyer/getOperationalStatus.controller';
import { GetReportsAcceptedLawyerController } from '../controllers/lawyer/getReportsAcceptedLawyer.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [DashboardCitizenService, DashboardLawyerService, AuthTokenGuard],
  controllers: [GetAllReportCitizenController, GetOneReportsCitizenController,GetHighRelevanceController,
    GetOperationStatusController, GetReportsAcceptedLawyerController
  ],
})
export class DashboardModule {}
