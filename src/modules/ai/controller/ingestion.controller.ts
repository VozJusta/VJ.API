import { Body, Controller, Post } from "@nestjs/common";
import { IngestionService } from "../services/ingestion.service";
import { IngestionDTO } from "../dto/ingestion.dto";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";

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
    async ingest(@Body() body: IngestionDTO): Promise<{ message: string }> {
        await this.ingestionService.ingest([body]);

        return { message: 'Dados inseridos no Qdrant' };
    }
}
