import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthTokenGuard } from 'src/modules/auth/guard/access-token.guard';
import { LawyerRequestsService } from '../service/lawyer-requests.service';
import { Request } from 'express';
import { RequestsStatusDTO } from '../dto/requests-status.dto';

interface AuthenticateRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@Controller('lawyer')
export class LawyerRequestController {
  constructor(private readonly lawyerRequest: LawyerRequestsService) {}

  @Get('/requests')
  @UseGuards(AuthTokenGuard)
  async getReportsByStatus(
    @Req() req: AuthenticateRequest,
    @Query() status: RequestsStatusDTO,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.lawyerRequest.requestsByStatus(userId, role, status);
  }
}
