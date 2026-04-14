import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/module/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthTokenGuard } from '../../auth/guard/access-token.guard';
import { DashboardCitizenController } from '../controllers/dashboard-citizen.controller';
import { DashboardCitizenService } from '../service/dashboard-citizen.service';
import { DashboardLawyerService } from '../service/dashboard-lawyer.service';
import { DashboardLawyerController } from '../controllers/dashboard-lawyer.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [DashboardCitizenService, DashboardLawyerService, AuthTokenGuard],
  controllers: [DashboardCitizenController, DashboardLawyerController],
})
export class DashboardModule {}
