import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '@modules/auth/module/auth.module';
import { AiModule } from '@modules/ai/module/ai.module';
import { SimulationService } from './services/simulation.service';
import { SimulationGateway } from './gateway/simulation.gateway';
import { ReportProcessor } from './processors/report.processor';
import { ReportService } from '../ai/services/report.service';
import { SimulationChatService } from './services/chat.service';
import { GeneratePdfService } from './services/generate-pdf.service';
import { CreateSimulationService } from './services/create-simulation.service';
import { SimulationController } from './controllers/simulation.controller';
import { GeneratePdfController } from './controllers/generate-pdf.controller';
import { CreateSimulationController } from './controllers/create-simulation.controller';
import { VideoProxyService } from './services/videoProxy.service';

@Global()
@Module({
  imports: [
    AiModule,
    AuthModule,
    PrismaModule,
    BullModule.registerQueue({
      name: 'simulation-reports',
    }),
  ],
  providers: [
    SimulationService,
    SimulationGateway,
    ReportProcessor,
    ReportService,
    GeneratePdfService,
    SimulationChatService,
    CreateSimulationService,
    VideoProxyService,
  ],
  controllers: [
    SimulationController,
    GeneratePdfController,
    CreateSimulationController,
  ],
})
export class SimulationModule {}
