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
import { AcceptCaseRequest } from '@m/lawyer/service/acceptCaseRequest.service';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@Controller('lawyer')
@ApiTags('Case Requests')
@ApiBearerAuth()
export class AcceptCaseRequestController {
  constructor(private readonly acceptCaseRequestService: AcceptCaseRequest) {}

  @Put('requests/:id/accept')
  @UseGuards(AuthTokenGuard)
  async acceptCaseRequest(
    @Param('id') caseRequestId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    const role = req.user.role;

    return this.acceptCaseRequestService.acceptCaseRequest(
      userId,
      role,
      caseRequestId,
    );
  }
}
