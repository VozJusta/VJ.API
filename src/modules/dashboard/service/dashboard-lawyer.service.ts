import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/service/prisma.service';
import { LawyerAnalyticsResponseDTO } from '../dto/lawyer-analytics.dto';

@Injectable()
export class DashboardLawyerService {
  constructor(private readonly prisma: PrismaService) {}
  async acceptedRequestAnalytics(
    userId: string,
    role: string,
  ): Promise<LawyerAnalyticsResponseDTO> {
    const userRole = role.toLowerCase();

    if (userRole === 'lawyer') {
      const lawyer = await this.prisma.lawyer.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!lawyer) {
        throw new NotFoundException('Advogado não encontrado');
      }
      const acceptedReports = await this.prisma.report.findMany({
        where: {
          case: {
            lawyer_id: userId,
            status: 'Accepted',
          },
        },
        select: { created_at: true },
        orderBy: { created_at: 'asc' },
      });

      const groupedByDate = acceptedReports.reduce<Record<string, number>>(
        (acc, report) => {
          const date = report.created_at.toISOString().split('T')[0];
          acc[date] = (acc[date] ?? 0) + 1;
          return acc;
        },
        {},
      );

      return {
        data: Object.entries(groupedByDate).map(([date, value]) => ({
          date,
          value,
        })),
      };
    }

    throw new BadRequestException('Role inválida');
  }

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
          lawyer_id: userId,
          case: {
            status: {
              in: ['Pending', 'Refused', 'Accepted'],
            },
          },
        }),
        this.prisma.report.count({
          where: {
            lawyer_id: userId,
            case: {
              status: 'Accepted',
            },
          },
        }),
      ]);

      return {
        pending,
        refused,
        accepted,
      };
    }

    throw new BadRequestException('Role inválida');
  }

  async highRelevance(userId: string, role: string) {
    const userRole = role.toLowerCase();

    if (userRole === 'lawyer') {
      const lawyer = await this.prisma.lawyer.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!lawyer) {
        throw new NotFoundException('Advogado não encontrado');
      }

      const scoreRelevance = await this.prisma.report.findMany({
        where: { 
          lawyer_id: userId,
          confidence_score: { not: null }
         },
        select: {
          id: true,
          case: { select: {title: true}},
          confidence_score: true,
          category_detected: true,
        },
        take: 3,
        orderBy: {
          confidence_score: 'desc'
        }
      });

      return scoreRelevance.map((report) => ({
        id: report.id,
        title: report.case.title,
        confidence_score: report.confidence_score,
        category_detected: report.category_detected,
      }));
    }
    throw new BadRequestException('Role inválida');
  }
}
