import {
  Controller,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { Request } from 'express';
import { RejectCaseRequest } from '@m/lawyer/service/rejectCaseRequest.service';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@Controller('lawyer')
@ApiTags('Case Requests')
@ApiBearerAuth()
export class RejectCaseRequestController {
  constructor(private readonly rejectCaseRequestService: RejectCaseRequest) {}

  @Put('requests/:id/reject')
  @UseGuards(AuthTokenGuard)
  async rejectCaseRequest(
    @Param('id') caseRequestId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.rejectCaseRequestService.rejectCaseRequest(
      userId,
      role,
      caseRequestId,
    );
  }
}
