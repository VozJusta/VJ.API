import { PrismaService } from "@modules/prisma/service/prisma.service";
import { Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Stripe } from "stripe";

@Injectable()
export class CreateProductService {
    constructor(
        private prisma: PrismaService,
        @Inject('STRIPE_CLIENT')
        private stripe: Stripe,
    ) { }

    async createProduct(email: string) {
        if (!email) {
            throw new UnauthorizedException('Email obrigatório');
        }

        const citizen = await this.prisma.citizen.findUnique({
            where: { email: email }
        })

        const lawyer = await this.prisma.lawyer.findUnique({
            where: { email: email }
        })

        if (!citizen && !lawyer) {
            throw new NotFoundException('Usuário não encontrado')
        }

        const existingCustomer = await this.stripe.customers.list({
            email: email,
            limit: 1,
        });

        if(existingCustomer.data.length > 0) {
            throw new UnauthorizedException('Usuário já cadastrado')
        }

        const product = await this.stripe.products.create({
            name: 'SOS Jurídico',
            
        })

        return product
    }
}