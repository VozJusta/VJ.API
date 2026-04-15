import { Put, Body, Headers, Controller } from '@nestjs/common';
import { CompleteCitizenRegisterDTO } from '@m/auth/dto/complete-citizen-register.dto';
import { CompleteLawyerRegisterDTO } from '@m/auth/dto/complete-lawyer-register.dto';
import { CititzenInformationService } from '@m/auth/service/citizenInformation.service';
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LawyerInformationService } from '@m/auth/service/lawyerInformation.service';

@ApiTags('Auth')
@Controller('complete')
export class CompleteController {
  constructor(
    private readonly authService: CititzenInformationService,
    private readonly lawyerInformationService: LawyerInformationService,
  ) {}
  @Put('complete/citizen')
  @ApiOperation({
    summary: 'Completa o cadastro do cidadão após validação de email',
  })
  @ApiHeader({
    name: 'x-security-token',
    description: 'Token temporário retornado na autenticação inicial',
    required: true,
  })
  @ApiBody({
    type: CompleteCitizenRegisterDTO,
    description: 'Dados complementares para finalizar o cadastro de cidadão',
    examples: {
      default: {
        summary: 'Cadastro de cidadão',
        value: {
          cpf: '12345678901',
          phone: '11999998888',
          password: '@Za12345678',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cadastro do cidadão concluído com sucesso',
    schema: { example: { message: 'Dados atualizados com sucesso' } },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido/expirado ou usuário sem permissão',
    schema: {
      example: {
        statusCode: 401,
        message: 'Usuário não permitido',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Dados já cadastrados',
    schema: {
      example: {
        statusCode: 409,
        message: 'Dados já cadastrados',
        error: 'Conflict',
      },
    },
  })
  async completeCitizenInformation(
    @Body() body: CompleteCitizenRegisterDTO,
    @Headers('x-security-token') token: string,
  ) {
    return await this.authService.completeCitizenInformation(body, token);
  }
  @Put('complete/lawyer')
  @ApiOperation({
    summary: 'Completa o cadastro do advogado após validação de email',
  })
  @ApiHeader({
    name: 'x-security-token',
    description: 'Token temporário retornado na autenticação inicial',
    required: true,
  })
  @ApiBody({
    type: CompleteLawyerRegisterDTO,
    description: 'Dados complementares para finalizar o cadastro de advogado',
    examples: {
      default: {
        summary: 'Cadastro de advogado',
        value: {
          cpf: '12345678901',
          oabNumber: '123456',
          oabState: 'SP',
          specialization: 'Civil',
          phone: '11999998888',
          password: '@Za12345678',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cadastro do advogado concluído com sucesso',
    schema: { example: { message: 'Dados atualizados com sucesso' } },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido/expirado ou usuário sem permissão',
    schema: {
      example: {
        statusCode: 401,
        message: 'Usuário não permitido',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Dados já cadastrados',
    schema: {
      example: {
        statusCode: 409,
        message: 'Dados já cadastrados',
        error: 'Conflict',
      },
    },
  })
  async completeLayerInformation(
    @Body() body: CompleteLawyerRegisterDTO,
    @Headers('x-security-token') token: string,
  ) {
    return await this.lawyerInformationService.completeLawyerInformation(body, token);
  }
}
