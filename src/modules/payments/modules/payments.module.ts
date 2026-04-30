import { Global, Module } from '@nestjs/common';
import { CreateCustomerService } from '@modules/payments/service/costumer/create.service';
import { StripeProvider } from '@m/payments/provider/stripe.provider';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { CreateCustomerController } from '@m/payments/controllers/customer/create.controller';
import { CreateProductService } from '@m/payments/service/products/create-product.service';
import { CreateProductController } from '@m/payments/controllers/products/create.controller';
import { UpdateCustomersService } from '@m/payments/service/costumer/update.service';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [CreateCustomerController, CreateProductController],
  providers: [CreateCustomerService, StripeProvider, CreateProductService, UpdateCustomersService],
  exports: [],
})
export class PaymentModule {}
