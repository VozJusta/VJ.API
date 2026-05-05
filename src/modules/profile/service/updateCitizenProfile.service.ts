import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCitizenDTO } from '@m/profile/dto/update-citizen.dto';
import { CpfNumberValidation } from '@modules/validation/service/cpf-number-validation.service';
import { CnpjNumberValidation } from '@modules/validation/service/cnpj-number-validation.service';
import { EmailValidationService } from '@modules/validation/service/email-validation.service';
import {
  ensureUniqueAcrossProfiles,
  ensureValidCnpj,
  ensureValidCpf,
  ensureValidEmail,
} from '@m/profile/helpers/profile-validation.helpers';

@Injectable()
export class UpdateCitizenProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cpfValidation: CpfNumberValidation,
    private readonly cnpjValidation: CnpjNumberValidation,
    private readonly emailValidation: EmailValidationService,
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

    await ensureValidCpf(
      this.cpfValidation,
      hasCpfUpdate ? update.cpf : undefined,
    );

    await ensureValidCnpj(
      this.cnpjValidation,
      hasCnpjUpdate ? update.cnpj : undefined,
    );

    if (profileHasCpf && hasCnpjUpdate) {
      throw new BadRequestException('Este perfil usa CPF, não CNPJ');
    }

    if (profileHasCnpj && hasCpfUpdate) {
      throw new BadRequestException('Este perfil usa CNPJ, não CPF');
    }

    await ensureValidEmail(this.emailValidation, update.email);

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

    await ensureUniqueAcrossProfiles(
      this.prisma,
      'email',
      update.email,
      userId,
      'Email já cadastrado em outro usuário',
    );

    await ensureUniqueAcrossProfiles(
      this.prisma,
      'phone',
      update.phone,
      userId,
      'Telefone já cadastrado em outro usuário',
    );
    await ensureUniqueAcrossProfiles(
      this.prisma,
      'cpf',
      hasCpfUpdate ? update.cpf : undefined,
      userId,
      'CPF já cadastrado em outro usuário',
    );

    await ensureUniqueAcrossProfiles(
      this.prisma,
      'cnpj',
      hasCnpjUpdate ? update.cnpj : undefined,
      userId,
      'CNPJ já cadastrado em outro usuário',
    );

    const updateUser = await this.prisma.citizen.update({
      where: { id: userId },
      data,
    });

    return profileHasCpf
      ? {
          id: updateUser.id,
          full_name: updateUser.full_name,
          email: updateUser.email,
          phone: updateUser.phone,
          cpf: updateUser.cpf,
        }
      : {
          id: updateUser.id,
          full_name: updateUser.full_name,
          email: updateUser.email,
          phone: updateUser.phone,
          cnpj: updateUser.cnpj,
        };
  }
}
