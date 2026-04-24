import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ListLawyersForCitizens {
  constructor(private readonly prisma: PrismaService) {}

  async listLawyers(userId: string, role: string) {
    const userRole = role.toLowerCase();

    if (userRole === 'citizen') {
      const citizen = await this.prisma.citizen.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!citizen) {
        throw new NotFoundException('Cidadão não encontrado');
      }

      const findAllLawers = await this.prisma.lawyer.findMany({
        where: { lawyer_status: 'Verified' },
        select: {
          id: true,
          full_name: true,
          specialization: true,
          avatar_image: true,
          rating: true,
        },
      });

      return findAllLawers;
    }

    throw new BadRequestException('Role inválida');
  }
}
