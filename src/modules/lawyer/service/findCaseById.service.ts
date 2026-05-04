import { PrismaService } from '@m/prisma/service/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class FindCaseById {
  constructor(private readonly prisma: PrismaService) {}

  private formatDateTime(date: Date) {
    const pad = (value: number) => value.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

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
          caseRequests: {
            where: { lawyer_id: userId },
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              status: true,
              created_at: true,
            },
          },
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
      const [latestCaseRequest] = allInfoCase.caseRequests;
      const formattedRequestCreatedAt = latestCaseRequest
        ? this.formatDateTime(latestCaseRequest.created_at)
        : null;

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
            status: allInfoCase.caseRequests[0]?.status ?? null,
            created_at: formattedRequestCreatedAt,
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
