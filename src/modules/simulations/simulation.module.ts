import { Global, Module } from "@nestjs/common";
import { SimulationService } from "./services/simulation.service";
import { ReportService } from "../ai/services/report.service";
import { PrismaModule } from "../prisma/prisma.module";
import { EventEmitter } from "stream";
import { BullModule } from "@nestjs/bull";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AuthModule } from "@modules/auth/module/auth.module";
import { AiModule } from "@modules/ai/module/ai.module";
import { SimulationGateway } from "./gateway/simulation.gateway";
import { ReportProcessor } from "./processors/report.processor";
import { SimulationChatService } from "./services/chat.service";
import { SimulationController } from "./controllers/simulation.controller";

@Global()
@Module({
    imports: [
        AiModule,
        AuthModule,
        PrismaModule, 
        BullModule.registerQueue({ name: 'simulation-reports' }), 
        EventEmitterModule.forRoot(),

    ],
    providers: [
        SimulationService,
        SimulationGateway,
        ReportProcessor,
        ReportService,
        SimulationChatService,
    ],
    controllers: [SimulationController],
})
export class SimulationModule { }