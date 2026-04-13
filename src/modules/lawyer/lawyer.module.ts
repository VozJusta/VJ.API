import { Module } from '@nestjs/common';
import { LawyerService } from './service/lawyer.service';
import { LawyerController } from './controllers/lawyer.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { SecurityTokenInterceptor } from '../auth/interceptors/security-token.interceptor';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [LawyerService, SecurityTokenInterceptor],
  controllers: [LawyerController],
})
export class LawyerModule {}
