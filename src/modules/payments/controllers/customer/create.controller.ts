import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateCustomerService } from '../../service/costumer/create-customer.service';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';

@Controller('customers')
export class CreateCustomerController {
  constructor(private readonly customer: CreateCustomerService) {}
  @Post()
  @HttpCode(201)
  @UseGuards(AuthTokenGuardAccess)
  async createCustomer(@Req() req: RequestUser) {
    return await this.customer.CreateCustomer(
      req.user.fullName || '',
      req.user.email || '',
    );
  }
}
