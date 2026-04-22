import { Module } from '@nestjs/common';
import { LawyerService } from '@m/lawyer/service/lawyer.service';
import { LawyerController } from '@m/lawyer/controllers/lawyer.controller';
import { PrismaModule } from '@m/prisma/prisma.module';
import { SecurityTokenInterceptor } from '@m/auth/interceptors/security-token.interceptor';
import { AuthModule } from '@m/auth/module/auth.module';
import { LawyerRequestsStatusService } from '@modules/lawyer/service/lawyerRequestsStatus.service';
import { LawyerRequestController } from '@modules/lawyer/controllers/lawyerRequests.controller';
import { AcceptCaseRequest } from '@m/lawyer/service/acceptCaseRequest.service';
import { RejectCaseRequest } from '@m/lawyer/service/rejectCaseRequest.service';
import { AcceptCaseRequestController } from '@m/lawyer/controllers/patchAcceptCaseRequest.controller';
import { RejectCaseRequestController } from '@m/lawyer/controllers/patchRejectCaseRequest.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [
    LawyerService,
    LawyerRequestsStatusService,
    AcceptCaseRequest,
    RejectCaseRequest,
    SecurityTokenInterceptor,
  ],
  controllers: [
    LawyerController,
    LawyerRequestController,
    AcceptCaseRequestController,
    RejectCaseRequestController,
  ],
})
export class LawyerModule {}
