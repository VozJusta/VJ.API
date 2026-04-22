import { AuthTokenGuard } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/auth/interfaces/interfaces';
import { HighRelevanceService } from '@modules/dashboard/service/lawyer/highRelevance.service';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiHeader,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';



@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller()
export class GetHighRelevanceController {
    constructor(private readonly dashboardService: HighRelevanceService) { }
    @Get('/lawyer/high-relevance')
    @UseGuards(AuthTokenGuard)
    @ApiOperation({
        summary: 'Retorna relatórios com maior relevância para o advogado',
        description:
            'Busca os relatórios do advogado autenticado ordenados por confidence_score em ordem decrescente.',
    })
    @ApiHeader({
        name: 'Authorization',
        required: true,
        description: 'Token JWT recebido no login no formato "Bearer <token>"',
    })
    @ApiResponse({
        status: 200,
        description: 'Retorna a lista de relatórios com maior relevância.',
        schema: {
            example: [
                {
                    id: 'cly4v7sdm0000q8x2ptv0h9k1',
                    title: 'Atraso no pagamento de horas extras',
                    status: 'Accepted',
                    confidence_score: 0.97,
                    category_detected: 'Direito do Consumidor',
                },
                {
                    id: 'cly4v8a6k0001q8x2zr2j3j8l',
                    title: 'Demissão sem justa causa',
                    status: 'Pending',
                    confidence_score: 0.91,
                    category_detected: 'Direito Trabalhista',
                },
            ],
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
    async getHighRelevance(@Req() req: RequestUser) {
        const userId = req.user.sub;
        const role = req.user.role;

        return this.dashboardService.highRelevance(userId, role);
    }
}
