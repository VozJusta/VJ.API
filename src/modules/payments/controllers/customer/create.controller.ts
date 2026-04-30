import { CreateCustomerService } from '@modules/payments/service/customer.config';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';


@Controller()
export class CreateCustomerController {
  constructor(private readonly customer: CreateCustomerService) {}
  @Post()
  @HttpCode(201)
  async createCustomer(@Body('email') email: string) {
    return await this.customer.CreateCustomer(email);
  }
}
