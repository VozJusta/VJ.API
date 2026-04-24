import { ListLawyersForCitizens } from '@m/citizen/service/listLawyersForCitizens.service';
import { RequestUser } from '@m/common/interfaces/interfaces';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiHeader,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

@Controller('lawyers')
@ApiTags('Citizen')
@ApiBearerAuth()
@ApiHeader({
    name: 'Authorization',
    description: 'Token JWT recebido no login no formato "Bearer <token>"',
    required: true,
})
export class GetLawyersForCitizen {
    constructor(private readonly listLawyers: ListLawyersForCitizens) {}

    @Get()
    @UseGuards(AuthTokenGuard)
    @ApiOperation({
        summary: 'Lista todos os advogados verificados',
        description:
            'Retorna todos os advogados com status Verified para o cidadão autenticado.',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de advogados verificados retornada com sucesso.',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'f1f6f8d2-7d80-46d1-9c80-32a9d8c5b6de' },
                    full_name: { type: 'string', example: 'Ana Souza' },
                    specialization: { type: 'string', example: 'Labor_and_employment' },
                    avatar_image: {
                        type: 'string',
                        example: 'https://cdn.example.com/avatars/ana.png',
                    },
                    rating: { type: 'number', example: 4.8 },
                },
            },
            example: [
                {
                    id: 'f1f6f8d2-7d80-46d1-9c80-32a9d8c5b6de',
                    full_name: 'Ana Souza',
                    specialization: 'Labor_and_employment',
                    avatar_image: 'https://cdn.example.com/avatars/ana.png',
                    rating: 4.8,
                },
            ],
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
        description: 'Cidadão não encontrado.',
    })
    async getLawyers(@Req() req: RequestUser) {
        const userId = req.user.sub;
        const role = req.user.role;

        return this.listLawyers.listLawyers(userId, role);
    }
}