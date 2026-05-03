import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { ListAllPlansService } from '@modules/payments/service/product/list-all-plans.service';
import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
@Controller('plans')
export class ListAllPlansController {
  constructor(private readonly listAllPlansService: ListAllPlansService) {}

  @Get()
  @HttpCode(200)
  async listAllPlans() {
    return await this.listAllPlansService.listAllPlans();
  }
}
