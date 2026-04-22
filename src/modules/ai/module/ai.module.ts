import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '@m/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { EmbeddingsService } from '@m/ai/services/embeddings.service';
import { RagService } from '@m/ai/services/rag.service';
import { ReportController } from '@m/ai/controller/report.controller';
import { ReportService } from '@m/ai/services/report.service';
import { LlmService } from '@m/ai/services/llm.service';
import { IngestionService } from '@m/ai/services/ingestion.service';
import { IngestionController } from '@m/ai/controller/ingestion.controller';
import { PdfService } from '@m/ai/services/pdf.service';
import { AuthModule } from '@m/auth/module/auth.module';
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';

@Global()
@Module({
  imports: [PrismaModule, HttpModule, AuthModule],
  providers: [
    EmbeddingsService,
    RagService,
    ReportService,
    LlmService,
    IngestionService,
    PdfService,
  ],
  controllers: [ReportController, IngestionController],
  exports: [
    EmbeddingsService,
    RagService,
    ReportService,
    LlmService,
    IngestionService,
  ],
})
export class AiModule {}
