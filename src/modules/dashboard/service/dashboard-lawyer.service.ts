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
          status: 'Accepted',
          lawyer_id: userId,
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

      const statusCounts = await this.prisma.report.groupBy({
        by: ['status'],
        where: {
          lawyer_id: userId,
          status: {
            in: ['Pending', 'Refused', 'Accepted'],
          },
        },
        _count: {
          status: true,
        },
      });

      const counts = statusCounts.reduce<{
        pending: number;
        refused: number;
        accepted: number;
      }>((acc, report) => {
        const status = report.status.toLowerCase();
        const total = report._count.status;

        if (status === 'pending') acc.pending = total;
        if (status === 'refused') acc.refused = total;
        if (status === 'accepted') acc.accepted = total;

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
          //title: true,
          confidence_score: true,
          category_detected: true,
        },
        orderBy: {
          confidence_score: 'desc'
        }
      });

      return scoreRelevance;
    }
    throw new BadRequestException('Role inválida');
  }
}
