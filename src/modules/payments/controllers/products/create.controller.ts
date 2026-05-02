import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import { CreateProductService } from '@modules/payments/service/products/create.service';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Stripe } from 'stripe';

@Controller('plans')
export class CreateProductController {
  constructor(private readonly createProductService: CreateProductService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(AuthTokenGuardAccess)
  async createProduct(@Req() req: RequestUser) {
    return await this.createProductService.createProduct(req.user.email || '');
  }
}
