import { Module } from '@nestjs/common';
import { LawyerService } from '@m/lawyer/service/lawyer.service';
import { LawyerController } from '@m/lawyer/controllers/lawyer.controller';
import { PrismaModule } from '@m/prisma/prisma.module';
import { SecurityTokenInterceptor } from '@m/auth/interceptors/security-token.interceptor';
import { AuthModule } from '@m/auth/module/auth.module';
import { LawyerRequestsStatusService } from '@m/lawyer/service/lawyerRequestsStatus.service';
import { LawyerRequestController } from '@m/lawyer/controllers/lawyerRequests.controller';
import { AcceptCaseRequest } from '@m/lawyer/service/acceptCaseRequest.service';
import { RejectCaseRequest } from '@m/lawyer/service/rejectCaseRequest.service';
import { AcceptCaseRequestController } from '@m/lawyer/controllers/patchAcceptCaseRequest.controller';
import { RejectCaseRequestController } from '@m/lawyer/controllers/patchRejectCaseRequest.controller';
import { FindCaseById } from '@m/lawyer/service/findCaseById.service';
import { GetCaseByIdController } from '@m/lawyer/controllers/getCaseById.controller';
import { NotificationsModule } from '@m/notifications/module/notifications.module';

@Module({
  imports: [AuthModule, PrismaModule, NotificationsModule],
  providers: [
    LawyerService,
    LawyerRequestsStatusService,
    AcceptCaseRequest,
    RejectCaseRequest,
    FindCaseById,
    SecurityTokenInterceptor,
  ],
  controllers: [
    LawyerController,
    LawyerRequestController,
    AcceptCaseRequestController,
    RejectCaseRequestController,
    GetCaseByIdController,
  ],
})
export class LawyerModule {}
