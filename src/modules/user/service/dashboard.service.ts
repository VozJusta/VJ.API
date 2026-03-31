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
    report: true,
    created_at: true,
  },
  citizen: {
    id: true,
    full_name: true,
    email: true,
    phone: true,
    cpf: true,
    cnpj: true,
    report: true,
    created_at: true,
  },
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileByUserId(userId: string, role: string) {
    const userRole = role.toLowerCase();

    //Advogado
    if (userRole === 'lawyer') {
      const lawyer = await this.prisma.lawyer.findUnique({
        where: { id: userId },
        select: DASHBOARD_FIELDS.lawyer,
      });

      if (!lawyer) {
        throw new NotFoundException('Advogado não encontrado');
      }

      return {
        role: 'Lawyer',
        user: lawyer,
      };
    }

    //Cidadão
    if (userRole === 'citizen') {
      const citizen = await this.prisma.citizen.findUnique({
        where: { id: userId },
        select: DASHBOARD_FIELDS.citizen,
      });

      if (!citizen) {
        throw new NotFoundException('Cidadão não encontrado');
      }

      return {
        role: 'Citizen',
        user: citizen,
      };
    }

    throw new BadRequestException('Role inválida');
  }
}
