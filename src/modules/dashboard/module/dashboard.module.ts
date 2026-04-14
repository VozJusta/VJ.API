import { Module } from '@nestjs/common';
import { AuthModule } from '@m/auth/module/auth.module';
import { PrismaModule } from '@m/prisma/prisma.module';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { DashboardCitizenController } from '@m/dashboard/controllers/dashboard-citizen.controller';
import { DashboardCitizenService } from '@m/dashboard/service/dashboard-citizen.service';
import { DashboardLawyerService } from '@m/dashboard/service/dashboard-lawyer.service';
import { DashboardLawyerController } from '@m/dashboard/controllers/dashboard-lawyer.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [DashboardCitizenService, DashboardLawyerService, AuthTokenGuard],
  controllers: [DashboardCitizenController, DashboardLawyerController],
})
export class DashboardModule {}
