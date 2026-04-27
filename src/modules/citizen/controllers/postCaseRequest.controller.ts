import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiHeader,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { RequestUser } from '@m/common/interfaces/interfaces';
import { CreateCaseRequest } from '@m/citizen/service/createCaseRequest.service';

@Controller('case')
@ApiTags('Citizen')
@ApiBearerAuth()
@ApiHeader({
	name: 'Authorization',
	description: 'Token JWT recebido no login no formato "Bearer <token>"',
	required: true,
})
export class PostCaseRequestController {
	constructor(private readonly createCaseRequest: CreateCaseRequest) {}

	@Post(':caseId/requests/:lawyerId')
	@UseGuards(AuthTokenGuard)
	@ApiOperation({
		summary: 'Envia uma solicitação de caso para um advogado',
		description:
			'Permite que o cidadão envie um case request para um advogado selecionado.',
	})
	@ApiParam({
		name: 'caseId',
		type: 'string',
		description: 'ID do caso que será enviado ao advogado',
	})
	@ApiParam({
		name: 'lawyerId',
		type: 'string',
		description: 'ID do advogado que receberá a solicitação',
	})
	@ApiResponse({
		status: 201,
		description: 'Solicitação enviada com sucesso.',
		schema: {
			example: {
				message: 'Solicitação de caso enviada com sucesso',
				caseRequest: {
					id: 'clx123caserequest',
					case_id: 'clx123case',
					citizen_id: 'clx123citizen',
					lawyer_id: 'clx123lawyer',
					status: 'Pending',
					created_at: '2026-04-27T12:00:00.000Z',
					updated_at: '2026-04-27T12:00:00.000Z',
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Role inválida ou requisição duplicada.',
	})
	@ApiResponse({
		status: 401,
		description: 'Token ausente, inválido ou expirado.',
	})
	@ApiResponse({
		status: 404,
		description: 'Cidadão, advogado ou caso não encontrado.',
	})
	async createCaseRequestHandler(
		@Param('caseId') caseId: string,
		@Param('lawyerId') lawyerId: string,
		@Req() req: RequestUser,
	) {
		const userId = req.user.sub;
		const role = req.user.role;

		return this.createCaseRequest.createCaseRequest(
			userId,
			role,
			lawyerId,
			caseId,
		);
	}
}
