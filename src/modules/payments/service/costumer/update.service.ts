import { PrismaService } from "@modules/prisma/service/prisma.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Stripe } from "stripe";

@Injectable()
export class UpdateCustomersService{
    constructor(
        private readonly stripeService: Stripe,
        private readonly prismaService: PrismaService
    ) { }
    async updateCustomer(id: string, name: string, email: string) {
        if (!id && (!name || !email)) {
            throw new UnauthorizedException("Dados insuficientes para atualização do cliente");
        }
        const citizen = await this.prismaService.citizen.findUnique({
            where: { email }
        });
        const lawyer = await this.prismaService.lawyer.findUnique({
            where: { email }
        })

        if (!citizen || !lawyer) {
            throw new UnauthorizedException("Cliente não encontrado");
        }

        const customer = await this.stripeService.customers.retrieve(id);

        if (!customer) {
            throw new UnauthorizedException("Cliente não encontrado no Stripe");
        }
        const updatedCustomer = await this.stripeService.customers.update(id, {
            name,
            email
        });
        return {
            stripeCustomerId: updatedCustomer.id,
            name: updatedCustomer.name,
            email: updatedCustomer.email,
            updatedAt: new Date().toISOString()
        };
    }
}