import { PrismaService } from '@modules/prisma/service/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FindLawyerForCitizen {
  constructor(private readonly prisma: PrismaService) {}

  async findLawyerForCitizen(userId: string, role: string, lawyerId: string) {
    const userRole = role.toLowerCase();

    if (userRole === 'citizen') {
      const citizen = await this.prisma.citizen.findFirst({
        where: { id: userId },
        select: { id: true },
      });

      if (!citizen) {
        throw new NotFoundException('Cidadão não encontrado');
      }

      const allInfoLawyer = await this.prisma.lawyer.findFirst({
        where: { id: lawyerId, lawyer_status: 'Verified' },
        select: {
          id: true,
          full_name: true,
          specialization: true,
          avatar_image: true,
          oab_number: true,
          oab_state: true,
          bio: true,
        },
      });

      if(!allInfoLawyer) {
        throw new NotFoundException('Advogado não encontrado');
      }

      return allInfoLawyer
    }

    throw new BadRequestException('Role inválida');
  }
}
