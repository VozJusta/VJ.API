import { PrismaService } from "src/modules/prisma/service/prisma.service";

export class SimulationService {
    constructor(private prisma: PrismaService) {}
}