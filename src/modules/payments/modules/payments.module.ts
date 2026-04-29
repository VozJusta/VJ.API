import { Global, Module } from '@nestjs/common';
import { CreateCustomerService } from '@modules/payments/service/costumer/create-customer.service';
import { StripeProvider } from '@m/payments/provider/stripe.provider';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { CreateCustomerController } from '../controllers/customer/create.controller';
import { CreateProductService } from '../service/products/create-product.service';
import { CreateProductController } from '../controllers/products/create.controller';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [CreateCustomerController, CreateProductController],
  providers: [CreateCustomerService, StripeProvider, CreateProductService],
  exports: [],
})
export class PaymentModule {}
