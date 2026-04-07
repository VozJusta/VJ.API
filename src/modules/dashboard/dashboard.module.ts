import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DashboardService } from './service/dashboard.service';
import { AuthTokenGuard } from '../auth/guard/access-token.guard';
import { DashboardController } from './controllers/dashboard.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [DashboardService, AuthTokenGuard],
  controllers: [DashboardController],
})
export class DashboardModule {}
