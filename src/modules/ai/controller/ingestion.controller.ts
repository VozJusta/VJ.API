import { Body, Controller, Post } from "@nestjs/common";
import { IngestionService } from "@m/ai/services/ingestion.service";
import { IngestionDTO } from "@m/ai/dto/ingestion.dto";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('Ingestion')
@Controller('ingest')
export class IngestionController {
    constructor(private ingestionService: IngestionService) { }

    @Post()
    @ApiOperation({ summary: 'Ingere dados e os insere no banco vetorial Qdrant' })
    @ApiBody({ type: IngestionDTO, description: 'Dados para ingestão' })
    @ApiResponse({ 
        status: 201, 
        description: 'Dados inseridos com sucesso no Qdrant',
        schema: { example: { message: 'Dados inseridos no Qdrant' } }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Erro de validação. Ocorre quando os dados enviados não respeitam as regras do IngestionDTO.',
        schema: {
            example: {
                message: [
                    "Campo content é obrigatório",
                    "Campo source é obrigatório",
                    "Campo title é obrigatório",
                    "Campo area é obrigatório",
                    "area must be one of the following values: Labor_and_employment, Corporate, Tax..." 
                ],
                error: "Bad Request",
                statusCode: 400
            }
        }
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Erro interno no servidor. Pode ocorrer caso haja falha na comunicação com o banco vetorial (Qdrant).' 
    })
    async ingest(@Body() body: IngestionDTO): Promise<{ message: string }> {
        await this.ingestionService.ingest([body]);

        return { message: 'Dados inseridos no Qdrant' };
    }
}
