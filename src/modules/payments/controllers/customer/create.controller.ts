import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateCustomerService } from '../../service/costumer/create.service';
import { AuthTokenGuardAccess } from '@modules/auth/guard/access-token.guard';
import { RequestUser } from '@modules/common/interfaces/interfaces';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('customers')
export class CreateCustomerController {
  constructor(private readonly customer: CreateCustomerService) {}
  @Post()
  @HttpCode(201)
  @UseGuards(AuthTokenGuardAccess)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token do usuário autenticado',
    required: true,
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({
    summary: 'Cria um novo cliente no Stripe',
    description:
      'Cria um cliente no Stripe usando os dados do usuário autenticado (nome e email). Valida se o cliente já existe e associa o ID ao usuário no banco de dados.',
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente criado com sucesso no Stripe.',
    schema: {
      example: {
        id: 'cus_123456789',
        name: 'João Silva',
        email: 'joao@example.com',
        createdAt: 1714761600,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Token ausente, inválido ou usuário não encontrado no banco de dados.',
  })
  @ApiBadRequestResponse({
    description:
      'Cliente já existe, email obrigatório faltando, ou erro ao criar cliente.',
  })
  async createCustomer(@Req() req: RequestUser) {
    return await this.customer.CreateCustomer(
      req.user.fullName || '',
      req.user.email || '',
    );
  }
}
