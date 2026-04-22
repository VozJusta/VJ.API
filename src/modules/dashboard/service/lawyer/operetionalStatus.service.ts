import { PrismaService } from "@modules/prisma/service/prisma.service";
import { NotFoundException, BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class OperationalStatusService {
    constructor(private readonly prisma: PrismaService) { }

    async operationalStatus(
        userId: string,
        role: string,
    ): Promise<{ pending: number; refused: number; accepted: number }> {
        const userRole = role.toLowerCase();

        if (userRole === 'lawyer') {
            const lawyer = await this.prisma.lawyer.findFirst({
                where: { id: userId },
                select: { id: true },
            });

            if (!lawyer) {
                throw new NotFoundException('Advogado não encontrado');
            }

            const reportsWithStatus = await this.prisma.report.findMany({
                where: {
                    case: {
                        lawyer_id: userId,
                        status: {
                            in: ['Pending', 'Refused', 'Accepted'],
                        },
                    },
                },
                select: {
                    case: {
                        select: {
                            status: true,
                        },
                    },
                },
            });

            const counts = reportsWithStatus.reduce<{
                pending: number;
                refused: number;
                accepted: number;
            }>((acc, report) => {
                const status = report.case.status.toLowerCase();

                if (status === 'pending') acc.pending += 1;
                if (status === 'refused') acc.refused += 1;
                if (status === 'accepted') acc.accepted += 1;

                return acc;
            }, {
                pending: 0,
                refused: 0,
                accepted: 0,
            });

            return counts;
        }

        throw new BadRequestException('Role inválida');
    }
}
