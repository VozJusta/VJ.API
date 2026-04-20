import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { EmbeddingsService } from './services/embeddings.service';
import { RagService } from './services/rag.service';
import { ReportController } from './controller/report.controller';
import { LlmService } from './services/llm.service';
import { IngestionService } from './services/ingestion.service';
import { IngestionController } from './controller/ingestion.controller';
import { PdfService } from './services/pdf.service';
import { AuthModule } from '../auth/auth.module';
import { AuthTokenGuard } from '../auth/guard/access-token.guard';

@Global()
@Module({
    imports: [PrismaModule, HttpModule, AuthModule],
    providers: [EmbeddingsService, RagService, LlmService, IngestionService, PdfService],
    controllers: [ReportController, IngestionController],
    exports: [EmbeddingsService, RagService, LlmService, IngestionService],
})
export class AiModule {}
