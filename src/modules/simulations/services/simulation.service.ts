import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/modules/prisma/service/prisma.service";
import { InjectQueue } from '@nestjs/bull';
import { Queue } from "bull";

@Injectable()
export class SimulationService {
    constructor(
        private prisma: PrismaService,
        @InjectQueue('simulation-reports') private readonly reportQueue: Queue,
    ) {}
}