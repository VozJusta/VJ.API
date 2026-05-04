import { PrismaService } from '@modules/prisma/service/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ShowProfile {
  constructor(private readonly prisma: PrismaService) {}

  async showProfileByRole(userId: string, role: string) {
    const userRole = role.toLowerCase();

    if (userRole === 'citizen') {
      const citizen = await this.prisma.citizen.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!citizen) {
        throw new NotFoundException('Cidadão não encontrado');
      }

      const showInfoCitizen = await this.prisma.citizen.findFirst({
        where: { id: userId },
        select: {
          id: true,
          full_name: true,
          email: true,
          cpf: true,
          phone: true,
        },
      });

      return showInfoCitizen;
    }

    if (userRole === 'lawyer') {
      const lawyer = await this.prisma.lawyer.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!lawyer) {
        throw new NotFoundException('Advogado não encontrado');
      }
    }
  }
}
