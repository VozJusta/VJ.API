
import { AuthTokenGuard } from '@modules/auth/guard/access-token.guard';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiHeader,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { FindCaseById } from '@m/lawyer/service/findCaseById.service';
import { RequestUser } from '@modules/common/interfaces/interfaces';

@Controller('lawyer')
@ApiTags('Lawyer')
@ApiBearerAuth()
@ApiHeader({
  name: 'Authorization',
  description: 'Token JWT recebido no login no formato "Bearer <token>"',
  required: true,
})
export class GetCaseByIdController {
	constructor(private readonly findCaseById: FindCaseById) {}

	@Get('/cases/:caseId')
	@UseGuards(AuthTokenGuard)
	@ApiOperation({
		summary: 'Retorna o dossiê completo de um caso para o advogado autenticado',
		description:
			'Busca o caso por id com dados completos de usuário, advogado, solicitações, conversas e relatórios.',
	})
	@ApiParam({
		name: 'caseId',
		required: true,
		type: 'string',
		description: 'ID do caso',
	})
	@ApiResponse({
		status: 200,
		description: 'Dossiê do caso retornado com sucesso.',
		schema: {
			example: {
				id: 'clx123case',
				title: 'Cobrança indevida',
				status: 'Pending',
				created_at: '2026-04-22',
				user: {
					id: 'clx123citizen',
					full_name: 'João da Silva',
					phone: '11999999999',
				},
				reports: [],
				caseRequests: [],
				conversations: [],
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Role inválida.',
	})
	@ApiResponse({
		status: 401,
		description: 'Token ausente, inválido ou expirado.',
	})
	@ApiResponse({
		status: 404,
		description: 'Advogado ou caso não encontrado.',
	})
	async getCaseById(
		@Req() req: RequestUser,
		@Param('caseId') caseId: string,
	) {
		const userId = req.user.sub;
		const role = req.user.role;

		return this.findCaseById.findCase(userId, role, caseId);
	}
}