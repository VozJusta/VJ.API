import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { CitizenService } from '@modules/citizen/service/citizen.service';
import { CreateCitizenDTO } from '@modules/citizen/dto/create-citizen.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SecurityTokenInterceptor } from '@m/auth/interceptors/security-token.interceptor';

@ApiTags('Citizen')
@Controller('citizen')
export class CitizenController {
  constructor(private readonly citizenService: CitizenService) {}

  @Post()
  @UseInterceptors(SecurityTokenInterceptor)
  @ApiBody({
    description: 'Criação do usuário',
    required: true,
    schema: {
      example: {
        fullName: 'Pedro Sales',
        cpf: '123.456.789-00',
        cnpj: '12.345.678/0001-90',
        phone: '11 99999-9999',
        email: 'pedro@gmail.com',
        password: '@Za12345678',
        billingType: 'Monthly',
        namePlan: 'Plano Inicial',
      },
    },
  })
  @ApiResponse({
    description: 'Retorno da criação do usuário',
    status: 201,
    schema: {
      example: {
        validated: true,
        sub: '47ff0575-8976-4316-877d-936a2b1d478c',
        role: 'Citizen',
        email: 'pedro@gmail.com',
        full_name: 'Pedro Sales',
        loggedWithGoogle: false,
        subscription: {
          plan: {
            type: 'FREE',
            billing_type: 'Monthly',
            name: 'Plano Inicial',
          },
        },
      },
    },
    headers: {
      'x-security-token': {
        description: 'x-security-token para autenticação',
        schema: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  async createCitizen(@Body() body: CreateCitizenDTO) {
    return await this.citizenService.create(body);
  }
}
