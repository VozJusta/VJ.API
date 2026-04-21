import { Module } from '@nestjs/common';
import { LawyerService } from '@m/lawyer/service/lawyer.service';
import { LawyerController } from '@m/lawyer/controllers/lawyer.controller';
import { PrismaModule } from '@m/prisma/prisma.module';
import { SecurityTokenInterceptor } from '@m/auth/interceptors/security-token.interceptor';
import { AuthModule } from '@m/auth/module/auth.module';
import { LawyerRequestsService } from '@m/lawyer/service/lawyer-requests.service';
import { LawyerRequestController } from '@m/lawyer/controllers/lawyer-requests.controller';
import { CaseRequestService } from '@m/lawyer/service/case-request.service';
import { CaseRequestController } from '@m/lawyer/controllers/case-request.controller';

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
