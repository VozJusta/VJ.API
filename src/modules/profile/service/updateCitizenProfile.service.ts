import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
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

  private normalizeOptionalString(value?: string) {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length ? normalized : undefined;
  }

  private normalizeOptionalEmail(value?: string) {
    const normalized = this.normalizeOptionalString(value);
    return normalized?.toLowerCase();
  }

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

    const normalizedUpdate = {
      fullName: this.normalizeOptionalString(update.fullName),
      email: this.normalizeOptionalEmail(update.email),
      phone: this.normalizeOptionalString(update.phone),
      cpf: this.normalizeOptionalString(update.cpf),
      cnpj: this.normalizeOptionalString(update.cnpj),
    };

    const hasCpfUpdate = normalizedUpdate.cpf !== undefined;
    const hasCnpjUpdate = normalizedUpdate.cnpj !== undefined;

    if (hasCpfUpdate && hasCnpjUpdate) {
      throw new BadRequestException('Envie apenas CPF ou CNPJ, não ambos');
    }

    await ensureValidCpf(
      this.cpfValidation,
      hasCpfUpdate ? normalizedUpdate.cpf : undefined,
    );

    await ensureValidCnpj(
      this.cnpjValidation,
      hasCnpjUpdate ? normalizedUpdate.cnpj : undefined,
    );

    if (profileHasCpf && hasCnpjUpdate) {
      throw new BadRequestException('Este perfil usa CPF, não CNPJ');
    }

    if (profileHasCnpj && hasCpfUpdate) {
      throw new BadRequestException('Este perfil usa CNPJ, não CPF');
    }

    await ensureValidEmail(this.emailValidation, normalizedUpdate.email);

    const data: Record<string, string | undefined> = {};

    if (normalizedUpdate.fullName !== undefined) {
      data.full_name = normalizedUpdate.fullName;
    }

    if (normalizedUpdate.email !== undefined) {
      data.email = normalizedUpdate.email;
    }

    if (normalizedUpdate.phone !== undefined) {
      data.phone = normalizedUpdate.phone;
    }

    if (profileHasCpf && hasCpfUpdate) {
      data.cpf = normalizedUpdate.cpf;
    }

    if (profileHasCnpj && hasCnpjUpdate) {
      data.cnpj = normalizedUpdate.cnpj;
    }

    await ensureUniqueAcrossProfiles(
      this.prisma,
      'email',
      normalizedUpdate.email,
      userId,
      'Email já cadastrado em outro usuário',
    );

    await ensureUniqueAcrossProfiles(
      this.prisma,
      'phone',
      normalizedUpdate.phone,
      userId,
      'Telefone já cadastrado em outro usuário',
    );
    await ensureUniqueAcrossProfiles(
      this.prisma,
      'cpf',
      hasCpfUpdate ? normalizedUpdate.cpf : undefined,
      userId,
      'CPF já cadastrado em outro usuário',
    );

    await ensureUniqueAcrossProfiles(
      this.prisma,
      'cnpj',
      hasCnpjUpdate ? normalizedUpdate.cnpj : undefined,
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
