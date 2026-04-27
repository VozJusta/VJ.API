import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/modules/prisma/service/prisma.service";
import { InjectQueue } from '@nestjs/bull';
import { Queue } from "bull";
import { StartSimulationDto } from "../dto/simulation.dto";
import { CreateSimulationDTO } from "../dto/create-simulation.dto";

@Injectable()
export class SimulationService {
    constructor(
        private prisma: PrismaService,
        @InjectQueue('simulation-reports') private readonly reportQueue: Queue,
    ) { }

    async create(body: CreateSimulationDTO, sub: string) {
        return await this.prisma.simulation.create({
            data: {
                citizen_id: sub,
                personality: body.personality,
                report_id: body.reportId,
            }
        })
    }

    async start(body: StartSimulationDto) {
        return this.prisma.simulation.update({
            where: { id: body.simulationId },
            data: {
                status: 'InProgress',
                started_at: new Date(),
            },
        });
    }

    async finish(simulationId: string, status: 'Completed' | 'TimedOut') {
        const simulation = await this.prisma.simulation.findUniqueOrThrow({
            where: { id: simulationId },
        });

        const endedAt = new Date();
        const durationSecs = Math.floor(
            (endedAt.getTime() - new Date(simulation.started_at).getTime()) / 1000,
        );

        await this.prisma.simulation.update({
            where: { id: simulationId },
            data: { status, ended_at: endedAt, duration_secs: durationSecs },
        });

        await this.reportQueue.add(
            'generate-report',
            { simulationId },
            { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
        );
    }
}