import { BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/service/prisma.service';
import { CpfNumberValidation } from '@modules/validation/service/cpf-number-validation.service';
import { CnpjNumberValidation } from '@modules/validation/service/cnpj-number-validation.service';
import { EmailValidationService } from '@modules/validation/service/email-validation.service';

type ProfilePrisma = Pick<PrismaService, 'citizen' | 'lawyer'>;

export async function ensureValidEmail(
  emailValidation: EmailValidationService,
  email?: string,
) {
  if (email !== undefined && !(await emailValidation.validate(email))) {
    throw new BadRequestException('Email inválido');
  }
}

export async function ensureValidCpf(
  cpfValidation: CpfNumberValidation,
  cpf?: string,
) {
  if (cpf !== undefined && !(await cpfValidation.validate(String(cpf)))) {
    throw new BadRequestException('CPF inválido');
  }
}

export async function ensureValidCnpj(
  cnpjValidation: CnpjNumberValidation,
  cnpj?: string,
) {
  if (cnpj === undefined) {
    return;
  }

  try {
    const result = await cnpjValidation.validate(String(cnpj));

    if (!result) {
      throw new BadRequestException('CNPJ inválido');
    }
  } catch {
    throw new BadRequestException('CNPJ inválido');
  }
}

export async function ensureUniqueAcrossProfiles(
  prisma: ProfilePrisma,
  field: 'email' | 'phone' | 'cpf' | 'cnpj',
  value: string | undefined,
  userId: string,
  message: string,
) {
  if (value === undefined) {
    return;
  }

  const [conflictCitizen, conflictLawyer] = await Promise.all([
    prisma.citizen.findFirst({
      where: { [field]: value, NOT: { id: userId } },
      select: { id: true },
    }),
    prisma.lawyer.findFirst({
      where: { [field]: value, NOT: { id: userId } },
      select: { id: true },
    }),
  ]);

  if (conflictCitizen || conflictLawyer) {
    throw new ConflictException(message);
  }
}

export async function ensureUniqueLawyerOab(
  prisma: Pick<PrismaService, 'lawyer'>,
  oabNumber: string | undefined,
  userId: string,
) {
  if (oabNumber === undefined) {
    return;
  }

  const conflict = await prisma.lawyer.findFirst({
    where: { oab_number: oabNumber, NOT: { id: userId } },
    select: { id: true },
  });

  if (conflict) {
    throw new ConflictException('OAB já cadastrado em outro advogado');
  }
}