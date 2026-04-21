import { Module } from '@nestjs/common';
import { LawyerService } from '../lawyer/service/lawyer.service';
import { LawyerController } from '../lawyer/controllers/lawyer.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { SecurityTokenInterceptor } from '../auth/interceptors/security-token.interceptor';
import { AuthModule } from '../auth/auth.module';
import { LawyerRequestsService } from './service/lawyer-requests.service';
import { LawyerRequestController } from './controllers/lawyer-requests.controller';
import { CaseRequestService } from './service/case-request.service';
import { CaseRequestController } from './controllers/case-request.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [
    LawyerService,
    LawyerRequestsService,
    CaseRequestService,
    SecurityTokenInterceptor,
  ],
  controllers: [
    LawyerController,
    LawyerRequestController,
    CaseRequestController,
  ],
})
export class LawyerModule {}
