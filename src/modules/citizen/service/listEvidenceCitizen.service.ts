import { PrismaService } from "@modules/prisma/service/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class ListEvidenceCitizenService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }
    async listEvidenceCitizen(sub: string) {
        if (!sub) {
            throw new BadRequestException('ID do cidadão é obrigatório');
        }
        const evidences = await this.prisma.evidence.findMany({
            where: {
                citizenId: sub
            }
        })
        return evidences;

    }
}