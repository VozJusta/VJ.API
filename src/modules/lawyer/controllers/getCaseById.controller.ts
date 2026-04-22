
import { AuthTokenGuard } from '@modules/auth/guard/access-token.guard';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { FindCaseById } from '../service/findCaseById.service';

interface AuthenticatedRequest extends Request {
	user: {
		sub: string;
		role: string;
	};
}

@Controller('lawyer')
export class GetCaseByIdController {
	constructor(private readonly findCaseById: FindCaseById) {}

	@Get('/cases/:caseId')
	@UseGuards(AuthTokenGuard)
	async getCaseById(
		@Req() req: AuthenticatedRequest,
		@Param('caseId') caseId: string,
	) {
		const userId = req.user.sub;
		const role = req.user.role;

		return this.findCaseById.findCase(userId, role, caseId);
	}
}