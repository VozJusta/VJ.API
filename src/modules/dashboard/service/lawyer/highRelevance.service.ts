import { PrismaService } from "@modules/prisma/service/prisma.service";
import { NotFoundException, BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class HighRelevanceService {
  constructor(private readonly prisma: PrismaService) {}

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
          confidence_score: { not: null },
        },
        select: {
          id: true,
          confidence_score: true,
          category_detected: true,
        },
        take: 3,
        orderBy: {
          confidence_score: 'desc',
        },
      });

      return scoreRelevance;
    }
    throw new BadRequestException('Role inválida');
  }
}
