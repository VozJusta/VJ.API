import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { SignInDTO } from '../dto/signIn.dto';
import { SendCodeEmailDTO } from '../dto/sendCode-email.dto';
import { ValidateCodeEmailDTO } from '../dto/validateCode-email.dto';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';
import { VerifyForgotCodeDTO } from '../dto/verify-forgot-code.dto';
import { GoogleAuthGuard } from '../guard/googleAuth.guard';
import { SecurityTokenInterceptor } from '../interceptors/security-token.interceptor';
import { AuthTokenGuard } from '../guard/access-token.guard';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompleteCitizenRegisterDTO } from '../dto/complete-citizen-register.dto';
import { Request } from 'express';
import { CompleteLawyerRegisterDTO } from '../dto/complete-lawyer-register.dto';
import { ChangePasswordDTO } from '../dto/change-password.dto';

interface RequestUser extends Request {
  user: {
    sub: string,
    role: string
  }
}

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('/authenticate')
  @UseInterceptors(SecurityTokenInterceptor)
  @ApiBody({
    description: 'Autenticação do usuário',
    required: true,
    schema: {
      example: {
        email: 'pedro@gmail.com',
        password: '@Za12345678',
      },
    },
  })
  @ApiResponse({
    description: 'Retorno da autenticação',
    status: 201,
    schema: {
      example: {
        validate: true,
        sub: '47ff0575-8976-4316-877d-936a2b1d478c',
        role: 'Citizen | Lawyer',
        email: 'pedro@gmail.com',
        full_name: 'Pedro Sales',
        loggedWithGoogle: false,
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
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Acesso não autorizado',
        error: 'Unauthorized',
      },
    },
  })
  async authenticate(@Body() body: SignInDTO) {
    return await this.authService.authenticate(body);
  }

  @Post('send/email')
  @ApiBody({
    description: 'Rota para enviar email para 2FA',
    required: true,
    schema: {
      example: {
        email: 'xs.salles@gmail.com',
      },
    },
  })
  @ApiResponse({
    description: 'Resposta de sucesso para o envio do email',
    status: 200,
    schema: {
      example: {
        message: 'Código enviado para o email ...',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Verifica se o código já foi utilizado ou se o email é valido',
    schema: {
      example: {
        statusCode: 409,
        message: 'Código já utilizado ou expirado',
        error: 'Conflict',
      },
    },
  })
  async sendEmailCode(@Body() body: SendCodeEmailDTO) {
    return await this.authService.sendEmail(body);
  }

  @Post('send/forgot/email')
  @HttpCode(200)
  @ApiBody({
    description: 'Rota para enviar email com codigo de recuperacao de senha',
    required: true,
    schema: {
      example: {
        email: 'xs.salles@gmail.com',
      },
    },
  })
  @ApiResponse({
    description: 'Resposta de sucesso para o envio do email de recuperacao',
    status: 200,
    schema: {
      example: {
        message: 'Codigo de recuperacao enviado para o email ...',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Email não encontrado no sistema',
    schema: {
      example: {
        statusCode: 404,
        message: 'Email não cadastrado',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Código já foi enviado há menos de 15 minutos',
    schema: {
      example: {
        statusCode: 409,
        message: 'Código já enviado',
        error: 'Conflict',
      },
    },
  })
  async sendForgotEmailCode(@Body() body: SendCodeEmailDTO) {
    return await this.authService.sendForgotPasswordEmail(body);
  }

  @Post('validate/email')
  @ApiHeader({
    name: 'x-security-token',
    description: 'Token para validação e autenticação',
    required: true,
  })
  @ApiBody({
    description: 'Validar o codigo enviado pelo email',
    required: true,
    schema: {
      example: {
        email: 'xs.salles@gmail.com',
        code: '123456',
      },
    },
  })
  @ApiResponse({
    description: 'Rota de sucesso e envio dos tokens',
    schema: {
      example: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
        refresh_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Acesso não autorizado',
        error: 'Unauthorized',
      },
    },
  })
  async validateEmailCode(
    @Body() body: ValidateCodeEmailDTO,
    @Headers('x-security-token') token: string,
  ) {
    return await this.authService.validateEmailCode(body, token);
  }

  @Put('complete/citizen')
  @ApiOperation({ summary: 'Completa o cadastro do cidadão após validação de email' })
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
    schema: { example: { statusCode: 401, message: 'Usuário não permitido', error: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    schema: { example: { statusCode: 404, message: 'Usuário não encontrado', error: 'Not Found' } },
  })
  @ApiResponse({
    status: 409,
    description: 'Dados já cadastrados',
    schema: { example: { statusCode: 409, message: 'Dados já cadastrados', error: 'Conflict' } },
  })
  async completeCitizenInformation(
    @Body() body: CompleteCitizenRegisterDTO,
    @Headers('x-security-token') token: string
  ) {
    return await this.authService.completeCitizenInformation(body, token)
  }

  @Put('complete/lawyer')
  @ApiOperation({ summary: 'Completa o cadastro do advogado após validação de email' })
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
    schema: { example: { statusCode: 401, message: 'Usuário não permitido', error: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    schema: { example: { statusCode: 404, message: 'Usuário não encontrado', error: 'Not Found' } },
  })
  @ApiResponse({
    status: 409,
    description: 'Dados já cadastrados',
    schema: { example: { statusCode: 409, message: 'Dados já cadastrados', error: 'Conflict' } },
  })
  async completeLayerInformation(
    @Body() body: CompleteLawyerRegisterDTO,
    @Headers('x-security-token') token: string
  ) {
    return await this.authService.completeLawyerInformation(body, token)
  }

  @Patch('change-password')
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Altera a senha do usuário autenticado' })
  @ApiBody({
    type: ChangePasswordDTO,
    examples: {
      default: {
        summary: 'Troca de senha',
        value: {
          currentPassword: '@Za12345678',
          newPassword: '@Za87654321',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Senha alterada com sucesso',
    schema: { example: { message: 'Senha atualizada com sucesso' } },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou senha atual incorreta',
    schema: { example: { statusCode: 401, message: 'Senha incorreta', error: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário autenticado não encontrado',
    schema: { example: { statusCode: 404, message: 'Usuário não encontrado', error: 'Not Found' } },
  })
  @ApiResponse({
    status: 409,
    description: 'Nova senha igual à senha anterior',
    schema: { example: { statusCode: 409, message: 'Senha não pode ser igual a anterior', error: 'Conflict' } },
  })
  async changePassword(@Body() body: ChangePasswordDTO, @Req() req: RequestUser) {
    return await this.authService.changePassword(body, req.user.sub)
  }

  @Post('forgot/password')
  @ApiBody({
    description: 'Rota para redefinir senha apos validacao de codigo',
    required: true,
    schema: {
      example: {
        email: 'xs.salles@gmail.com',
        new_password: '@Za12345678',
      },
    },
  })
  @ApiResponse({
    description: 'Resposta de sucesso para alteracao de senha',
    status: 200,
    schema: {
      example: {
        message: 'Senha alterada com sucesso',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Resposta de erro para usuário não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário não encontrado no sistema',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Resposta de erro para alteração de senha',
    schema: {
      example: {
        statusCode: 401,
        message: 'Senha muito fraca',
        error: 'Unauthorized',
      },
    },
  })
  async forgotPassword(@Body() body: ForgotPasswordDTO) {
    return await this.authService.forgotPassword(body);
  }

  @Post('forgot/verify-code')
  @ApiBody({
    description: 'Rota para validar codigo de recuperacao de senha',
    required: true,
    schema: {
      example: {
        email: 'xs.salles@gmail.com',
        code: '123456',
      },
    },
  })
  @ApiResponse({
    description: 'Resposta de sucesso da validacao do codigo de recuperacao',
    status: 200,
    schema: {
      example: {
        message: 'Codigo validado com sucesso',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Código inválido ou espirado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Código inválido ou expirado',
        error: 'Unauthorized',
      },
    },
  })
  async verifyForgotCode(@Body() body: VerifyForgotCodeDTO) {
    return await this.authService.verifyForgotCode(body);
  }
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Inicia autenticação OAuth com Google' })
  @ApiQuery({
    name: 'state',
    required: true,
    description: 'Perfil de cadastro desejado no fluxo OAuth',
    example: 'citizen',
  })
  @ApiResponse({ status: 302, description: 'Redirecionamento para consentimento do Google' })
  async googleLogin() { }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @UseInterceptors(SecurityTokenInterceptor)
  @ApiOperation({ summary: 'Callback da autenticação Google e retorno do perfil autenticado' })
  @ApiQuery({
    name: 'state',
    required: false,
    description: 'Perfil enviado no início do OAuth: citizen ou lawyer',
    example: 'lawyer',
  })
  @ApiResponse({
    description: 'Retorno de sucesso da autenticação com o Google',
    status: 200,
    schema: {
      example: {
        validated: true,
        sub: '47ff0575-8976-4316-877d-936a2b1d478c',
        role: 'User ou Lawyer',
        email: 'xs.salles@gmail.com',
        full_name: 'Pedro Sales',
        loggedWithGoogle: true,
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
  @ApiResponse({
    status: 409,
    description: 'Email já está cadastrado em outro tipo de conta',
    schema: { example: { statusCode: 409, message: 'Usuário já cadastrado', error: 'Conflict' } },
  })
  async googleUserCallback(@Req() req) {
    const role = req.query.state;

    if (role === 'lawyer') {
      return this.authService.authenticateGoogleLawyer(
        req.user.email,
        `${req.user.firstName} ${req.user.lastName}`,
      );
    } else if (role === 'citizen') {
      return this.authService.authenticateGoogleCitizen(
        req.user.email,
        `${req.user.firstName} ${req.user.lastName}`,
      );
    }

    return this.authService.authenticateGoogleCitizen(
      req.user.email,
      `${req.user.firstName} ${req.user.lastName}`,
    );
  }
}
