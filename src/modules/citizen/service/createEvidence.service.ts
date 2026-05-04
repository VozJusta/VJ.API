import { PrismaService } from "@modules/prisma/service/prisma.service";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class CreateEvidenceService {
    constructor(
        private readonly prisma: PrismaService
    ) { }
    async createEvidence(file: Express.Multer.File, userId: string, role: string) {
        const userRole = role.toLowerCase();
        if (userRole !== 'citizen') {
            throw new UnauthorizedException('Apenas cidadãos podem criar evidências');
        }

        const citizenId = await this.prisma.citizen.findUnique({
            where: { id: userId },
        });
        if (!citizenId) {
            throw new NotFoundException('Cidadão não encontrado');
        }
        
    }
}