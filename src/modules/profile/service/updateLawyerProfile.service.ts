import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateLawyerDTO } from '../dto/update-lawyer.dto';
import { CpfNumberValidation } from '@modules/validation/service/cpf-number-validation.service';
import { CnpjNumberValidation } from '@modules/validation/service/cnpj-number-validation.service';

@Injectable()
export class UpdateLawyerProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cpfValidation: CpfNumberValidation,
    private readonly cnpjValidation: CnpjNumberValidation,
  ) {}

  async updateLawyer(userId: string, role: string, update: UpdateLawyerDTO) {
    const userRole = role?.toLowerCase?.() ?? '';

    if (userRole !== 'lawyer') {
      throw new ForbiddenException('Role inválida');
    }

    const lawyer = await this.prisma.lawyer.findUnique({
      where: { id: userId },
      select: {
        id: true,
        cpf: true,
        cnpj: true,
      },
    });

    if (!lawyer) {
      throw new NotFoundException('Advogado não encontrado');
    }

    const profileHasCpf = !!lawyer.cpf?.trim();
    const profileHasCnpj = !!lawyer.cnpj?.trim();

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

    if (profileHasCpf && hasCpfUpdate) {
      data.cpf = update.cpf;
    }

    if (profileHasCnpj && hasCnpjUpdate) {
      data.cnpj = update.cnpj;
    }

    if (update.email !== undefined) {
      data.email = update.email;
    }

    if (update.phone !== undefined) {
      data.phone = update.phone;
    }

    if (update.bio !== undefined) {
      data.bio = update.bio;
    }

    if (update.specialization !== undefined) {
      data.specialization = update.specialization;
    }

    if (update.lawyerStatus !== undefined) {
      data.lawyer_status = update.lawyerStatus;
    }

    if (update.oabNumber !== undefined) {
      data.oab_number = update.oabNumber;
    }

    if (update.oabState !== undefined) {
      data.oab_state = update.oabState;
    }

    if (update.email !== undefined) {
      const [conflictLawyer, conflictCitizen] = await Promise.all([
        this.prisma.lawyer.findFirst({
          where: { email: update.email, NOT: { id: userId } },
          select: { id: true },
        }),
        this.prisma.citizen.findFirst({
          where: { email: update.email, NOT: { id: userId } },
          select: { id: true },
        }),
      ]);

      if (conflictLawyer || conflictCitizen) {
        throw new ConflictException('Email já cadastrado em outro usuário');
      }
    }

    if (update.phone !== undefined) {
      const [conflictLawyer, conflictCitizen] = await Promise.all([
        this.prisma.lawyer.findFirst({
          where: { phone: update.phone, NOT: { id: userId } },
          select: { id: true },
        }),
        this.prisma.citizen.findFirst({
          where: { phone: update.phone, NOT: { id: userId } },
          select: { id: true },
        }),
      ]);

      if (conflictLawyer || conflictCitizen) {
        throw new ConflictException('Telefone já cadastrado em outro usuário');
      }
    }

    if (hasCpfUpdate) {
      const [conflictLawyer, conflictCitizen] = await Promise.all([
        this.prisma.lawyer.findFirst({
          where: { cpf: update.cpf, NOT: { id: userId } },
          select: { id: true },
        }),
        this.prisma.citizen.findFirst({
          where: { cpf: update.cpf, NOT: { id: userId } },
          select: { id: true },
        }),
      ]);

      if (conflictLawyer || conflictCitizen) {
        throw new ConflictException('CPF já cadastrado em outro usuário');
      }
    }

    if (hasCnpjUpdate) {
      const [conflictLawyer, conflictCitizen] = await Promise.all([
        this.prisma.lawyer.findFirst({
          where: { cnpj: update.cnpj, NOT: { id: userId } },
          select: { id: true },
        }),
        this.prisma.citizen.findFirst({
          where: { cnpj: update.cnpj, NOT: { id: userId } },
          select: { id: true },
        }),
      ]);

      if (conflictLawyer || conflictCitizen) {
        throw new ConflictException('CNPJ já cadastrado em outro usuário');
      }
    }

    if (update.oabNumber !== undefined) {
      const conflict = await this.prisma.lawyer.findFirst({
        where: { oab_number: update.oabNumber, NOT: { id: userId } },
        select: { id: true },
      });

      if (conflict) {
        throw new ConflictException('OAB já cadastrado em outro advogado');
      }
    }

    const updateUser = await this.prisma.lawyer.update({
      where: { id: userId },
      data,
    });

    if (profileHasCpf) {
      return {
        id: updateUser.id,
        full_name: updateUser.full_name,
        bio: updateUser.bio,
        cpf: updateUser.cpf,
        specialization: updateUser.specialization,
        lawyer_status: updateUser.lawyer_status,
        oab_number: updateUser.oab_number,
        oab_state: updateUser.oab_state,
        phone: updateUser.phone,
        email: updateUser.email,
      };
    } else if (profileHasCnpj) {
      return {
        id: updateUser.id,
        full_name: updateUser.full_name,
        bio: updateUser.bio,
        cnpj: updateUser.cnpj,
        specialization: updateUser.specialization,
        lawyer_status: updateUser.lawyer_status,
        oab_number: updateUser.oab_number,
        oab_state: updateUser.oab_state,
        phone: updateUser.phone,
        email: updateUser.email,
      };
    }
  }
}
