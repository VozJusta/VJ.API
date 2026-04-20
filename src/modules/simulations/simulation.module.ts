import { Global, Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { SimulationService } from "./services/simulation.service";
import { ReportService } from "./services/report.service";
import { PrismaModule } from "../prisma/prisma.module";
import { EventEmitter } from "stream";

@Global()
@Module({
    imports: [AiModule, PrismaModule, BullModule, EventEmitter],
    providers: [SimulationService, ReportService],
    controllers: [],
})
export class SimulationModule {}