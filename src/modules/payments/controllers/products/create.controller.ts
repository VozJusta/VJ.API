import { CreateProductService } from '@modules/payments/service/products/create-product.service';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Stripe } from 'stripe';

@Controller('products')
export class CreateProductController {
  constructor(private readonly createProductService: CreateProductService) {}

  @Post()
  @HttpCode(201)
  async createProduct(@Body('email') email: string) {
    return await this.createProductService.createProduct(email)
  }
}
