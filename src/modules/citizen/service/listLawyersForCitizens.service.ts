import { PrismaService } from '@modules/prisma/service/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ListLawyersForCitizens {
  constructor(private readonly prisma: PrismaService) {}

  async listLawyers(userId: string, role: string, lawyerId: string) {
    const userRole = role.toLowerCase();

    if (userRole === 'citizen') {
      const citizen = await this.prisma.citizen.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if(!citizen) {
        throw new NotFoundException('Cidadão não encontrado');
      }


    }
  }
}
