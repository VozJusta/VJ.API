import { Inject, Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

@Injectable()
export class ListAllPlansService {
  constructor(
    @Inject('STRIPE_CLIENT')
    private readonly stripeProvider: Stripe,
  ) {}

  async listAllPlans() {
    const products = await this.stripeProvider.products.list({
      expand: ['data.default_price'],
    });
    return products.data.map((product) => {
      const defaultPrice =
        product.default_price && typeof product.default_price !== 'string'
          ? product.default_price
          : null;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        interval: defaultPrice?.recurring?.interval || null,
        amount: defaultPrice?.unit_amount
          ? `R$ ${Number(defaultPrice.unit_amount / 100).toFixed(2)}`
          : null,
        role: product.metadata.role,
        planType: product.metadata.plan_type,
      };
    });
  }
}
