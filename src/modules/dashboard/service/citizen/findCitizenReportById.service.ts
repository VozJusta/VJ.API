import { PrismaService } from '@modules/prisma/service/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

export class FindCitizenReportByIdService {
  constructor(private readonly prisma: PrismaService) {}

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
          status: true,
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
      if (!report) {
        throw new NotFoundException('Relatório não encontrado');
      }

      return {
        role: 'Citizen',
        user: {
          report,
        },
      };
    }

    throw new BadRequestException('Role inválida');
  }
}
