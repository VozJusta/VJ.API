import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/service/prisma.service';
import { PaginationReportsDTO } from '../dto/pagination-reports.dto';
import { LawyerAnalyticsResponseDTO } from '../dto/lawyer-analytics.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async listReportsByCitizen(
    userId: string,
    role: string,
    pagination: PaginationReportsDTO,
  ) {
    const userRole = role.toLowerCase();
    const page = pagination.page ?? 1;
    const pageSize = Math.min(pagination.pageSize ?? 2, 10);

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('Página inválida');
    }

    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new BadRequestException('PageSize inválido');
    }

    const skip = (page - 1) * pageSize;

    //Cidadão
    if (userRole === 'citizen') {
      const citizen = await this.prisma.citizen.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!citizen) {
        throw new NotFoundException('Cidadão não encontrado');
      }

      const [reports, totalReports] = await this.prisma.$transaction([
        this.prisma.report.findMany({
          where: { user_id: userId },
          select: {
            id: true,
            category_detected: true,
            status: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: pageSize,
        }),
        this.prisma.report.count({
          where: { user_id: userId },
        }),
      ]);

      const totalPages = Math.ceil(totalReports / pageSize);

      return {
        role: 'Citizen',
        user: {
          data: reports,
        },
        pagination: {
          page,
          pageSize,
          totalItems: totalReports,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    }

    throw new BadRequestException('Role inválida');
  }

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

      //retorna NotFound porque não tem o reportId referente ao usuário
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

  async getAcceptedRequestAnalytics(
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
        where: { status: 'Accepted' },
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
}
