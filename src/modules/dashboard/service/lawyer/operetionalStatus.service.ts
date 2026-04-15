import { PrismaService } from "@modules/prisma/service/prisma.service";
import { NotFoundException, BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class OperationalStatusService {
  constructor(private readonly prisma: PrismaService) {}

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
      }>(
        (acc, report) => {
          const status = report.status.toLowerCase();
          const total = report._count.status;

          if (status === 'pending') acc.pending = total;
          if (status === 'refused') acc.refused = total;
          if (status === 'accepted') acc.accepted = total;

          return acc;
        },
        {
          pending: 0,
          refused: 0,
          accepted: 0,
        },
      );

      return counts;
    }

    throw new BadRequestException('Role inválida');
  }
}
