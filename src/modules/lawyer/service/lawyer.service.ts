import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { CreateLawyerDTO } from '@m/lawyer/dto/create-lawyer.dto';
import { hash, hashSync } from 'bcryptjs';
import { OabNumberValidationService } from '@m/validation/service/oab-number-validation.service';
import { ValidateLawyerDTO } from '@m/lawyer/dto/validate-lawyer.dto';
import { HashingServiceProtocol } from '@m/auth/hash/hashing.service';
import { CpfNumberValidation } from '@m/validation/service/cpf-number-validation.service';

@Injectable()
export class LawyerService {
  constructor(
    private prisma: PrismaService,
    private readonly validateOab: OabNumberValidationService,
    private readonly hashingService: HashingServiceProtocol,
    private readonly validateCPF: CpfNumberValidation,
  ) {}

  async create(body: CreateLawyerDTO) {
    const citizen = await this.prisma.citizen.findFirst({
      where: { email: body.email },
    });

    if (citizen) {
      throw new UnauthorizedException('Usuário cadastrado como cidadão');
    }

    const existingLawyer = await this.prisma.lawyer.findFirst({
      where: {
        OR: [
          { cpf: body.cpf },
          {
            oab_number: body.oabNumber,
            oab_state: body.oabState,
          },
          { phone: body.phone },
          { email: body.email },
        ],
      },
    });

    if (existingLawyer) {
      throw new ConflictException('Advogado já cadastrado');
    }

    const hashedPassword = await this.hashingService.hash(body.password);

    const cpfValid = await this.validateCPF.validate(body.cpf);

    if (!cpfValid) {
      throw new NotAcceptableException('CPF inválido');
    }

    const validationOabDTO: ValidateLawyerDTO = {
      nomeAdvo: body.fullName,
      insc: body.oabNumber,
      uf: body.oabState,
    };

    const newLawyer = await this.prisma.lawyer.create({
      data: {
        full_name: body.fullName,
        cpf: body.cpf,
        oab_number: body.oabNumber,
        oab_state: body.oabState,
        specialization: body.specialization,
        phone: body.phone,
        email: body.email,
        password: hashedPassword,
        lawyer_status: 'Verified',
        subscription: {
          create: {
            plan: {
              create: {
                billing_type: body.billingType,
                max_interviews: 3,
                max_simulation: 0,
                name: body.namePlan,
              },
            },
            subscription_status: 'active',
            current_period_end: new Date(
              new Date().setMonth(new Date().getMonth() + 1),
            ),
          },
        },
      },
      select: {
        id: true,
        full_name: true,
        cpf: true,
        oab_number: true,
        oab_state: true,
        subscription: {
          include: {
            plan: {
              select: {
                type: true,
                billing_type: true,
                name: true,
              },
            },
          },
        },
        specialization: true,
        phone: true,
        email: true,
        lawyer_status: true,
      },
    });
    console.log('newLawyer', newLawyer);

    return {
      validated: true,
      sub: newLawyer.id,
      role: 'Lawyer',
      email: newLawyer.email,
      full_name: newLawyer.full_name,
      loggedWithGoogle: false,
      subscription: {
        plan: {
          type: newLawyer.subscription?.plan.type,
          billing_type: newLawyer.subscription?.plan.billing_type,
          name: newLawyer.subscription?.plan.name,
        },
      },
    };
  }
}
