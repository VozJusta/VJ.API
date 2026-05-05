import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ShowProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async showProfileByRole(userId: string, role: string) {
    const userRole = role?.toLowerCase?.() ?? '';

    if (userRole === 'citizen') {
      const citizen = await this.prisma.citizen.findUnique({
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

      if (!citizen) {
        throw new NotFoundException('Cidadão não encontrado');
      }

      if (citizen.cpf?.trim()) {
        return {
          id: citizen.id,
          full_name: citizen.full_name,
          email: citizen.email,
          cpf: citizen.cpf,
          avatar_image: citizen.avatar_image,
          phone: citizen.phone,
        };
      }

      if (citizen.cnpj?.trim()) {
        return {
          id: citizen.id,
          full_name: citizen.full_name,
          email: citizen.email,
          cnpj: citizen.cnpj,
          avatar_image: citizen.avatar_image,
          phone: citizen.phone,
        };
      }
    }

    if (userRole === 'lawyer') {
      const lawyer = await this.prisma.lawyer.findUnique({
        where: { id: userId },
        select: {
          id: true,
          full_name: true,
          bio: true,
          cnpj: true,
          cpf: true,
          avatar_image: true,
          specialization: true,
          lawyer_status: true,
          oab_number: true,
          oab_state: true,
          phone: true,
          email: true,
        },
      });

      if (!lawyer) {
        throw new NotFoundException('Advogado não encontrado');
      }

      if (lawyer.cpf?.trim()) {
        return {
          id: lawyer.id,
          full_name: lawyer.full_name,
          bio: lawyer.bio,
          cpf: lawyer.cpf,
          avatar_image: lawyer.avatar_image,
          specialization: lawyer.specialization,
          lawyer_status: lawyer.lawyer_status,
          oab_number: lawyer.oab_number,
          oab_state: lawyer.oab_state,
          phone: lawyer.phone,
          email: lawyer.email,
        };
      }

      if (lawyer.cnpj?.trim()) {
        return {
          id: lawyer.id,
          full_name: lawyer.full_name,
          bio: lawyer.bio,
          cnpj: lawyer.cnpj,
          avatar_image: lawyer.avatar_image,
          specialization: lawyer.specialization,
          lawyer_status: lawyer.lawyer_status,
          oab_number: lawyer.oab_number,
          oab_state: lawyer.oab_state,
          phone: lawyer.phone,
          email: lawyer.email,
        };
      }
    }

    throw new ForbiddenException('Role não autorizada para acessar o perfil');
  }
}

