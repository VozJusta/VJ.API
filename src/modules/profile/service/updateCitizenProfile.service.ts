import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCitizenDTO } from '@m/profile/dto/update-citizen.dto';

@Injectable()
export class UpdateCitizenProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async updateCitizen(userId: string, role: string, update: UpdateCitizenDTO) {
    const userRole = role?.toLowerCase?.() ?? '';

    if (userRole !== 'citizen') {
      throw new ForbiddenException('Role inválida');
    }

    const citizen = await this.prisma.citizen.findUnique({
      where: { id: userId },
      select: {
        id: true,
        cpf: true,
        cnpj: true,
      },
    });

    if (!citizen) {
      throw new NotFoundException('Cidadão não encontrado');
    }

    const profileHasCpf = !!citizen.cpf?.trim();
    const profileHasCnpj = !!citizen.cnpj?.trim();

    if (profileHasCpf && profileHasCnpj) {
      throw new BadRequestException(
        'Perfil inválido: CPF e CNPJ cadastrados ao mesmo tempo',
      );
    }

    if (!profileHasCpf && !profileHasCnpj) {
      throw new BadRequestException('Perfil sem CPF ou CNPJ cadastrado');
    }

    const hasCpfUpdate = update.cpf !== undefined;
    const hasCnpjUpdate = update.cnpj !== undefined;

    if (hasCpfUpdate && hasCnpjUpdate) {
      throw new BadRequestException('Envie apenas CPF ou CNPJ, não ambos');
    }

    if (profileHasCpf && hasCnpjUpdate) {
      throw new BadRequestException('Este perfil usa CPF, não CNPJ');
    }

    if (profileHasCnpj && hasCpfUpdate) {
      throw new BadRequestException('Este perfil usa CNPJ, não CPF');
    }

    const data: Record<string, string | undefined> = {};

    if (update.fullName !== undefined) {
      data.full_name = update.fullName;
    }

    if (update.email !== undefined) {
      data.email = update.email;
    }

    if (update.phone !== undefined) {
      data.phone = update.phone;
    }

    if (profileHasCpf && hasCpfUpdate) {
      data.cpf = update.cpf;
    }

    if (profileHasCnpj && hasCnpjUpdate) {
      data.cnpj = update.cnpj;
    }

    const updateUser = await this.prisma.citizen.update({
      where: { id: userId },
      data,
    });

    if (profileHasCpf) {
      return {
        id: updateUser.id,
        full_name: updateUser.full_name,
        email: updateUser.email,
        phone: updateUser.phone,
        cpf: updateUser.cpf,
      };
    } else {
      return {
        id: updateUser.id,
        full_name: updateUser.full_name,
        email: updateUser.email,
        phone: updateUser.phone,
        cnpj: updateUser.cnpj,
      };
    }
  }
}
