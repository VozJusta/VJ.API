import { Module } from '@nestjs/common';
import { CitizenService } from './service/citizen.service';
import { CitizenController } from './controllers/citizen.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { SecurityTokenInterceptor } from '../auth/interceptors/security-token.interceptor';
import { ConfigModule, ConfigType } from '@nestjs/config';
import jwtConfig from '../auth/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { DashboardCitizenController } from '../dashboard/controllers/dashboard-citizen.controller';
import { DashboardCitizenService } from '../dashboard/service/dashboard-citizen.service';
import { AuthTokenGuard } from '../auth/guard/access-token.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
  ],
  providers: [CitizenService, DashboardCitizenService, AuthTokenGuard],
  controllers: [CitizenController, DashboardCitizenController]
})
export class CitizenModule { }
