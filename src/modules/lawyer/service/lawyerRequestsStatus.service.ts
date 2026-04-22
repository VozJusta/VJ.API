import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status } from 'generated/prisma/enums';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { RequestsStatusDTO } from '@m/lawyer/dto/requests-status.dto';

@Injectable()
export class LawyerRequestsStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async requestsByStatus(
    userId: string,
    role: string,
    status?: RequestsStatusDTO,
  ) {
    const userRole = role.toLowerCase();
    const reportStatus = status?.status;

    if (
      reportStatus !== undefined &&
      !Object.values(Status).includes(reportStatus)
    ) {
      throw new BadRequestException('Status inválido');
    }

    if (userRole === 'lawyer') {
      const lawyer = await this.prisma.lawyer.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!lawyer) {
        throw new NotFoundException('Advogado não encontrado');
      }

      const caseRequestsByStatus = await this.prisma.caseRequest.findMany({
        where: {
          lawyer_id: userId,
          ...(reportStatus !== undefined ? { status: reportStatus } : {}),
        },
        select: {
          id: true,
          status: true,
          created_at: true,
          citizen: {
            select: { full_name: true },
          },
          case: {
            select: {
              reports: {
                select: { category_detected: true },
                orderBy: { created_at: 'desc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      return caseRequestsByStatus.map((caseRequest) => ({
        id: caseRequest.id,
        clientName: caseRequest.citizen.full_name,
        category_detected: caseRequest.case.reports[0]?.category_detected ?? null,
        statusCase: caseRequest.status,
        created_at: caseRequest.created_at.toISOString().split('T')[0],
      }));
    }

    throw new BadRequestException(
      'Apenas advogados podem filtrar solicitações por status',
    );
  }
}
