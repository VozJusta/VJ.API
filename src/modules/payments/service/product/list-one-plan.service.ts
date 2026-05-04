import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Stripe } from 'stripe';

@Injectable()
export class ListOnePlanService {
  constructor(
    @Inject('STRIPE_CLIENT')
    private readonly stripeProvider: Stripe,
  ) {}

  async listOnePlan(priceId: string) {
    const price = await this.stripeProvider.prices.retrieve(priceId, {
      expand: ['product'],
    });

    if (!price || !price.product) {
      throw new NotFoundException('Plano não encontrado');
    }

    const product = price.product;

    if (typeof product === 'string') {
      throw new NotFoundException('Produto não encontrado');
    }

    if (product.deleted) {
      throw new NotFoundException('Produto deletado');
    }

    return {
      priceId: price.id,
      id: product.id,
      name: product.name,
      description: product.description,
      interval: price.recurring?.interval || null,
      amount: price.unit_amount
        ? `R$ ${Number(price.unit_amount / 100).toFixed(2)}`
        : null,
      role: product.metadata.role,
      currency: price.currency.toLowerCase(),
      planType: product.metadata.plan_type,
      features: product.metadata.features
        ? product.metadata.features.split(',').map((feature) => feature.trim())
        : [],
    };
  }
}
