import { Global, Module } from '@nestjs/common';
import { CreateCustomerService } from '@modules/payments/service/customer/create.service';
import { StripeProvider } from '@m/payments/provider/stripe.provider';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { CreateCustomerController } from '@m/payments/controllers/customer/create.controller';
import { UpdateCustomersService } from '@modules/payments/service/customer/update.service';
import { UpdateCustomersController } from '../controllers/customer/update.controller';
import { ListAllPlansController } from '../controllers/products/list-all-plans.controller';
import { ListAllPlansService } from '../service/product/list-all-plans.service';
import { ListOnePlanController } from '../controllers/products/list-one-plan.controller';
import { ListOnePlanService } from '../service/product/list-one-plan.service';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [
    CreateCustomerController,
    UpdateCustomersController,
    ListAllPlansController,
    ListOnePlanController,
  ],
  providers: [
    CreateCustomerService,
    ListAllPlansService,
    ListOnePlanService,
    StripeProvider,
    UpdateCustomersService,
  ],
  exports: [],
})
export class PaymentModule {}
