import { PrismaService } from '@m/prisma/service/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class FindCaseById {
  constructor(private readonly prisma: PrismaService) {}

  async findCase(userId: string, role: string, caseId: string) {
    const userRole = role.toLowerCase();

    if (userRole === 'lawyer') {
      const lawyer = await this.prisma.lawyer.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!lawyer) {
        throw new NotFoundException('Advogado não encontrado');
      }

      const allInfoCase = await this.prisma.case.findFirst({
        where: {
          id: caseId,
          OR: [
            { lawyer_id: userId },
            { caseRequests: { some: { lawyer_id: userId } } },
          ],
        },
        select: {
          title: true,
          status: true,
          reports: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              id: true,
              transcription: true,
              simplified_explanation: true,
              legal_analysis: true,
              category_detected: true,
              evidence: {
                select: {
                  file_url: true,
                },
              },
              citizen: {
                select: {
                  full_name: true,
                  phone: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!allInfoCase) {
        throw new NotFoundException('Caso não encontrado');
      }

      const [latestReport] = allInfoCase.reports;

      if (!latestReport) {
        throw new NotFoundException('Relatório não encontrado para o caso');
      }

      return {
        role: 'Lawyer',
        user: {
          report: {
            id: latestReport.id,
            title: allInfoCase.title,
            transcription: latestReport.transcription,
            simplified_explanation: latestReport.simplified_explanation,
            legal_analysis: latestReport.legal_analysis,
            category_detected: latestReport.category_detected,
            status: allInfoCase.status,
            evidence: latestReport.evidence.map((item) => item.file_url),
            citizen: {
              full_name: latestReport.citizen.full_name,
              phone: latestReport.citizen.phone,
              email: latestReport.citizen.email,
            },
          },
        },
      };
    }

    throw new BadRequestException('Role inválida');
  }
}
