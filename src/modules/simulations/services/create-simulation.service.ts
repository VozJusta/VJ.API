import { Injectable } from "@nestjs/common";
import { CreateSimulationDTO } from "../dto/create-simulation.dto";
import { PrismaService } from "@modules/prisma/service/prisma.service";

@Injectable()
export class CreateSimulationService {
    constructor(private prisma: PrismaService) {}

    async create(body: CreateSimulationDTO, sub: string) {
            return await this.prisma.simulation.create({
                data: {
                    citizen_id: sub,
                    personality: body.personality,
                    report_id: body.reportId,
                }
            })
        }
}