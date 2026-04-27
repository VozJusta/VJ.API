import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status } from 'generated/prisma/enums';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { RequestsStatusDTO } from '@m/lawyer/dto/requests-status.dto';
import { PaginationLawyersDTO } from '@modules/citizen/dto/pagination-lawyers.dto';

@Injectable()
export class LawyerRequestsStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async requestsByStatus(
    userId: string,
    role: string,
    status?: RequestsStatusDTO,
    pagination?: PaginationLawyersDTO,
  ) {
    const userRole = role.toLowerCase();
    const reportStatus = status?.status;
    const page = pagination?.page ?? 1;
    const pageSize = Math.min(pagination?.pageSize ?? 2, 10);

    if (
      reportStatus !== undefined &&
      !Object.values(Status).includes(reportStatus)
    ) {
      throw new BadRequestException('Status inválido');
    }

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('Página inválida');
    }

    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new BadRequestException('PageSize inválido');
    }

    const skip = (page - 1) * pageSize;

    if (userRole === 'lawyer') {
      const lawyer = await this.prisma.lawyer.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!lawyer) {
        throw new NotFoundException('Advogado não encontrado');
      }

      const where = {
        lawyer_id: userId,
        ...(reportStatus !== undefined ? { status: reportStatus } : {}),
      };

      const [caseRequestsByStatus, totalItems] = await this.prisma.$transaction([
        this.prisma.caseRequest.findMany({
          where,
          select: {
            id: true,
            status: true,
            created_at: true,
            citizen: {
              select: { full_name: true },
            },
            case: {
              select: {
                title: true,
                reports: {
                  select: { category_detected: true, id: true },
                  orderBy: { created_at: 'desc' },
                  take: 1,
                },
              },
            },
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: pageSize,
        }),
        this.prisma.caseRequest.count({
          where,
        }),
      ]);

      const totalPages = Math.ceil(totalItems / pageSize);

      return {
        data: caseRequestsByStatus.map((caseRequest) => ({
          id: caseRequest.id,
          title: caseRequest.case.title,
          clientName: caseRequest.citizen.full_name,
          category_detected:
            caseRequest.case.reports[0]?.category_detected ?? null,
          statusCase: caseRequest.status,
          reportId: caseRequest.case.reports[0]?.id ?? null,
          created_at: caseRequest.created_at.toISOString().split('T')[0],
        })),
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    }

    throw new BadRequestException(
      'Apenas advogados podem filtrar solicitações por status',
    );
  }
}
