import { PrismaService } from '@modules/prisma/service/prisma.service';
import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Stripe } from 'stripe';

@Injectable()
export class CreateCustomerService {
  constructor(
    private prisma: PrismaService,
    @Inject('STRIPE_CLIENT')
    private stripeClient: Stripe,
  ) {}

  async createCustomer(name: string, email: string) {
    try {
      if (!email) {
        throw new UnauthorizedException('Email obrigatório');
      }

      const existingCustomer = await this.stripeClient.customers.list({
        email: email,
        limit: 1,
      });
      if (existingCustomer.data.length > 0) {
        throw new UnauthorizedException('Cliente já existe');
      }

      const citizen = await this.prisma.citizen.findUnique({
        where: { email: email },
      });
      const lawyer = await this.prisma.lawyer.findUnique({
        where: { email: email },
      });

      if (!citizen && !lawyer) {
        throw new NotFoundException('Usuário não encontrado');
      }

      const customer = await this.stripeClient.customers.create({
        name: name,
        email: email,
      });

      if (citizen) {
        await this.prisma.citizen.update({
          where: { email: email },
          data: {
            stripe_customer_id: customer.id,
          },
        });
      } else if (lawyer) {
        await this.prisma.lawyer.update({
          where: { email: email },
          data: {
            stripe_customer_id: customer.id,
          },
        });
      }
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        createdAt: customer.created,
      };
    } catch (error) {
      throw new UnauthorizedException('Erro ao criar cliente: ' + error.message);
    }
  }
}
