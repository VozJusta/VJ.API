import { PrismaService } from "@modules/prisma/service/prisma.service";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AcceptCaseService {
    constructor(private prisma: PrismaService) { }

    async acceptCase(caseId: string, lawyerId: string, role: string) {
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
                status: 'Accepted',
                lawyer_id: lawyerId
            }
        })

        return {
            message: 'Caso aceito com sucesso'
        }
    }

}