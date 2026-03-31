import { Body, Controller, Post } from "@nestjs/common";
import { IngestionService } from "../services/ingestion.service";
import { IngestionDTO } from "../dto/ingestion.dto";

@Controller('ingest')
export class IngestionController {
    constructor(private ingestionService: IngestionService) { }

    @Post()
    async ingest(@Body() body: IngestionDTO): Promise<{ message: string }> {
        await this.ingestionService.ingest([body]);

        return { message: 'Dados inseridos no Qdrant' };
    }
}
