import { Module } from '@nestjs/common';
import { CitizenService } from './service/citizen.service';
import { CitizenController } from './controllers/citizen.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { SecurityTokenInterceptor } from '../auth/interceptors/security-token.interceptor';
import { ConfigModule, ConfigType } from '@nestjs/config';
import jwtConfig from '../auth/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './service/dashboard.service';
import { AuthTokenGuard } from '../auth/guard/access-token.guard';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      inject: [jwtConfig.KEY],
      useFactory: (config: ConfigType<typeof jwtConfig>) => ({
        secret: config.accessToken.secret
      }),
    }),
    PrismaModule
  ],
  providers: [CitizenService, SecurityTokenInterceptor, DashboardService, AuthTokenGuard],
  controllers: [CitizenController, DashboardController]
})
export class CitizenModule { }
