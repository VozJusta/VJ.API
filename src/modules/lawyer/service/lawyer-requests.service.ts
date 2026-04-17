import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status } from 'generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/service/prisma.service';
import { RequestsStatusDTO } from '../dto/requests-status.dto';

@Injectable()
export class LawyerRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async requestsByStatus(
    userId: string,
    role: string,
    status: RequestsStatusDTO,
  ) {
    const userRole = role.toLowerCase();
    const reportStatus = status?.status;

    if (!reportStatus) {
      throw new BadRequestException('Status é obrigatório');
    }

    if (!Object.values(Status).includes(reportStatus)) {
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

      const reportsByStatus = await this.prisma.report.findMany({
        where: { lawyer_id: userId, case: { status: reportStatus } },
        select: {
          id: true,
          user: {
            select: { full_name: true },
          },
          category_detected: true,
          case: { select: { status: true } },
          created_at: true,
        },
      });

      return reportsByStatus.map(({ user, case: reportCase, ...report }) => ({
        ...report,
        clientName: user.full_name,
        statusCase: reportCase.status,
        created_at: report.created_at.toISOString().split('T')[0],
      }));
    }

    throw new BadRequestException(
      'Apenas advogados podem filtrar solicitações por status',
    );
  }
}
