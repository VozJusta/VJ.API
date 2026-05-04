import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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
          cnpj: true,
          cpf: true,
          avatar_image: true,
          phone: true,
        },
      });

      const cpfExists = showInfoCitizen?.cpf?.trim();
      const cnpjExists = showInfoCitizen?.cnpj?.trim();

      if (cpfExists) {
        return {
          id: showInfoCitizen?.id,
          full_name: showInfoCitizen?.full_name,
          email: showInfoCitizen?.email,
          cpf: showInfoCitizen?.cpf,
          avatar_image: showInfoCitizen?.avatar_image,
          phone: showInfoCitizen?.phone,
        };
      } else if (cnpjExists) {
        return {
          id: showInfoCitizen?.id,
          full_name: showInfoCitizen?.full_name,
          email: showInfoCitizen?.email,
          cnpj: showInfoCitizen?.cnpj,
          avatar_image: showInfoCitizen?.avatar_image,
          phone: showInfoCitizen?.phone,
        };
      } else {
        return {
          id: showInfoCitizen?.id,
          full_name: showInfoCitizen?.full_name,
          email: showInfoCitizen?.email,
          avatar_image: showInfoCitizen?.avatar_image,
          phone: showInfoCitizen?.phone,
        };
      }
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
