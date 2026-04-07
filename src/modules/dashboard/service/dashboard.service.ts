import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
      }
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
      }
    },
  },
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getCitizenReports(userId: string, role: string, page = 1) {
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
          select: DASHBOARD_FIELDS.citizen.report.select,
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
}
