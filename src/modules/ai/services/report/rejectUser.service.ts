import { PrismaService } from "@modules/prisma/service/prisma.service"
import { NotFoundException, UnauthorizedException } from "@nestjs/common"

export class RejectUserService {
    constructor(private prisma: PrismaService) { }
    async rejectCase(caseId: string, role: string) {
        const caso = await this.prisma.case.findUnique({
            where: {
                id: caseId
            }
        })

        if (!caso) {
            throw new NotFoundException('Caso não encontrado')
        }

        if (role === "Citizen") {
            throw new UnauthorizedException('Usuário não autorizado')
        }

        await this.prisma.case.update({
            where: { id: caseId },
            data: {
                status: 'Refused',

            }
        })

        return {
            message: 'Caso recusado'
        }
    }
}
