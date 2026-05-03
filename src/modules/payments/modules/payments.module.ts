import { Global, Module } from '@nestjs/common';
import { CreateCustomerService } from '@modules/payments/service/costumer/create.service';
import { StripeProvider } from '@m/payments/provider/stripe.provider';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { CreateCustomerController } from '@m/payments/controllers/customer/create.controller';
import { UpdateCustomersService } from '@m/payments/service/costumer/update.service';
import { UpdateCustomersController } from '../controllers/customer/update.controller';
import { ListAllPlansController } from '../controllers/products/list-all-plans.controller';
import { ListAllPlansService } from '../service/product/list-all-plans.service';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [
    CreateCustomerController,
    UpdateCustomersController,
    ListAllPlansController,
  ],
  providers: [
    CreateCustomerService,
    ListAllPlansService,
    StripeProvider,
    UpdateCustomersService,
  ],
  exports: [],
})
export class PaymentModule {}
