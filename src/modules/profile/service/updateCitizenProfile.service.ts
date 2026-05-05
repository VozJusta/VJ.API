import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CpfNumberValidation } from '@m/validation/service/cpf-number-validation.service';
import { CnpjNumberValidation } from '@m/validation/service/cnpj-number-validation.service';
import { UpdateCitizenDTO } from '@m/profile/dto/update-citizen.dto';

@Injectable()
export class UpdateCitizenProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cpfValidation: CpfNumberValidation,
    private readonly cnpjValidation: CnpjNumberValidation,
  ) {}

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

    // Validate cpf/cnpj formats using validation services
    if (hasCpfUpdate) {
      const valid = await this.cpfValidation.validate(String(update.cpf));
      if (!valid) {
        throw new BadRequestException('CPF inválido');
      }
    }

    if (hasCnpjUpdate) {
      try {
        const result = await this.cnpjValidation.validate(String(update.cnpj));
        if (!result) {
          throw new BadRequestException('CNPJ inválido');
        }
      } catch (err) {
        throw new BadRequestException('CNPJ inválido');
      }
    }

    if (update.email !== undefined) {
      const [conflictCitizen, conflictLawyer] = await Promise.all([
        this.prisma.citizen.findFirst({
          where: { email: update.email, NOT: { id: userId } },
          select: { id: true },
        }),
        this.prisma.lawyer.findFirst({
          where: { email: update.email, NOT: { id: userId } },
          select: { id: true },
        }),
      ]);

      if (conflictCitizen || conflictLawyer) {
        throw new ConflictException('Email já cadastrado em outro usuário');
      }
    }

    if (update.phone !== undefined) {
      const [conflictCitizen, conflictLawyer] = await Promise.all([
        this.prisma.citizen.findFirst({
          where: { phone: update.phone, NOT: { id: userId } },
          select: { id: true },
        }),
        this.prisma.lawyer.findFirst({
          where: { phone: update.phone, NOT: { id: userId } },
          select: { id: true },
        }),
      ]);

      if (conflictCitizen || conflictLawyer) {
        throw new ConflictException('Telefone já cadastrado em outro usuário');
      }
    }

    if (hasCpfUpdate) {
      const [conflictCitizen, conflictLawyer] = await Promise.all([
        this.prisma.citizen.findFirst({
          where: { cpf: update.cpf, NOT: { id: userId } },
          select: { id: true },
        }),
        this.prisma.lawyer.findFirst({
          where: { cpf: update.cpf, NOT: { id: userId } },
          select: { id: true },
        }),
      ]);

      if (conflictCitizen || conflictLawyer) {
        throw new ConflictException('CPF já cadastrado em outro usuário');
      }
    }

    if (hasCnpjUpdate) {
      const [conflictCitizen, conflictLawyer] = await Promise.all([
        this.prisma.citizen.findFirst({
          where: { cnpj: update.cnpj, NOT: { id: userId } },
          select: { id: true },
        }),
        this.prisma.lawyer.findFirst({
          where: { cnpj: update.cnpj, NOT: { id: userId } },
          select: { id: true },
        }),
      ]);

      if (conflictCitizen || conflictLawyer) {
        throw new ConflictException('CNPJ já cadastrado em outro usuário');
      }
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
    } else if(profileHasCnpj) {
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
