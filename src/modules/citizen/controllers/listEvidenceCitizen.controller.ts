import { AuthTokenGuardAccess } from "@modules/auth/guard/access-token.guard";
import { RequestUser } from "@modules/common/interfaces/interfaces";
import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiHeader,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { ListEvidenceCitizenService } from "../service/listEvidenceCitizen.service";

@Controller('me/evidences')
@ApiTags('Citizen')
@ApiBearerAuth()
@ApiHeader({
    name: 'Authorization',
    description: 'Token JWT recebido no login no formato "Bearer <token>"',
    required: true,
})
export class ListEvidenceCitizenController {
    constructor(
        private readonly listEvidenceCitizenService: ListEvidenceCitizenService
    ){}
    @Get('citizenId')
    @UseGuards(AuthTokenGuardAccess)
    @ApiOperation({
        summary: 'Lista evidências do cidadão autenticado',
        description: 'Retorna as evidências vinculadas ao usuário autenticado.',
    })
    @ApiResponse({
        status: 200,
        description: 'Evidências listadas com sucesso.',
        schema: {
            example: [
                {
                    id: 'cm123evidence',
                    url: 'https://storage.exemplo.com/evidences/evidence_123.pdf',
                    ocr_content: 'Texto extraído do arquivo de evidência, se aplicável.',
                    public_id: 'evidence_123',
                    citizen_id: 'cm123citizen',
                    created_at: '2026-05-13T12:00:00.000Z',
                },
            ],
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Token ausente, inválido ou expirado.',
        schema: {
            example: {
                statusCode: 401,
                message: 'Token inválido',
                error: 'Unauthorized',
            },
        },
    })
    @ApiResponse({
        status: 500,
        description: 'Erro interno ao listar evidências.',
        schema: {
            example: {
                statusCode: 500,
                message: 'Erro interno do servidor',
                error: 'Internal Server Error',
            },
        },
    })
    async listEvidenceCitizen(@Req() req:RequestUser){
        return await this.listEvidenceCitizenService.listEvidenceCitizen( req.user.sub)
    }
}