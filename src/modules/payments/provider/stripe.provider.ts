import { InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

export const StripeProvider = {
  provide: 'STRIPE_CLIENT',
  useFactory: () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey || secretKey.trim() === '') {
      throw new InternalServerErrorException(
        'STRIPE_SECRET_KEY não configurada',
      );
    }

    return new Stripe(secretKey);
  },
};
