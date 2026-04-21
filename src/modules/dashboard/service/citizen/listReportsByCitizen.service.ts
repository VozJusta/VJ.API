import { PaginationReportsDTO } from '@modules/dashboard/dto/pagination-reports.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/service/prisma.service';

@Injectable()
export class ListReportsByCitizenService {
  constructor(private readonly prisma: PrismaService) { }

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
            case: {
              select: {
                status: true,
              },
            },
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

      const reportsWithStatus = reports.map((report) => ({
        id: report.id,
        category_detected: report.category_detected,
        status: report.case.status,
        created_at: report.created_at,
      }));

      const totalPages = Math.ceil(totalReports / pageSize);

      return {
        role: 'Citizen',
        user: {
          data: reportsWithStatus,
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
