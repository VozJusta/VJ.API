import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { create } from 'domain';
import { Stripe } from 'stripe';

@Injectable()
export class CreateCustomerService {
  constructor(
    private prisma: PrismaService,
    @Inject('STRIPE_CLIENT')
    private stripeClient: Stripe,
  ) {}

  async CreateCustomer(name: string, email: string) {
    if (!email) {
      throw new UnauthorizedException('Email obrigatório');
    }
    const citizen = await this.prisma.citizen.findUnique({
      where: { email: email },
    });
    const lawyer = await this.prisma.lawyer.findUnique({
      where: { email: email },
    });

    if (!citizen && !lawyer) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    const existingCustomer = await this.stripeClient.customers.list({
      email: email,
      limit: 1,
    });
    if (existingCustomer.data.length > 0) {
      throw new BadRequestException('Cliente já existe');
    }
    const customer = await this.stripeClient.customers.create({
      name: name,
      email: email,
    });
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      createdAt: customer.created,
    };
  }
}
