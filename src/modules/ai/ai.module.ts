import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { EmbeddingsService } from './services/embeddings.service';
import { RagService } from './services/rag.service';
import { TesteController } from './controller/teste.controller';

@Global()
@Module({
    imports: [PrismaModule, HttpModule],
    providers: [EmbeddingsService, RagService],
    controllers: [TesteController],
    exports: [EmbeddingsService, RagService],
})
export class AiModule {}
