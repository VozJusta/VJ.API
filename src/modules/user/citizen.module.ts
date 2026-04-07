import { Module } from '@nestjs/common';
import { CitizenService } from './service/citizen.service';
import { CitizenController } from './controllers/citizen.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { SecurityTokenInterceptor } from '../auth/interceptors/security-token.interceptor';
import { ConfigModule, ConfigType } from '@nestjs/config';
import jwtConfig from '../auth/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { DashboardController } from '../dashboard/controllers/dashboard.controller';
import { DashboardService } from '../dashboard/service/dashboard.service';
import { AuthTokenGuard } from '../auth/guard/access-token.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
  ],
  providers: [CitizenService, DashboardService, AuthTokenGuard],
  controllers: [CitizenController, DashboardController]
})
export class CitizenModule { }
