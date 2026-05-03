import { ListAllPlansService } from '@modules/payments/service/product/list-all-plans.service';
import { Controller, Get, HttpCode,} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('plans')
export class ListAllPlansController {
  constructor(private readonly listAllPlansService: ListAllPlansService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Lista todos os planos disponíveis',
    description:
      'Retorna uma lista paginada de todos os planos com preços associados no Stripe, incluindo nome, descrição, intervalo de cobrança, valor formatado e metadados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos retornada com sucesso.',
    schema: {
      type: 'array',
      example: [
        {
          priceId: 'price_1A2B3C4D5E6F',
          id: 'prod_123ABC',
          name: 'Plano Gratuito',
          description: 'Plano com funcionalidades básicas',
          interval: 'month',
          amount: 'R$ 0,00',
          role: 'citizen',
          planType: 'free',
        },
        {
          priceId: 'price_2X3Y4Z5W6V7U',
          id: 'prod_456DEF',
          name: 'Plano Premium',
          description: 'Acesso completo às funcionalidades',
          interval: 'month',
          amount: 'R$ 99,90',
          role: 'lawyer',
          planType: 'premium',
        },
      ],
    },
  })
  async listAllPlans() {
    return await this.listAllPlansService.listAllPlans();
  }
}
