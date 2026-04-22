import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { LawyerRequestsStatusService } from '@m/lawyer/service/lawyerRequestsStatus.service';
import { Request } from 'express';
import { RequestsStatusDTO } from '@m/lawyer/dto/requests-status.dto';

interface AuthenticateRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@Controller('lawyer')
export class LawyerRequestController {
  constructor(private readonly lawyerRequestStatus: LawyerRequestsStatusService) {}

  @Get('/requests')
  @UseGuards(AuthTokenGuard)
  async getReportsByStatus(
    @Req() req: AuthenticateRequest,
    @Query() status?: RequestsStatusDTO,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.lawyerRequestStatus.requestsByStatus(userId, role, status);
  }
}
