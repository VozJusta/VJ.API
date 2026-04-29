import { Global, Module } from '@nestjs/common';
import { CreateCustomerService } from '@modules/payments/service/customer.config';
import { StripeProvider } from '@m/payments/provider/stripe.provider';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { CreateCustomerController } from '../controllers/customer/create.controller';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [CreateCustomerController],
  providers: [CreateCustomerService, StripeProvider],
  exports: [],
})
export class PaymentModule {}
