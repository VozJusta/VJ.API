import { ListOnePlanService } from '@modules/payments/service/product/list-one-plan.service';
import { Controller, Get, HttpCode, Param } from '@nestjs/common';

@Controller('plans')
export class ListOnePlanController {
  constructor(
    private readonly listOnePlanService: ListOnePlanService,
  ) {}

  @Get(':id')
  @HttpCode(200)
  async listOnePlan(@Param('id') id: string) {
    return await this.listOnePlanService.listOnePlan(id);
  }
}
