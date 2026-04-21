import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { LawyerService } from '@m/lawyer/service/lawyer.service';
import { CreateLawyerDTO } from '@m/lawyer/dto/create-lawyer.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SecurityTokenInterceptor } from '@m/auth/interceptors/security-token.interceptor';
@ApiTags('Lawyer')
@Controller('lawyer')
export class LawyerController {
  constructor(private readonly lawyerService: LawyerService) {}

  @Post()
  @UseInterceptors(SecurityTokenInterceptor)
  @ApiBody({
    description: 'Criação de advogado',
    required: true,
    schema: {
      example: {
        fullName: 'Thiago Menezes',
        cpf: '123.456.789-00',
        oabNumber: '123456',
        oabState: 'SP',
        specialization: 'Tax',
        phone: '11 99999-9999',
        email: 'thiago@gmail.com',
        password: '@Za12345678',
        billingType: 'Monthly',
        namePlan: 'Plano Adv Premium',
      },
    },
  })
  @ApiResponse({
    description: 'Retorno da criação do lawyer',
    status: 201,
    schema: {
      example: {
        validated: true,
        sub: '47ff0575-8976-4316-877d-936a2b1d478c',
        role: 'Lawyer',
        email: 'thiago@gmail.com',
        full_name: 'Thiago Menezes',
        loggedWithGoogle: false,
        subscription: {
          plan: {
            type: 'FREE',
            billing_type: 'Monthly',
            name: 'Plano Adv Premium',
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
  async createLawyer(@Body() body: CreateLawyerDTO) {
    return await this.lawyerService.create(body);
  }
}
