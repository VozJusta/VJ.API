import { ListOnePlanService } from '@modules/payments/service/product/list-one-plan.service';
import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('plans')
export class ListOnePlanController {
  constructor(
    private readonly listOnePlanService: ListOnePlanService,
  ) {}

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Busca um plano pelo ID do preço no Stripe',
    description:
      'Retorna os dados do plano associado a um priceId válido do Stripe, incluindo nome, descrição, intervalo, valor e metadados do produto.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do preço no Stripe (priceId)',
    example: 'price_123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Plano encontrado com sucesso.',
    schema: {
      example: {
        priceId: 'price_123456789',
        id: 'prod_123456789',
        name: 'Plano Premium',
        description: 'Acesso completo às funcionalidades da plataforma',
        interval: 'month',
        amount: 'R$ 99.90',
        role: 'lawyer',
        currency: 'brl',
        planType: 'premium',
        features: ['feature 1', 'feature 2'],
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Plano ou produto não encontrado, ou produto deletado no Stripe.',
  })
  async listOnePlan(@Param('id') id: string) {
    return await this.listOnePlanService.listOnePlan(id);
  }
}
