import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class HighRelevanceService {
  constructor(private readonly prisma: PrismaService) {}

  async highRelevance(userId: string, role: string) {
    const userRole = role?.toLowerCase?.() ?? '';

    if (userRole === 'lawyer') {
      const lawyer = await this.prisma.lawyer.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!lawyer) {
        throw new NotFoundException('Advogado não encontrado');
      }

      const caseRequests = await this.prisma.caseRequest.findMany({
        where: {
          lawyer_id: userId,
          case: {
            reports: {
              some: {
                confidence_score: { not: null },
              },
            },
          },
        },
        select: {
          id: true,
          status: true,
          case: {
            select: {
              id: true,
              title: true,
              reports: {
                where: { confidence_score: { not: null } },
                select: {
                  confidence_score: true,
                  category_detected: true,
                },
              },
            },
          },
        },
      });

      const relevance = caseRequests
        .flatMap((caseRequest) => {
          const reports = caseRequest.case.reports;
          let bestReport: (typeof reports)[number] | null = null;

          for (const report of reports) {
            if (
              bestReport === null ||
              (report.confidence_score ?? 0) > (bestReport.confidence_score ?? 0)
            ) {
              bestReport = report;
            }
          }

          if (!bestReport) {
            return [];
          }

          return [
            {
              id: caseRequest.id,
              title: caseRequest.case.title,
              status: caseRequest.status,
              confidence_score: bestReport.confidence_score,
              category_detected: bestReport.category_detected,
            },
          ];
        })
        .sort((a, b) => (b.confidence_score ?? 0) - (a.confidence_score ?? 0))
        .slice(0, 3);

      return relevance;
    }
    throw new BadRequestException('Role inválida');
  }
}
