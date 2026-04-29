import { Controller } from '@nestjs/common';
import { Stripe } from 'stripe';

@Controller('products')
export class CreateProductController {
  constructor(private readonly stripe: Stripe) {}
}
