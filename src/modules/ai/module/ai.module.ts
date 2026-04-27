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
import { AuthTokenGuard } from '@m/auth/guard/access-token.guard';
import { TtsService } from '../services/tts.service';
import { StartConversationController } from '../controller/start-conversation.controller';
import { StartConversationService } from '../services/start-conversation.service';
import { ContinueConversationService } from '../services/continue-conversation.service';
import { ContinueConversationController } from '../controller/continue-conversation.controller';
import { GetHistoryChatService } from '../services/get-history-chat.service';
import { GetHistoryChatController } from '../controller/get-history-chat.controller';
import { GeneratePdfController } from '../controller/generate-pdf.controller';
import { TranscribeAudioController } from '../controller/transcribe-audio.controller';
import { TranscribeAudioService } from '../services/transcribe-audio.service';

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
