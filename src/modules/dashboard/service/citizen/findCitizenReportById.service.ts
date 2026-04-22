import { PrismaService } from '@modules/prisma/service/prisma.service';
import { NotFoundException, BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FindCitizenReportByIdService {
    constructor(private readonly prisma: PrismaService) { }
    async findCitizenReportById(userId: string, role: string, reportId: string) {
        const userRole = role.toLowerCase();

        if (userRole === 'citizen') {
            const citizen = await this.prisma.citizen.findUnique({
                where: { id: userId },
                select: { id: true },
            });

            if (!citizen) {
                throw new NotFoundException('Cidadão não encontrado');
            }

            const report = await this.prisma.report.findFirst({
                where: {
                    id: reportId,
                    user_id: userId,
                },
                select: {
                    id: true,
                    transcription: true,
                    simplified_explanation: true,
                    legal_analysis: true,
                    category_detected: true,
                    case: {
                        select: {
                            status: true,
                        },
                    },
                    evidence: true,
                    lawyer: {
                        select: {
                            full_name: true,
                            bio: true,
                            phone: true,
                            email: true,
                        },
                    },
                },
            });

            //retorna NotFound porque não tem o reportId referente ao usuário
            if (!report) {
                throw new NotFoundException('Relatório não encontrado');
            }

            const { case: reportCase, ...reportData } = report;
            const reportWithStatus = {
                ...reportData,
                status: reportCase.status,
            };

            return {
                role: 'Citizen',
                user: {
                    report: reportWithStatus,
                },
            };
        }

        throw new BadRequestException('Role inválida');
    }
}
