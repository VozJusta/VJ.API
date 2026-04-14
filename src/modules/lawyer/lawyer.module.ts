import { Module } from '@nestjs/common';
import { LawyerService } from '../lawyer/service/lawyer.service';
import { LawyerController } from '../lawyer/controllers/lawyer.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { SecurityTokenInterceptor } from '../auth/interceptors/security-token.interceptor';
import { ConfigModule, ConfigType } from '@nestjs/config';
import jwtConfig from '../auth/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { LawyerRequestsService } from './service/lawyer-requests.service';
import { LawyerRequestController } from './controllers/lawyer-requests.controller';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
  ],
  providers: [LawyerService, LawyerRequestsService,SecurityTokenInterceptor],
  controllers: [LawyerController, LawyerRequestController]
})
export class LawyerModule { }
