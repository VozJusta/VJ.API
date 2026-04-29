import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CustomerConfigService } from '../../service/customer.config';

@Controller()
export class CreateCustomerController {
  constructor(private readonly customer: CustomerConfigService) {}
  @Post()
  @HttpCode(201)
  async createCustomer(@Body('email') email: string) {
    return await this.customer.configCustomer(email);
  }
}
