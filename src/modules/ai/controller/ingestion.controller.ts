import { Controller, Post } from "@nestjs/common";
import { IngestionService } from "../services/ingestion.service";

@Controller('ingest')
export class IngestionController {
    constructor(private ingestionService: IngestionService) { }

    @Post()
    async ingest() {
        await this.ingestionService.ingest([
            {
                content:
                    'O pagamento das verbas rescisórias deve ser feito em até 10 dias.',
                source: 'CLT Art. 477',
                area: 'Labor_and_employment',
                type: 'law',
            },
        ]);

        return { message: 'Dados inseridos no Qdrant' };
    }
}
