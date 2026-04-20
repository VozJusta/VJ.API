import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@m/prisma/service/prisma.service';
import { CreateUserDTO } from '@m/user/dto/create-user.dto';
import { hash } from 'bcryptjs';
import { HashingServiceProtocol } from '@m/auth/hash/hashing.service';
import { CpfNumberValidation } from '@m/validation/service/cpf-number-validation.service';
import { CnpjNumberValidation } from '@m/validation/service/cnpj-number-validation.service';

@Injectable()
export class CitizenService {
  constructor(
    private prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,
    private readonly validateCPF: CpfNumberValidation,
    private readonly validateCnpj: CnpjNumberValidation,
  ) {}

  async create(body: CreateUserDTO) {
    const lawyer = await this.prisma.lawyer.findFirst({
      where: { email: body.email },
    });

    if (lawyer) {
      throw new UnauthorizedException('Usuário cadastrado como advogado');
    }

    const existingCitizen = await this.prisma.citizen.findFirst({
      where: {
        OR: [
          {
            cpf: body.cpf,
          },
          {
            phone: body.phone,
          },
          {
            email: body.email,
          },
        ],
      },
    });

    if (existingCitizen) {
      throw new ConflictException('Cidadão já cadastrado');
    }

    const cpfValid = await this.validateCPF.validate(body.cpf);

    if (body.cnpj) {
      const cnpjValid = await this.validateCnpj.validate(body.cnpj);
    }

    if (!cpfValid) {
      throw new NotAcceptableException('CPF inválido');
    }
    const hashedPassword = await this.hashingService.hash(body.password);

    const newUser = await this.prisma.citizen.create({
      data: {
        full_name: body.fullName,
        cpf: body.cpf,
        cnpj: body.cnpj,
        phone: body.phone,
        email: body.email,
        password: hashedPassword,
        subscription: {
          create: {
            plan: {
              create: {
                billing_type: body.billingType,
                max_interviews: 3,
                max_simulation: 0,
                stripe_price_id: 'price_1N8Xo2KqYjYp3sQh7n9v5ZtL',
                name: body.namePlan,
              },
            },
            stripe_subscription_id: 'sub_1N8Xo2KqYjYp3sQh7n9v5ZtL',
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
        cnpj: true,
        phone: true,
        email: true,
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
      },
    });

    'token invalido'

    return {
      validated: true,
      sub: newUser.id,
      role: 'Citizen',
      email: newUser.email,
      full_name: newUser.full_name,
      loggedWithGoogle: false,
      subscription: {
        plan: {
          type: newUser.subscription?.plan.type,
          billing_type: newUser.subscription?.plan.billing_type,
          name: newUser.subscription?.plan.name,
        },
      },
    };
  }
}
