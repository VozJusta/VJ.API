import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/service/prisma.service';

const DASHBOARD_FIELDS = {
  lawyer: {
    id: true,
    full_name: true,
    email: true,
    phone: true,
    cpf: true,
    bio: true,
    avatar_image: true,
    specialization: true,
    lawyer_status: true,
    report: {
      select: {
        id: true,
        category_detected: true,
        status: true,
        created_at: true,
      },
    },
    created_at: true,
  },
  citizen: {
    report: {
      select: {
        id: true,
        category_detected: true,
        status: true,
        created_at: true,
      },
    },
  },
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async listReportsByCitizen(userId: string, role: string, page = 1) {
    const userRole = role.toLowerCase();
    const pageSize = 2;

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('Página inválida');
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

      const totalPages = Math.max(1, Math.ceil(totalReports / pageSize));

      return {
        role: 'Citizen',
        user: {
          report: reports,
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
          lawyer: true,
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
}
