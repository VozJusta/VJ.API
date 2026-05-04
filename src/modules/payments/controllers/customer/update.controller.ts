import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import { UpdateCustomersService } from '@modules/payments/service/costomer/update.service';
import { Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('customers')
export class UpdateCustomersController {
  constructor(readonly updateCustomerService: UpdateCustomersService) {}
  @Patch(':id')
  @UseGuards(AuthTokenGuardAccess)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token do usuário autenticado',
    required: true,
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do cliente no Stripe (customerId)',
    example: 'cus_123456789',
    required: true,
  })
  @ApiOperation({
    summary: 'Atualiza dados de um cliente no Stripe',
    description:
      'Atualiza o nome e email de um cliente existente no Stripe, sincronizando os dados com o banco de dados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente atualizado com sucesso.',
    schema: {
      example: {
        stripeCustomerId: 'cus_123456789',
        name: 'João Silva Updated',
        email: 'joao.updated@example.com',
        updatedAt: '2026-05-03T19:50:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Token ausente, inválido, usuário não encontrado ou cliente não existe no Stripe.',
  })
  @ApiBadRequestResponse({
    description: 'Dados insuficientes para atualização do cliente.',
  })
  async updateCustomer(@Param('id') id: string, @Req() req: RequestUser) {
    return await this.updateCustomerService.updateCustomer(
      id,
      req.user.fullName || '',
      req.user.email || '',
    );
  }
}
