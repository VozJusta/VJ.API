import { AuthTokenGuard } from "@modules/auth/guard/access-token.guard";
import { DashboardLawyerService } from "@modules/dashboard/service/dashboard-lawyer.service";
import { Get, UseGuards, Req, Controller } from "@nestjs/common";
import { ApiOperation, ApiHeader, ApiResponse } from "@nestjs/swagger";

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@Controller()
export class GetReportsAcceptedLawyerController {
    constructor(private readonly dashboardService: DashboardLawyerService) { }
    @Get('/lawyer/analytics')
    @UseGuards(AuthTokenGuard)
    @ApiOperation({
        summary: 'Retorna analytics de solicitações aceitas do advogado',
        description:
            'Busca os dados agregados por dia para exibição em gráfico no dashboard do advogado autenticado.',
    })
    @ApiHeader({
        name: 'Authorization',
        required: true,
        description: 'Token JWT recebido no login no formato "Bearer <token>"',
    })
    @ApiResponse({
        status: 200,
        description: 'Retorna os dados de analytics para o dashboard do advogado.',
        schema: {
            example: {
                data: [
                    { date: '2026-04-08', value: 2 },
                    { date: '2026-04-07', value: 4 },
                    { date: '2026-04-06', value: 1 },
                ],
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Role inválida no token autenticado.',
        schema: {
            example: {
                statusCode: 400,
                message: 'Role inválida',
                error: 'Bad Request',
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Token ausente ou inválido',
        schema: {
            example: {
                statusCode: 401,
                message: 'Token está ausente, inválido ou expirado',
                error: 'Unauthorized',
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Advogado não encontrado.',
        schema: {
            example: {
                statusCode: 404,
                message: 'Advogado não encontrado',
                error: 'Not Found',
            },
        },
    })
    async getReportsAcceptedLawyer(@Req() req: AuthenticatedRequest) {
        const userId = req.user.sub;
        const role = req.user.role;

        return this.dashboardService.acceptedRequestAnalytics(userId, role);
    }

}