import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '@m/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { EmbeddingsService } from '@m/ai/services/embeddings.service';
import { RagService } from '@m/ai/services/rag.service';
import { ReportService } from '@m/ai/services/report.service';
import { LlmService } from '@m/ai/services/llm.service';
import { IngestionService } from '@m/ai/services/ingestion.service';
import { IngestionController } from '@m/ai/controller/ingestion.controller';
import { PdfService } from '@m/ai/services/pdf.service';
import { AuthModule } from '@m/auth/module/auth.module';
import { TtsService } from '@m/ai/services/tts.service';
import { StartConversationController } from '@m/ai/controller/start-conversation.controller';
import { StartConversationService } from '@m/ai/services/start-conversation.service';
import { ContinueConversationService } from '@m/ai/services/continue-conversation.service';
import { ContinueConversationController } from '@m/ai/controller/continue-conversation.controller';
import { GetHistoryChatService } from '@m/ai/services/get-history-chat.service';
import { GetHistoryChatController } from '@m/ai/controller/get-history-chat.controller';
import { GeneratePdfController } from '@m/ai/controller/generate-pdf.controller';
import { TranscribeAudioController } from '@m/ai/controller/transcribe-audio.controller';
import { TranscribeAudioService } from '@m/ai/services/transcribe-audio.service';

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
    TtsService,
    StartConversationService,
    ContinueConversationService,
    GetHistoryChatService,
    TranscribeAudioService
  ],
  controllers: [
    IngestionController, 
    StartConversationController, 
    ContinueConversationController,
    GetHistoryChatController,
    GeneratePdfController,
    TranscribeAudioController
  ],
  exports: [
    EmbeddingsService,
    RagService,
    ReportService,
    LlmService,
    IngestionService,
    TtsService,
  ],
})
export class AiModule {}
