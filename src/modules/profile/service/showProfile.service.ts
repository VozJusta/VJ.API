import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  ForbiddenException,
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

      const showInfoLawyer = await this.prisma.lawyer.findFirst({
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

      const cpfExists = showInfoLawyer?.cpf?.trim();
      const cnpjExists = showInfoLawyer?.cnpj?.trim();

      if (cpfExists) {
        return {
          id: showInfoLawyer?.id,
          full_name: showInfoLawyer?.full_name,
          bio: showInfoLawyer?.bio,
          cpf: showInfoLawyer?.cpf,
          avatar_image: showInfoLawyer?.avatar_image,
          specialization: showInfoLawyer?.specialization,
          lawyer_status: showInfoLawyer?.lawyer_status,
          oab_number: showInfoLawyer?.oab_number,
          oab_state: showInfoLawyer?.oab_state,
          phone: showInfoLawyer?.phone,
          email: showInfoLawyer?.email,
        };
      } else if (cnpjExists) {
        return {
          id: showInfoLawyer?.id,
          full_name: showInfoLawyer?.full_name,
          bio: showInfoLawyer?.bio,
          cnpj: showInfoLawyer?.cnpj,
          avatar_image: showInfoLawyer?.avatar_image,
          specialization: showInfoLawyer?.specialization,
          lawyer_status: showInfoLawyer?.lawyer_status,
          oab_number: showInfoLawyer?.oab_number,
          oab_state: showInfoLawyer?.oab_state,
          phone: showInfoLawyer?.phone,
          email: showInfoLawyer?.email,
        };
      }
    }

    throw new ForbiddenException('Role não autorizada para acessar o perfil');
    }
  }

